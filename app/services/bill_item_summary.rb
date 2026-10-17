class BillItemSummary
  def initialize(user, bills)
    @bills = bills
    @staff_lookup = {}
    user.staff_members.each do |member|
      @staff_lookup[member.token] = member
      @staff_lookup[member.legacy_id.to_s] = member if member.legacy_id
    end
    @service_lookup = {}
    user.services.each do |service|
      @service_lookup[service.token] = service
      @service_lookup[service.legacy_id.to_s] = service if service.legacy_id
    end
  end

  def call
    services = {}
    staff = {}
    unitemised_bills = 0
    unassigned_services = 0
    @bills.each do |bill|
      entries = bill.items.is_a?(Array) ? bill.items.reject { |item| !item.is_a?(Hash) || item["legacy"] } : []
      unitemised_bills += 1 if entries.empty?
      entries.each do |item|
        quantity = item["qty"].to_i
        price = BigDecimal(item["price"].to_s, exception: false)
        next unless quantity.positive? && price&.finite? && price >= 0
        amount = (price * quantity * 100).round.to_i
        catalog = @service_lookup[item["service_id"].to_s]
        key = catalog&.token || "name:#{item['name']}"
        service = services[key] ||= { token: catalog&.token, name: catalog&.name || item["name"], quantity: 0, gross_cents: 0 }
        service[:quantity] += quantity
        service[:gross_cents] += amount
        member = @staff_lookup[item["staff_id"].to_s]
        if member
          person = staff[member.token] ||= { token: member.token, name: member.name, quantity: 0, gross_cents: 0 }
          person[:quantity] += quantity
          person[:gross_cents] += amount
        else
          unassigned_services += quantity
        end
      end
    end
    convert = ->(entries) { entries.values.sort_by { |row| [-row[:gross_cents], row[:name].to_s] }.map { |row| row.except(:gross_cents).merge(gross_value: row[:gross_cents] / 100.0) } }
    { services: convert.call(services), staff: convert.call(staff), unitemised_bills: unitemised_bills, unassigned_services: unassigned_services }
  end
end