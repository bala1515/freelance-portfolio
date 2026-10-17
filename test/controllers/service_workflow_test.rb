require "test_helper"

class ServiceWorkflowTest < ActionDispatch::IntegrationTest
  include Devise::Test::IntegrationHelpers
  self.fixture_table_names = []
  API = "/api/pxhtrqvnmzklsac/services"

  setup do
    @user = User.create!(email: "services-workflow@example.test", password: "password123")
    @service = @user.services.find_by!(legacy_id: 1)
    sign_in @user
  end

  def bill_attributes(service = @service)
    { customer_name: "Service Customer", customer_phone: "9876543210", service: "Client text", subtotal: 1, discount: 0, discount_type: "flat", gst: false, payment_method: "cash", items: [{ service_id: service.token, name: "Client name", price: 1, qty: 1, staff_id: "1" }] }
  end

  test "services page renders and existing defaults are available" do
    assert_equal 8, @user.services.count
    get "/yqnvtxpkrmhlzcs/services"
    assert_response :success
    assert_select "#services"
    get API, as: :json
    assert_response :success
    assert_equal 8, response.parsed_body.dig("counts", "active")
  end

  test "creates service with validated pricing and calculated member price" do
    assert_difference "Service.count", 1 do
      post API, params: { service: { name: "Signature styling", category: "Hair", price: 1000, duration_minutes: 60, description: "A personalised styling service", active: true } }, as: :json
      assert_response :created
    end
    assert_equal BigDecimal("850"), response.parsed_body.dig("service", "member_price").to_d
    assert_equal @user.id, Service.last.user_id
    assert_equal response.parsed_body.dig("service", "token"), response.parsed_body.dig("service", "id")
  end

  test "rejects duplicate names invalid categories prices and durations" do
    assert_no_difference "Service.count" do
      post API, params: { service: { name: " haircut ", category: "Hair", price: 200, duration_minutes: 30 } }, as: :json
      assert_response :unprocessable_entity
      post API, params: { service: { name: "Invalid", category: "Unknown", price: -1, duration_minutes: 1.5 } }, as: :json
      assert_response :unprocessable_entity
      post API, params: { service: { name: "Fractional", category: "Hair", price: "12.345", duration_minutes: 30 } }, as: :json
      assert_response :unprocessable_entity
    end
  end

  test "archive and restore change billing availability without deleting the service" do
    patch "#{API}/#{@service.token}", params: { service: { active: false } }, as: :json
    assert_response :success
    get API, params: { for_billing: true }, as: :json
    assert_not_includes response.parsed_body["services"].map { |service| service["token"] }, @service.token
    get API, params: { status: "archived", category: "Hair", q: "Haircut" }, as: :json
    assert_equal [@service.token], response.parsed_body["services"].map { |service| service["token"] }
    patch "#{API}/#{@service.token}", params: { service: { active: true } }, as: :json
    assert_response :success
    assert @service.reload.active?
  end

  test "new bill uses catalogue name and price instead of submitted values" do
    post "/api/kmxgyaevmqogavk/create_bill", params: { billing: bill_attributes }, as: :json
    assert_response :created
    bill = @user.billings.last
    assert_equal 200, bill.subtotal
    assert_equal "Haircut x1", bill.service
    assert_equal "Haircut", bill.items.first["name"]
    assert_equal BigDecimal("200"), bill.items.first["price"].to_d
    assert_equal 200, response.parsed_body.dig("billing", "total").to_d
  end

  test "service changes and archiving preserve existing invoice snapshots during edit" do
    bill = @user.billings.create!(bill_attributes)
    @service.update!(name: "New Haircut", price: 350, active: false)
    attributes = bill_attributes.merge(items: [{ service_id: @service.token, name: "Changed", price: 1, qty: 2, staff_id: "1" }])
    patch "/api/zvpkqndtxhrmfls/bills/#{bill.token}", params: { billing: attributes }, as: :json
    assert_response :success
    assert_equal "Haircut x2", bill.reload.service
    assert_equal 400, bill.subtotal
    assert_equal 200, bill.items.first["price"].to_d
  end

  test "unavailable and other workspace services cannot be added to new bills" do
    other = User.create!(email: "other-services@example.test", password: "password123")
    other_service = other.services.first
    @service.update!(active: false)
    assert_no_difference "Billing.count" do
      post "/api/kmxgyaevmqogavk/create_bill", params: { billing: bill_attributes }, as: :json
      assert_response :unprocessable_entity
      post "/api/kmxgyaevmqogavk/create_bill", params: { billing: bill_attributes(other_service) }, as: :json
      assert_response :unprocessable_entity
    end
    patch "#{API}/#{other_service.token}", params: { service: { price: 1 } }, as: :json
    assert_response :not_found
    assert_not_equal 1, other_service.reload.price
  end

  test "member discount applies to catalogue prices and invalid quantities are rejected" do
    customer = @user.customers.create!(name: "Service Customer", phone: "9876543210")
    customer.renew_membership!(payment_method: "cash", request_key: SecureRandom.uuid)
    post "/api/kmxgyaevmqogavk/create_bill", params: { billing: bill_attributes }, as: :json
    assert_response :created
    assert_equal 170, @user.billings.last.total
    invalid = bill_attributes
    invalid[:items].first[:qty] = 0
    assert_no_difference "Billing.count" do
      post "/api/kmxgyaevmqogavk/create_bill", params: { billing: invalid }, as: :json
      assert_response :unprocessable_entity
    end
  end
end