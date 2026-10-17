require "test_helper"

class BillingEditTest < ActionDispatch::IntegrationTest
  include Devise::Test::IntegrationHelpers
  self.fixture_table_names = []

  setup do
    @user = User.create!(email: "billing-edit@example.com", password: "password123")
    @billing = @user.billings.create!(customer_name: "Ravi", customer_phone: "9876543210", service: "Haircut x1", subtotal: 200, discount: 0, discount_type: "flat", gst: false, payment_method: "cash")
    sign_in @user
  end

  test "loads complete bill details for the existing form" do
    get "/api/zvpkqndtxhrmfls/bills/#{@billing.token}", as: :json
    assert_response :success
    assert_equal @billing.token, response.parsed_body.dig("billing", "token")
    assert_equal "9876543210", response.parsed_body.dig("billing", "customer_phone")
  end

  test "updates the same bill and persists service items" do
    item = { service_id: 1, name: "Haircut", price: 200, qty: 2, staff_id: "1" }
    assert_no_difference "Billing.count" do
      patch "/api/zvpkqndtxhrmfls/bills/#{@billing.token}", params: { billing: { customer_name: "Priya", service: "Haircut x2", subtotal: 400, discount: 10, discount_type: "percentage", gst: true, payment_method: "upi", items: [item] } }, as: :json
    end
    assert_response :success
    @billing.reload
    assert_equal "Priya", @billing.customer_name
    assert_equal BigDecimal("424.8"), @billing.total
    assert_equal @user.staff_members.find_by!(legacy_id: 1).token, @billing.items.first["staff_id"]
    assert_equal 2, @billing.items.first["qty"]
  end

  test "rejects invalid updates without changing the bill" do
    patch "/api/zvpkqndtxhrmfls/bills/#{@billing.token}", params: { billing: { customer_name: "" } }, as: :json
    assert_response :unprocessable_entity
    assert_equal "Ravi", @billing.reload.customer_name
  end

  test "cannot read or update another users bill" do
    other = User.create!(email: "other-billing@example.com", password: "password123")
    sign_in other
    get "/api/zvpkqndtxhrmfls/bills/#{@billing.token}", as: :json
    assert_response :not_found
    sign_in other
    patch "/api/zvpkqndtxhrmfls/bills/#{@billing.token}", params: { billing: { customer_name: "Changed" } }, as: :json
    assert_response :not_found
    assert_equal "Ravi", @billing.reload.customer_name
  end

  test "new bills store the item details needed for editing" do
    item = { service_id: 1, name: "Haircut", price: 200, qty: 1, staff_id: "2" }
    attributes = @billing.attributes.slice("customer_name", "customer_phone", "service", "subtotal", "discount", "discount_type", "gst", "payment_method").merge("items" => [item])
    assert_difference "Billing.count", 1 do
      post "/api/kmxgyaevmqogavk/create_bill", params: { billing: attributes }, as: :json
    end
    assert_response :created
    saved = @user.billings.find_by!(token: response.parsed_body.dig("billing", "token"))
    assert_equal @user.staff_members.find_by!(legacy_id: 2).token, saved.items.first["staff_id"]
  end
end
