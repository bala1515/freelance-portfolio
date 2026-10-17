class CustomersController < ApplicationController
  rescue_from ActiveRecord::RecordInvalid, with: :invalid_record
  rescue_from ActiveRecord::RecordNotUnique do
    render json: { errors: ["This phone number or membership payment is already recorded."] }, status: :conflict
  end

  def index
    @customer_kind = params[:kind] == "member" ? "member" : "walk_in"
  end

  def list
    kind = params[:kind] == "member" ? "member" : "walk_in"
    scope = current_user.customers.where(customer_type: kind)
    total = scope.count
    today = Customer.today
    counts = {
      total: total,
      active: scope.where("membership_started_on <= ? AND membership_expires_on >= ?", today, today).count,
      expired: scope.where("membership_expires_on < ?", today).count,
      expiring: scope.where(membership_expires_on: today..(today + 30.days)).count
    }
    if params[:q].present?
      term = "%#{Customer.sanitize_sql_like(params[:q].to_s.strip)}%"
      scope = scope.where("name LIKE ? OR phone LIKE ?", term, term)
    end
    if kind == "member"
      case params[:status]
      when "active" then scope = scope.where("membership_started_on <= ? AND membership_expires_on >= ?", today, today)
      when "expired" then scope = scope.where("membership_expires_on < ?", today)
      when "expiring" then scope = scope.where(membership_expires_on: today..(today + 30.days))
      end
    end
    page = [params[:page].to_i, 1].max
    count = scope.count
    customers = scope.order(updated_at: :desc, id: :desc).offset((page - 1) * 12).limit(12).to_a
    bills = current_user.billings.where(customer_id: customers.map(&:id)).group(:customer_id)
    visits = bills.count
    spending = bills.sum(:total)
    last_visits = bills.maximum(:created_at)
    render json: {
      customers: customers.map { |customer| customer_json(customer).merge(visits: visits[customer.id] || 0, total_spent: spending[customer.id] || 0, last_visit: last_visits[customer.id]) },
      counts: counts,
      pagination: { page: page, total: count, pages: (count / 12.0).ceil },
      membership_fee: Customer::MEMBERSHIP_FEE,
      membership_discount: Customer::MEMBERSHIP_DISCOUNT
    }
  end

  def lookup
    customer = if params[:token].present?
      current_user.customers.find_by(token: params[:token])
    else
      current_user.customers.find_by(phone: params[:phone].to_s)
    end
    render json: { customer: customer && customer_json(customer) }
  end

  def show
    customer = current_user.customers.find_by!(token: params[:token])
    page = [params[:page].to_i, 1].max
    bills = customer.billings.order(created_at: :desc, id: :desc)
    count = bills.count
    render json: {
      customer: customer_json(customer).merge(visits: count, total_spent: bills.sum(:total), last_visit: bills.maximum(:created_at)),
      billings: bills.offset((page - 1) * 15).limit(15).map { |bill| bill.slice(:token, :customer_name, :service, :subtotal, :discount, :discount_type, :tax, :total, :payment_method, :created_at, :items, :membership_discount_applied) },
      renewals: customer.membership_renewals.order(created_at: :desc).limit(10).as_json(only: [:amount, :starts_on, :expires_on, :payment_method, :created_at]),
      pagination: { page: page, pages: (count / 15.0).ceil }
    }
  end

  def create
    attributes = params.expect(customer: [:name, :phone, :customer_type])
    kind = attributes.delete(:customer_type) || "walk_in"
    unless Customer.customer_types.key?(kind)
      return render json: { errors: ["Choose walk-in or member."] }, status: :unprocessable_entity
    end
    if kind == "member" && params[:request_key].present?
      existing = MembershipRenewal.joins(:customer).where(customers: { user_id: current_user.id }).find_by(request_key: params[:request_key])
      return render json: { customer: customer_json(existing.customer) } if existing
    end
    customer = current_user.customers.build(attributes.merge(customer_type: "walk_in"))
    Customer.transaction do
      customer.save!
      customer.renew_membership!(payment_method: params[:payment_method], request_key: params[:request_key]) if kind == "member"
    end
    render json: { customer: customer_json(customer) }, status: :created
  end

  def renew
    customer = current_user.customers.find_by!(token: params[:token])
    renewal = customer.renew_membership!(payment_method: params[:payment_method], request_key: params[:request_key])
    render json: { customer: customer_json(customer.reload), renewal: renewal.as_json(only: [:amount, :starts_on, :expires_on, :payment_method]) }
  end

  private

  def customer_json(customer)
    next_start = customer.membership_active? ? customer.membership_expires_on + 1.day : Customer.today
    customer.as_json(only: [:token, :name, :phone, :customer_type, :membership_started_on, :membership_expires_on, :created_at]).merge(
      next_membership_starts_on: next_start,
      next_membership_expires_on: next_start.advance(years: 1) - 1.day,
      membership_status: customer.membership_status,
      membership_active: customer.membership_active?,
      discount_percentage: customer.membership_active? ? Customer::MEMBERSHIP_DISCOUNT : 0
    )
  end

  def invalid_record(error)
    render json: { errors: error.record.errors.full_messages }, status: :unprocessable_entity
  end
end