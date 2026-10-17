class Service < ApplicationRecord
  CATEGORIES = %w[Hair Skin Nails Other].freeze
  DEFAULTS = [
    { name: "Haircut", category: "Hair", price: 200, duration_minutes: 30 },
    { name: "Beard Trim", category: "Hair", price: 100, duration_minutes: 15 },
    { name: "Hair Color", category: "Hair", price: 800, duration_minutes: 90 },
    { name: "Head Massage", category: "Hair", price: 250, duration_minutes: 30 },
    { name: "Facial", category: "Skin", price: 700, duration_minutes: 60 },
    { name: "Cleanup", category: "Skin", price: 450, duration_minutes: 30 },
    { name: "Manicure", category: "Nails", price: 400, duration_minutes: 45 },
    { name: "Pedicure", category: "Nails", price: 500, duration_minutes: 60 }
  ].freeze

  belongs_to :user
  has_secure_token :token
  before_validation :normalize_details
  validates :name, presence: true, length: { maximum: 80 }, uniqueness: { scope: [:user_id, :category], case_sensitive: false }
  validates :category, inclusion: { in: CATEGORIES }
  validates :price, numericality: { greater_than: 0, less_than_or_equal_to: 99_999_999.99 }
  validates :duration_minutes, numericality: { only_integer: true, greater_than: 0, less_than_or_equal_to: 480 }
  validates :description, length: { maximum: 500 }
  validates :active, inclusion: { in: [true, false] }
  validate :price_has_two_decimal_places

  def member_price
    (price * (100 - Customer::MEMBERSHIP_DISCOUNT) / 100).round(2)
  end

  private

  def normalize_details
    self.name = name.to_s.strip
    self.description = description.to_s.strip
  end

  def price_has_two_decimal_places
    raw_price = BigDecimal(price_before_type_cast.to_s, exception: false)
    errors.add(:price, "must have at most two decimal places") if raw_price && raw_price != raw_price.round(2)
  end
end