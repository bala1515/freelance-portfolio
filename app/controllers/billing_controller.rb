class BillingController < ApplicationController
  def index
    
  end

  def create_update_bill
    billing = current_user.billings.build(billing_params)

    if billing.save
      render json: {
        success: true,
        billing: billing.slice(:token, :customer_name, :customer_phone, :subtotal, :discount, :discount_type, :tax, :total, :membership_discount_applied, :created_at, :items)
      }, status: :created
    else
      Rails.logger.error "BILL VALIDATION ERRORS: #{billing.errors.full_messages}"
      render json: { success: false, errors: billing.errors.full_messages },status: :unprocessable_entity
    end
  end

  def bill_history
    @billings = current_user.billings.select(:token, :customer_name, :total, :service, :payment_method, :created_at).order(created_at: :desc)
    render json: {success: true, billings: @billings}, status: :ok
  end

  def show
    billing = current_user.billings.find_by!(token: params[:token])
    render json: { billing: billing }
  end

  def update
    billing = current_user.billings.find_by!(token: params[:token])

    if billing.update(billing_params)
      render json: { success: true, billing: billing }
    else
      render json: { success: false, errors: billing.errors.full_messages }, status: :unprocessable_entity
    end
  end

  private

  def billing_params
    params.expect(billing: [:customer_name, :customer_phone, :service, :subtotal, :discount, :discount_type, :gst, :payment_method, :membership_offer_requested, items: [[:service_id, :name, :price, :qty, :staff_id, :legacy]]])
  end
end
