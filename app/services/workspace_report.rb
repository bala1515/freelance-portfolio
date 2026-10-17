class WorkspaceReport
  PERIODS = %w[daily weekly monthly yearly].freeze
  ZONE = "Asia/Kolkata"

  def initialize(user, period:, date:)
    raise ArgumentError, "Choose daily, weekly, monthly or yearly." unless PERIODS.include?(period)
    @user = user
    @period = period
    @date = date.present? ? Date.iso8601(date) : Customer.today
    raise ArgumentError, "Choose a date between 1900 and 2100." unless (1900..2100).cover?(@date.year)
    @start = case period
    when "daily" then @date
    when "weekly" then @date.beginning_of_week(:monday)
    when "monthly" then @date.beginning_of_month
    when "yearly" then @date.beginning_of_year
    end
    @finish = case period
    when "daily" then @start + 1.day
    when "weekly" then @start + 7.days
    when "monthly" then @start.next_month
    when "yearly" then @start.next_year
    end
  rescue Date::Error
    raise ArgumentError, "Choose a valid date."
  end

  def call
    from = @start.in_time_zone(ZONE).beginning_of_day
    until_time = @finish.in_time_zone(ZONE).beginning_of_day
    bills = @user.billings.where(created_at: from...until_time).order(:created_at).to_a
    renewals = MembershipRenewal.joins(:customer).where(customers: { user_id: @user.id }).where(created_at: from...until_time).to_a
    series = build_series
    payments = %w[cash upi card].index_with { |method| { method: method, amount_cents: 0, transactions: 0 } }
    services = 0
    memberships = 0
    taxes = 0
    discounts = 0
    bills.each do |bill|
      amount = cents(bill.total)
      services += amount
      taxes += cents(bill.tax)
      discounts += cents(bill.percentage? ? bill.subtotal * bill.discount / 100 : bill.discount)
      series[bucket(bill.created_at)][:service_cents] += amount
      payments[bill.payment_method][:amount_cents] += amount
      payments[bill.payment_method][:transactions] += 1
    end
    renewals.each do |renewal|
      amount = cents(renewal.amount)
      memberships += amount
      series[bucket(renewal.created_at)][:membership_cents] += amount
      payments[renewal.payment_method][:amount_cents] += amount
      payments[renewal.payment_method][:transactions] += 1
    end
    breakdown = BillItemSummary.new(@user, bills).call
    {
      period: @period,
      date: @date.iso8601,
      range: { from: @start.iso8601, to: (@finish - 1.day).iso8601, timezone: ZONE },
      totals: { total_collections: (services + memberships) / 100.0, service_collections: services / 100.0, membership_collections: memberships / 100.0, gst_collected: taxes / 100.0, discounts: discounts / 100.0, net_service_revenue: (services - taxes) / 100.0, bill_count: bills.length, customers_count: bills.map(&:customer_id).uniq.length, renewal_count: renewals.length, average_bill: bills.empty? ? 0 : (services / 100.0 / bills.length).round(2) },
      series: series.values.map { |row| row.except(:service_cents, :membership_cents).merge(services: row[:service_cents] / 100.0, memberships: row[:membership_cents] / 100.0, total: (row[:service_cents] + row[:membership_cents]) / 100.0) },
      payments: payments.values.map { |row| row.except(:amount_cents).merge(amount: row[:amount_cents] / 100.0) },
      top_services: breakdown[:services].first(8),
      staff: breakdown[:staff].first(10),
      coverage: breakdown.slice(:unitemised_bills, :unassigned_services),
      recent_bills: bills.last(8).reverse.map { |bill| bill.slice(:token, :customer_name, :total, :payment_method, :created_at) }
    }
  end

  private

  def cents(value)
    (value.to_d * 100).round.to_i
  end

  def bucket(time)
    local = time.in_time_zone(ZONE)
    return local.hour.to_s if @period == "daily"
    return local.month.to_s if @period == "yearly"
    local.to_date.iso8601
  end

  def build_series
    if @period == "daily"
      (0..23).index_with { |hour| { key: hour.to_s, label: format("%02d:00", hour), services: 0, service_cents: 0, membership_cents: 0 } }.transform_keys(&:to_s)
    elsif @period == "yearly"
      (1..12).index_with { |month| { key: month.to_s, label: Date::ABBR_MONTHNAMES[month], service_cents: 0, membership_cents: 0 } }.transform_keys(&:to_s)
    else
      (@start...@finish).index_with { |day| { key: day.iso8601, label: @period == "weekly" ? day.strftime("%a") : day.strftime("%d %b"), service_cents: 0, membership_cents: 0 } }.transform_keys(&:iso8601)
    end
  end
end