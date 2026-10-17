require "test_helper"

class LandingTest < ActionDispatch::IntegrationTest
  include Devise::Test::IntegrationHelpers
  self.fixture_table_names = []

  test "portfolio is public and uses its own layout" do
    get root_path
    assert_response :success
    assert_select "#portfolio", count: 1
    assert_select "body.portfolio-body", count: 1
    assert_select "title", text: /Built by Bala/
    assert_select "a[href='mailto:balabharathiprofessional@gmail.com']"
  end

  test "workspace and billing still require authentication" do
    get workspace_dashboard_path
    assert_redirected_to new_user_session_path
    get "/qmnrofoqrygpvip/billing"
    assert_redirected_to new_user_session_path
  end

  test "sign in opens workspace instead of public portfolio" do
    user = User.create!(email: "landing-login@example.test", password: "password123")
    post user_session_path, params: { user: { email: user.email, password: "password123" } }
    assert_redirected_to workspace_dashboard_path
    follow_redirect!
    assert_response :success
  end

  test "sign in preserves requested billing destination" do
    user = User.create!(email: "landing-billing@example.test", password: "password123")
    get "/qmnrofoqrygpvip/billing"
    post user_session_path, params: { user: { email: user.email, password: "password123" } }
    assert_redirected_to "/qmnrofoqrygpvip/billing"
  end
end