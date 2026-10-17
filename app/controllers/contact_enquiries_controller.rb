class ContactEnquiriesController < ApplicationController
  skip_before_action :authenticate_user!, only: :create
  rate_limit to: 5, within: 10.minutes, only: :create,
    with: -> { render json: { error: "Too many messages. Please try again later." }, status: :too_many_requests }

  def create
    enquiry = ContactEnquiry.new(params.permit(:name, :email, :idea).to_h.transform_values { |value| value.to_s.strip })
    unless enquiry.valid?
      return render json: { error: enquiry.errors.full_messages.to_sentence }, status: :unprocessable_entity
    end
    if Rails.env.production? && ENV["CONTACT_EMAIL_ENABLED"] != "true"
      return render json: { error: "Email is not available yet. Please contact me on WhatsApp." }, status: :service_unavailable
    end

    ContactMailer.enquiry(enquiry).deliver_now
    render json: { message: "Thanks! Your enquiry has been sent. I’ll get back to you by email." }
  rescue StandardError => error
    Rails.logger.error("Contact delivery failed: #{error.class}")
    render json: { error: "Your message could not be sent. Please try again, or contact me on WhatsApp." }, status: :service_unavailable
  end
end
