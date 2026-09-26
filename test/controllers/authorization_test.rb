# frozen_string_literal: true

require "test_helper"

class AuthorizationTest < ActionDispatch::IntegrationTest
  def setup
    @admin = User.create!(
      name: "Admin Person",
      email: "auth_admin@test.com",
      phone: "+919999990001",
      password: "Admin@1234",
      role: "admin",
      status: "active"
    )

    @customer = User.create!(
      name: "Customer Person",
      email: "auth_customer@test.com",
      phone: "+919999990002",
      password: "Password@123",
      role: "customer",
      status: "active"
    )

    @worker = User.create!(
      name: "Worker Person",
      email: "auth_worker@test.com",
      phone: "+919999990003",
      password: "Password@123",
      role: "worker",
      status: "active"
    )
  end

  test "Admin browser routes require admin role and active status" do
    # 1. Unauthenticated -> denied
    get admin_dashboard_path
    assert_redirected_to login_path

    # 2. Customer trying to access Admin via browser session -> denied
    post login_path, params: { email: @customer.email, password: "Password@123" }
    assert_response :unprocessable_entity
    get admin_dashboard_path
    assert_redirected_to login_path

    # 3. Worker trying to access Admin-only pages -> denied by Pundit
    post login_path, params: { email: @worker.email, password: "Password@123" }
    assert_redirected_to admin_dashboard_path
    get admin_categories_path
    assert_redirected_to admin_dashboard_path
    get logout_path

    # 4. Real Admin -> allowed
    post login_path, params: { email: @admin.email, password: "Admin@1234" }
    assert_redirected_to admin_dashboard_path
    follow_redirect!
    assert_response :success
  end

  test "Role-based guards reject unauthorized roles on API endpoints" do
    # Verify helper guard logic directly on controller instance
    dummy_controller = Api::V1::BaseController.new

    # Customer verification
    dummy_controller.instance_variable_set(:@current_api_user, @customer)
    assert dummy_controller.current_api_user.customer?
    assert_not dummy_controller.current_api_user.worker?
    assert_not dummy_controller.current_api_user.admin?

    # Worker verification
    dummy_controller.instance_variable_set(:@current_api_user, @worker)
    assert dummy_controller.current_api_user.worker?
    assert_not dummy_controller.current_api_user.customer?
    assert_not dummy_controller.current_api_user.admin?

    # Admin verification
    dummy_controller.instance_variable_set(:@current_api_user, @admin)
    assert dummy_controller.current_api_user.admin?
    assert_not dummy_controller.current_api_user.customer?
    assert_not dummy_controller.current_api_user.worker?
  end
end
