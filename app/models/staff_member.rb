class StaffMember < ApplicationRecord
  DEFAULT_NAMES = %w[Ravi Priya Karthik].freeze
  belongs_to :user
  has_secure_token :token
  before_validation :normalize_details
  validates :name, presence: true, length: { maximum: 100 }
  validates :role, presence: true, length: { maximum: 60 }
  validates :joined_on, presence: true
  validates :active, inclusion: { in: [true, false] }
  validates :phone, allow_blank: true, format: { with: /\A[6-9]\d{9}\z/, message: "must be a valid 10 digit mobile number" }, uniqueness: { scope: :user_id }
  validates :email, allow_blank: true, format: { with: URI::MailTo::EMAIL_REGEXP }, length: { maximum: 254 }

  private

  def normalize_details
    self.name = name.to_s.strip
    self.role = role.to_s.strip
    self.phone = phone.to_s.strip.presence
    self.email = email.to_s.strip.downcase.presence
    self.joined_on ||= Customer.today
  end
end