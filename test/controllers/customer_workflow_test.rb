require "test_helper"

class CustomerWorkflowTest < ActionDispatch::IntegrationTest
  include Devise::Test::IntegrationHelpers
  self.fixture_table_names = []
  API = "/api/htrqzvlncpxmkas/customers"

  setup do
    @user = User.create!(email: "customer-workflow@example.test", password: "password123")
    sign_in @user
  end

  def customer_attributes
    { name: "Ananya", phone: "9876543210", customer_type: "walk_in" }
  end

  def bill_attributes
    { customer_name: "Ananya", customer_phone: "9876543210", service: "Haircut x1, Facial x1", subtotal: 900, discount: 0, discount_type: "flat", gst: false, payment_method: "cash" }
  end

  test "customer screens render the appropriate directory" do
    get "/tqzprmvlhcnxkas/customers/walk-ins"
    assert_response :success
    assert_select "#customers[data-kind=walk_in]"
    get "/tqzprmvlhcnxkas/customers/members"
    assert_response :success
    assert_select "#customers[data-kind=member]"
  end

  test "walk-in customers are created and duplicate phone numbers are rejected" do
    assert_difference "Customer.count", 1 do
      post API, params: { customer: customer_attributes }, as: :json
      assert_response :created
    end
    assert_equal "walk_in", response.parsed_body.dig("customer", "membership_status")
    assert_no_difference "Customer.count" do
      post API, params: { customer: customer_attributes }, as: :json
      assert_response :unprocessable_entity
    end
  end

  test "saving bills creates and reuses a walk-in customer with complete history" do
    first = @user.billings.create!(bill_attributes)
    second = @user.billings.create!(bill_attributes.merge(service: "Beard Trim x1", subtotal: 100))
    assert_equal first.customer_id, second.customer_id
    get "#{API}/#{first.customer.token}", as: :json
    assert_response :success
    assert_equal 2, response.parsed_body.dig("customer", "visits")
    assert_equal 1000, response.parsed_body.dig("customer", "total_spent").to_d
    assert_equal ["Beard Trim x1", "Haircut x1, Facial x1"], response.parsed_body["billings"].map { |bill| bill["service"] }
  end

  test "membership signup records exactly 1500 and activates 15 percent savings" do
    travel_to Time.zone.local(2026, 10, 16, 12) do
      key = SecureRandom.uuid
      post API, params: { customer: customer_attributes.merge(customer_type: "member"), payment_method: "upi", request_key: key, amount: 1 }, as: :json
      assert_response :created
      customer = @user.customers.find_by!(phone: "9876543210")
      assert customer.membership_active?
      assert_equal Date.new(2027, 10, 15), customer.membership_expires_on
      assert_equal 1500, customer.membership_renewals.sole.amount
      assert_equal 15, response.parsed_body.dig("customer", "discount_percentage")
      assert_no_difference ["Customer.count", "MembershipRenewal.count"] do
        post API, params: { customer: customer_attributes.merge(customer_type: "member"), payment_method: "upi", request_key: key }, as: :json
        assert_response :success
      end
    end
  end

  test "invalid membership payment rolls back both customer and membership" do
    assert_no_difference ["Customer.count", "MembershipRenewal.count"] do
      post API, params: { customer: customer_attributes.merge(customer_type: "member"), payment_method: "invalid", request_key: SecureRandom.uuid }, as: :json
      assert_response :unprocessable_entity
    end
  end

  test "early renewal preserves remaining days and repeated requests do not add another year" do
    travel_to Time.zone.local(2026, 10, 16, 12) do
      customer = @user.customers.create!(customer_attributes.except(:customer_type))
      customer.renew_membership!(payment_method: "cash", request_key: SecureRandom.uuid)
      key = SecureRandom.uuid
      post "#{API}/#{customer.token}/renew", params: { payment_method: "card", request_key: key }, as: :json
      assert_response :success
      assert_equal Date.new(2028, 10, 15), customer.reload.membership_expires_on
      assert_equal Date.new(2027, 10, 16), response.parsed_body.dig("renewal", "starts_on").to_date
      assert_no_difference "MembershipRenewal.count" do
        post "#{API}/#{customer.token}/renew", params: { payment_method: "card", request_key: key }, as: :json
        assert_response :success
      end
      assert_equal Date.new(2028, 10, 15), customer.reload.membership_expires_on
    end
  end

  test "active member savings are enforced on the server before GST" do
    customer = @user.customers.create!(customer_attributes.except(:customer_type))
    customer.renew_membership!(payment_method: "cash", request_key: SecureRandom.uuid)
    post "/api/kmxgyaevmqogavk/create_bill", params: { billing: bill_attributes.merge(discount: 99, discount_type: "percentage", gst: true) }, as: :json
    assert_response :created
    bill = @user.billings.last
    assert_equal 15, bill.discount
    assert bill.membership_discount_applied?
    assert_equal BigDecimal("137.7"), bill.tax
    assert_equal BigDecimal("902.7"), bill.total
  end

  test "expired members receive no new automatic discount and renew from today" do
    travel_to Time.zone.local(2026, 10, 16, 12) do
      customer = @user.customers.create!(customer_attributes.merge(customer_type: "member", membership_started_on: "2025-10-01", membership_expires_on: "2026-09-30"))
      bill = @user.billings.create!(bill_attributes)
      assert_not bill.membership_discount_applied?
      assert_equal 900, bill.total
      customer.renew_membership!(payment_method: "upi", request_key: SecureRandom.uuid)
      assert_equal Date.new(2026, 10, 16), customer.reload.membership_started_on
      assert_equal Date.new(2027, 10, 15), customer.membership_expires_on
    end
  end

  test "editing a historical member bill preserves its recorded savings after expiry" do
    customer = @user.customers.create!(customer_attributes.except(:customer_type))
    customer.renew_membership!(payment_method: "cash", request_key: SecureRandom.uuid)
    bill = @user.billings.create!(bill_attributes)
    customer.update!(membership_started_on: Customer.today - 2.years, membership_expires_on: Customer.today - 1.day)
    bill.update!(customer_name: "Ananya Updated", discount: 0)
    assert_equal 15, bill.reload.discount
    assert bill.membership_discount_applied?
    bill.update!(customer_phone: "9876543211", discount: 15)
    assert_not bill.reload.membership_discount_applied?
    assert_equal 0, bill.discount
  end

  test "customers phone lookup history and renewals are scoped to the signed in workspace" do
    other = User.create!(email: "private-customers@example.test", password: "password123")
    customer = other.customers.create!(customer_attributes.except(:customer_type))
    get API, params: { kind: "walk_in" }, as: :json
    assert_equal 0, response.parsed_body.dig("counts", "total")
    get "#{API}/lookup", params: { phone: customer.phone }, as: :json
    assert_nil response.parsed_body["customer"]
    get "#{API}/#{customer.token}", as: :json
    assert_response :not_found
    sign_in @user
    assert_no_difference "MembershipRenewal.count" do
      post "#{API}/#{customer.token}/renew", params: { payment_method: "cash", request_key: SecureRandom.uuid }, as: :json
      assert_response :not_found
    end
    sign_in @user
    post API, params: { customer: customer_attributes }, as: :json
    assert_response :created
  end

  test "an expired automatic membership quote cannot be saved as a manual discount" do
    @user.customers.create!(customer_attributes.merge(customer_type: "member", membership_started_on: Customer.today - 2.years, membership_expires_on: Customer.today - 1.day))
    assert_no_difference "Billing.count" do
      post "/api/kmxgyaevmqogavk/create_bill", params: { billing: bill_attributes.merge(discount: 15, discount_type: "percentage", membership_offer_requested: true) }, as: :json
      assert_response :unprocessable_entity
    end
    assert response.parsed_body["errors"].any? { |message| message.include?("Membership is no longer active") }
  end
  test "member directory filters active and expired members and searches by phone" do
    active = @user.customers.create!(customer_attributes.except(:customer_type))
    active.renew_membership!(payment_method: "cash", request_key: SecureRandom.uuid)
    @user.customers.create!(name: "Expired", phone: "9876543211", customer_type: "member", membership_started_on: Customer.today - 2.years, membership_expires_on: Customer.today - 1.day)
    get API, params: { kind: "member", status: "active", q: "9876543210" }, as: :json
    assert_response :success
    assert_equal 1, response.parsed_body.dig("counts", "active")
    assert_equal 1, response.parsed_body.dig("counts", "expired")
    assert_equal [active.token], response.parsed_body["customers"].map { |customer| customer["token"] }
  end
end