require "test_helper"

class ContactEnquiriesTest < ActionDispatch::IntegrationTest
  include ActionMailer::TestHelper
  self.fixture_table_names = []

  test "public enquiry sends to owner with visitor as reply-to" do
    assert_emails 1 do
      post "/contact/enquiries", params: { name: "Test Client", email: "client@example.com", idea: "Business website project" }, as: :json
    end
    assert_response :success
    message = ActionMailer::Base.deliveries.last
    assert_equal ["balabharathiprofessional@gmail.com"], message.to
    assert_equal ["client@example.com"], message.reply_to
    assert_includes message.body.decoded, "Business website project"
  end

  test "invalid input sends no email" do
    assert_no_emails do
      post "/contact/enquiries", params: { name: "Client", email: "invalid", idea: " " }, as: :json
    end
    assert_response :unprocessable_entity
  end
end
