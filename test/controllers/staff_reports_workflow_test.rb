require "test_helper"

class StaffReportsWorkflowTest < ActionDispatch::IntegrationTest
  include Devise::Test::IntegrationHelpers
  self.fixture_table_names = []
  STAFF = "/api/lxqrmvntzhkpcas/staff"
  REPORT = "/api/rxqmvtnzhklpcas/reports"

  setup do
    @user = User.create!(email: "staff-reports@example.test", password: "password123")
    @staff = @user.staff_members.first
    @service = @user.services.find_by!(legacy_id: 1)
    sign_in @user
  end

  def bill_at(time, payment = "cash")
    @user.billings.create!(customer_name: "Report Client", customer_phone: "9876543210", service: "Haircut", subtotal: 1, discount: 10, discount_type: "percentage", gst: true, payment_method: payment, created_at: time, items: [{ service_id: @service.token, qty: 2, staff_id: @staff.token }])
  end

  test "staff pages create edit filter and preserve availability" do
    get "/mztqvnrkphxlcas/staff"
    assert_response :success
    get "/vhqntzmrkpxlcas/reports"
    assert_response :success
    assert_equal 3, @user.staff_members.count
    post STAFF, params: { staff_member: { name: " Anu ", role: "Senior stylist", phone: "9876543211", active: true } }, as: :json
    assert_response :created
    member = @user.staff_members.find_by!(name: "Anu")
    patch "#{STAFF}/#{member.token}", params: { staff_member: { active: false } }, as: :json
    assert_response :success
    get STAFF, params: { for_billing: true }, as: :json
    assert_not_includes response.parsed_body["staff"].map { |row| row["token"] }, member.token
    get STAFF, params: { status: "inactive", q: "Anu" }, as: :json
    assert_equal [member.token], response.parsed_body["staff"].map { |row| row["token"] }
    post STAFF, params: { staff_member: { name: "Duplicate", role: "Stylist", phone: "9876543211" } }, as: :json
    assert_response :unprocessable_entity
    other = User.create!(email: "other-staff@example.test", password: "password123")
    patch "#{STAFF}/#{other.staff_members.first.token}", params: { staff_member: { name: "Changed" } }, as: :json
    assert_response :not_found
  end

  test "inactive staff preserves old bills but cannot receive new assignments" do
    bill = bill_at(Time.current)
    @staff.update!(active: false, name: "Updated name")
    bill.update!(payment_method: "upi")
    assert_equal @staff.token, bill.reload.items.first["staff_id"]
    assert_not_equal "Updated name", bill.items.first["staff_name"]
    assert_raises(ActiveRecord::RecordInvalid) { bill_at(Time.current) }
  end

  test "daily report uses IST boundaries exact totals and membership payment dates" do
    zone = Time.find_zone!("Asia/Kolkata")
    bill = bill_at(zone.local(2026, 10, 16, 0, 15), "upi")
    bill_at(zone.local(2026, 10, 15, 23, 59))
    bill_at(zone.local(2026, 10, 17, 0, 0))
    customer = bill.customer
    customer.membership_renewals.create!(amount: 1500, payment_method: "card", starts_on: Date.new(2027, 1, 1), expires_on: Date.new(2028, 1, 1), request_key: SecureRandom.uuid, created_at: zone.local(2026, 10, 16, 14))
    other = User.create!(email: "other-report@example.test", password: "password123")
    other.billings.create!(customer_name: "Other", customer_phone: "9876543212", service: "Legacy", subtotal: 9999, discount: 0, discount_type: "flat", gst: false, payment_method: "cash", created_at: zone.local(2026, 10, 16, 10))
    get REPORT, params: { period: "daily", date: "2026-10-16" }, as: :json
    assert_response :success
    data = response.parsed_body
    assert_equal 24, data["series"].length
    assert_equal 1, data.dig("totals", "bill_count")
    assert_equal 1924.8, data.dig("totals", "total_collections")
    assert_equal 424.8, data.dig("totals", "service_collections")
    assert_equal 64.8, data.dig("totals", "gst_collected")
    assert_equal 40.0, data.dig("totals", "discounts")
    assert_equal 424.8, data["series"][0]["services"]
    assert_equal 1500.0, data["series"][14]["memberships"]
    assert_equal 2, data["staff"].first["quantity"]
    assert_equal 400.0, data["staff"].first["gross_value"]
    assert_equal data.dig("totals", "total_collections"), data["payments"].sum { |row| row["amount"] }
  end

  test "calendar periods return complete zero filled series and validate inputs" do
    { "weekly" => [7, "2024-02-26", "2024-03-03"], "monthly" => [29, "2024-02-01", "2024-02-29"], "yearly" => [12, "2024-01-01", "2024-12-31"] }.each do |period, expected|
      get REPORT, params: { period: period, date: "2024-02-29" }, as: :json
      assert_response :success
      data = response.parsed_body
      assert_equal expected[0], data["series"].length
      assert_equal expected[1], data.dig("range", "from")
      assert_equal expected[2], data.dig("range", "to")
      assert data["series"].all? { |row| row["total"] == 0 }
    end
    get REPORT, params: { period: "unknown" }, as: :json
    assert_response :unprocessable_entity
    get REPORT, params: { period: "daily", date: "bad-date" }, as: :json
    assert_response :unprocessable_entity
  end
end