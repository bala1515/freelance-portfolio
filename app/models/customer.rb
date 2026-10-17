class Customer < ApplicationRecord
  MEMBERSHIP_FEE = 1500
  MEMBERSHIP_DISCOUNT = 15

  belongs_to :user
  has_many :billings, dependent: :restrict_with_error
  has_many :membership_renewals, dependent: :restrict_with_error
  has_secure_token :token

  enum :customer_type, { walk_in: "walk_in", member: "member" }, validate: true

  before_validation :normalize_details
  validates :name, presence: true, length: { maximum: 100 }
  validates :phone, format: { with: /\A[6-9]\d{9}\z/, message: "must be a valid 10 digit mobile number" }, uniqueness: { scope: :user_id }
  validates :membership_started_on, :membership_expires_on, presence: true, if: :member?
  validate :membership_dates_in_order

  def self.today
    Time.current.in_time_zone("Asia/Kolkata").to_date
  end

  def membership_active?
    member? && membership_started_on.present? && membership_expires_on.present? && membership_started_on <= self.class.today && membership_expires_on >= self.class.today
  end

  def membership_status
    return "walk_in" if walk_in?
    membership_active? ? "active" : "expired"
  end

  def renew_membership!(payment_method:, request_key:)
    with_lock do
      existing = membership_renewals.find_by(request_key: request_key)
      if existing
        existing
      else
        active = membership_active?
        start_date = active ? membership_expires_on + 1.day : self.class.today
        end_date = start_date.advance(years: 1) - 1.day
        self.customer_type = "member"
        self.membership_started_on = start_date unless active
        self.membership_expires_on = end_date
        save!
        membership_renewals.create!(amount: MEMBERSHIP_FEE, payment_method: payment_method, request_key: request_key, starts_on: start_date, expires_on: end_date)
      end
    end
  end

  private

  def normalize_details
    self.name = name.to_s.strip
    self.phone = phone.to_s.strip
  end

  def membership_dates_in_order
    if membership_started_on && membership_expires_on && membership_expires_on < membership_started_on
      errors.add(:membership_expires_on, "must be on or after the start date")
    end
  end
end