class ServicesController < ApplicationController
  def index
  end

  def list
    scope = current_user.services
    counts = { total: scope.count, active: scope.where(active: true).count, archived: scope.where(active: false).count, categories: scope.distinct.count(:category) }
    if ActiveModel::Type::Boolean.new.cast(params[:for_billing])
      return render json: { services: scope.where(active: true).order(:category, :name).map { |service| service_json(service) }, categories: Service::CATEGORIES }
    end
    if params[:q].present?
      term = "%#{Service.sanitize_sql_like(params[:q].to_s.strip)}%"
      scope = scope.where("name LIKE ? OR description LIKE ?", term, term)
    end
    scope = scope.where(category: params[:category]) if Service::CATEGORIES.include?(params[:category])
    scope = scope.where(active: params[:status] == "active") if %w[active archived].include?(params[:status])
    page = [params[:page].to_i, 1].max
    count = scope.count
    render json: { services: scope.order(active: :desc, category: :asc, name: :asc).offset((page - 1) * 12).limit(12).map { |service| service_json(service) }, counts: counts, categories: Service::CATEGORIES, pagination: { page: page, total: count, pages: (count / 12.0).ceil }, membership_discount: Customer::MEMBERSHIP_DISCOUNT }
  end

  def create
    service = current_user.services.build(service_params)
    if service.save
      render json: { service: service_json(service) }, status: :created
    else
      render json: { errors: service.errors.full_messages }, status: :unprocessable_entity
    end
  rescue ActiveRecord::RecordNotUnique
    render json: { errors: ["A service with this name already exists in the category."] }, status: :conflict
  end

  def update
    service = current_user.services.find_by!(token: params[:token])
    if service.update(service_params)
      render json: { service: service_json(service) }
    else
      render json: { errors: service.errors.full_messages }, status: :unprocessable_entity
    end
  rescue ActiveRecord::RecordNotUnique
    render json: { errors: ["A service with this name already exists in the category."] }, status: :conflict
  end

  private

  def service_params
    params.expect(service: [:name, :category, :price, :duration_minutes, :description, :active])
  end

  def service_json(service)
    service.as_json(only: [:token, :name, :category, :price, :duration_minutes, :description, :active]).merge(id: service.token, member_price: service.member_price)
  end
end