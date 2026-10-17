class StaffMembersController < ApplicationController
  def index
  end

  def list
    scope = current_user.staff_members
    counts = { total: scope.count, active: scope.where(active: true).count, inactive: scope.where(active: false).count }
    if ActiveModel::Type::Boolean.new.cast(params[:for_billing])
      return render json: { staff: scope.where(active: true).order(:name).map { |member| member_json(member) } }
    end
    scope = scope.where(active: params[:status] == "active") if %w[active inactive].include?(params[:status])
    if params[:q].present?
      term = "%#{StaffMember.sanitize_sql_like(params[:q].to_s.strip)}%"
      scope = scope.where("name LIKE ? OR role LIKE ? OR phone LIKE ?", term, term, term)
    end
    page = [params[:page].to_i, 1].max
    total = scope.count
    activity = BillItemSummary.new(current_user, current_user.billings.select(:id, :items)).call
    stats = activity[:staff].index_by { |row| row[:token] }
    render json: { staff: scope.order(active: :desc, name: :asc).offset((page - 1) * 12).limit(12).map { |member| member_json(member).merge(stats[member.token]&.slice(:quantity, :gross_value) || { quantity: 0, gross_value: 0 }) }, counts: counts.merge(recorded_services: activity[:staff].sum { |row| row[:quantity] }), pagination: { page: page, total: total, pages: (total / 12.0).ceil } }
  end

  def create
    member = current_user.staff_members.build(member_params)
    save_member(member, :created)
  end

  def update
    member = current_user.staff_members.find_by!(token: params[:token])
    member.assign_attributes(member_params)
    save_member(member, :ok)
  end

  private

  def member_params
    params.expect(staff_member: [:name, :role, :phone, :email, :joined_on, :active])
  end

  def member_json(member)
    member.as_json(only: [:token, :name, :role, :phone, :email, :joined_on, :active]).merge(id: member.token)
  end

  def save_member(member, status)
    if member.save
      render json: { staff_member: member_json(member) }, status: status
    else
      render json: { errors: member.errors.full_messages }, status: :unprocessable_entity
    end
  rescue ActiveRecord::RecordNotUnique
    render json: { errors: ["This mobile number is already assigned to a staff member."] }, status: :conflict
  end
end