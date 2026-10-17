class Billing < ApplicationRecord
  GST_RATE = 18
  attr_accessor :membership_offer_requested

  belongs_to :user
  belongs_to :customer, autosave: true
  has_secure_token :token

  enum :discount_type,  { flat: "flat", percentage: "percentage" }, validate: true
  enum :payment_method, { cash: "cash", upi: "upi", card: "card" }, validate: true

  validates :customer_name, presence: true, length: { maximum: 100 }
  validates :customer_phone, format: { with: /\A[6-9]\d{9}\z/, message: "must be a valid 10 digit number" }
  validates :service, presence: true, length: { maximum: 200 }
  validates :subtotal, numericality: { greater_than: 0 }
  validates :discount, numericality: { greater_than_or_equal_to: 0 }
  validate  :discount_within_limit

  before_validation :apply_catalog_items
  before_validation :assign_customer
  before_validation :apply_membership_discount
  before_validation :calculate_totals
  validate :customer_belongs_to_user
  validate :membership_offer_is_available

  private

  def apply_catalog_items
    return if items.blank? || user.nil?
    unless items.is_a?(Array) && items.all? { |item| item.is_a?(Hash) }
      errors.add(:items, "must be a list of services")
      return
    end
    original_items = persisted? && items_in_database.is_a?(Array) ? items_in_database : []
    normalized = items.filter_map do |item|
      identifier = item["service_id"].to_s
      quantity = item["qty"].to_s
      unless quantity.match?(/\A[1-9]\d{0,2}\z/)
        errors.add(:items, "quantity must be a whole number between 1 and 999")
        next
      end
      original = original_items.find { |saved| saved["service_id"].to_s == identifier }
      if original
        snapshot = original.slice("service_id", "name", "price", "legacy")
      elsif persisted? && items_in_database.blank? && identifier == "legacy-#{token}"
        snapshot = { "service_id" => identifier, "name" => service_in_database, "price" => subtotal_in_database.to_s, "legacy" => true }
      else
        catalog_service = user.services.find_by(token: identifier, active: true)
        catalog_service ||= user.services.find_by(legacy_id: identifier.to_i, active: true) if identifier.match?(/\A\d+\z/)
        unless catalog_service
          errors.add(:items, "include a service that is unavailable. Refresh the service list and try again.")
          next
        end
        snapshot = { "service_id" => catalog_service.token, "name" => catalog_service.name, "price" => catalog_service.price.to_s }
      end
      staff = staff_snapshot(item["staff_id"].to_s, original, snapshot["legacy"] )
      next unless staff
      snapshot.merge(staff).merge("qty" => quantity.to_i)
    end
    return if errors[:items].any?
    self.items = normalized
    self.subtotal = normalized.sum { |item| BigDecimal(item["price"].to_s) * item["qty"] }
    self.service = normalized.map { |item| item["legacy"] && item["qty"] == 1 ? item["name"] : "#{item['name']} x#{item['qty']}" }.join(", ")
  end
  def staff_snapshot(identifier, original, legacy)
    if original && identifier.present? && original["staff_id"].to_s == identifier
      member = user.staff_members.find_by(token: identifier)
      member ||= user.staff_members.find_by(legacy_id: identifier.to_i) if identifier.match?(/\A\d+\z/)
      return { "staff_id" => member&.token || identifier, "staff_name" => original["staff_name"].presence || member&.name || "Staff not recorded" }
    end
    return { "staff_id" => "", "staff_name" => "" } if legacy && identifier.blank?
    member = user.staff_members.find_by(token: identifier, active: true)
    member ||= user.staff_members.find_by(legacy_id: identifier.to_i, active: true) if identifier.match?(/\A\d+\z/)
    unless member
      errors.add(:items, "must have an active staff member assigned to each service")
      return nil
    end
    { "staff_id" => member.token, "staff_name" => member.name }
  end
  def assign_customer
    return unless user && customer_phone.present?
    self.customer = user.customers.find_or_initialize_by(phone: customer_phone)
    customer.name = customer_name if customer_name.present?
  end

  def apply_membership_discount
    historic_offer = persisted? && membership_discount_applied? && !will_save_change_to_customer_phone?
    if customer&.membership_active? || historic_offer
      self.discount = Customer::MEMBERSHIP_DISCOUNT
      self.discount_type = "percentage"
      self.membership_discount_applied = true
    elsif membership_discount_applied?
      self.discount = 0
      self.discount_type = "percentage"
      self.membership_discount_applied = false
    end
  end

  def membership_offer_is_available
    if ActiveModel::Type::Boolean.new.cast(membership_offer_requested) && !membership_discount_applied?
      errors.add(:base, "Membership is no longer active. Refresh customer details before saving.")
    end
  end
  def customer_belongs_to_user
    errors.add(:customer, "must belong to your workspace") if customer && customer.user_id != user_id
  end

  def calculate_totals
    return if subtotal.blank? || discount.blank?

    discount_amount = percentage? ? subtotal * discount / 100 : discount
    taxable = [subtotal - discount_amount, 0].max

    self.tax   = gst? ? (taxable * GST_RATE / 100).round(2) : 0
    self.total = taxable + tax
  end

  def discount_within_limit
    return if subtotal.blank? || discount.blank?

    if percentage? && discount > 100
      errors.add(:discount, "cannot exceed 100%")
    elsif flat? && discount > subtotal
      errors.add(:discount, "cannot exceed subtotal")
    end
  end
end