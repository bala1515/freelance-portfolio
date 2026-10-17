class MembershipRenewal < ApplicationRecord
  belongs_to :customer
  enum :payment_method, { cash: "cash", upi: "upi", card: "card" }, validate: true
  validates :amount, numericality: { equal_to: Customer::MEMBERSHIP_FEE }
  validates :starts_on, :expires_on, presence: true
  validates :request_key, presence: true, uniqueness: true, format: { with: /\A[a-zA-Z0-9-]{16,64}\z/ }
end