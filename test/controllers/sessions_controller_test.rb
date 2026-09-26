# frozen_string_literal: true

require "test_helper"

class SessionsControllerTest < ActionDispatch::IntegrationTest
  def setup
    @admin = User.create!(
      name: "BeautyNest Admin",
      email: "admin_test@BeautyNest.test",
      phone: "+919999999901",
      password: "Admin@1234",
      role: "admin",
      status: "active"
    )

    @inactive_admin = User.create!(
      name: "Inactive Admin",
      email: "inactive_admin@BeautyNest.test",
      phone: "+919999999902",
      password: "Admin@1234",
      role: "admin",
      status: "inactive"
    )

    @customer = User.create!(
      name: "Customer User",
      email: "customer_test@BeautyNest.test",
      phone: "+919999999903",
      password: "Password@123",
      role: "customer",
      status: "active"
    )

    @worker = User.create!(
      name: "Worker User",
      email: "worker_test@BeautyNest.test",
      phone: "+919999999904",
      password: "Password@123",
      role: "worker",
      status: "active"
    )
  end

  test "GET /login renders login page with no-cache headers" do
    get login_path
    assert_response :success
    assert_includes response.headers["Cache-Control"], "no-store"
    assert_equal "no-cache", response.headers["Pragma"]
  end

  test "unauthenticated access to admin dashboard redirects to /login" do
    get admin_dashboard_path
    assert_redirected_to login_path
    follow_redirect!
    assert_select ".v6-alert-box", text: /must be signed in/i
  end

  test "valid Admin login succeeds, sets session, and redirects to dashboard" do
    post login_path, params: { email: @admin.email, password: "Admin@1234" }
    assert_redirected_to admin_dashboard_path
    assert_equal @admin.id, session[:admin_user_id]

    follow_redirect!
    assert_response :success
  end

  test "invalid password fails with 422 and safe error" do
    post login_path, params: { email: @admin.email, password: "WrongPassword" }
    assert_response :unprocessable_entity
    assert_nil session[:admin_user_id]
    assert_select ".v6-alert-box", text: /invalid email or password/i
  end

  test "non-existent email fails with safe generic error without enumeration" do
    post login_path, params: { email: "nonexistent@BeautyNest.test", password: "AnyPassword" }
    assert_response :unprocessable_entity
    assert_nil session[:admin_user_id]
    assert_select ".v6-alert-box", text: /invalid email or password/i
  end

  test "customer cannot log into admin browser panel" do
    post login_path, params: { email: @customer.email, password: "Password@123" }
    assert_response :unprocessable_entity
    assert_nil session[:admin_user_id]
    assert_select ".v6-alert-box", text: /invalid email or password/i
  end

  test "worker can log into browser panel" do
    post login_path, params: { email: @worker.email, password: "Password@123" }
    assert_redirected_to admin_dashboard_path
    assert_equal @worker.id, session[:user_id]
  end

  test "inactive admin is denied login with forbidden status" do
    post login_path, params: { email: @inactive_admin.email, password: "Admin@1234" }
    assert_response :forbidden
    assert_nil session[:admin_user_id]
    assert_select ".v6-alert-box", text: /inactive/i
  end

  test "admin logout destroys session and prevents further access" do
    # 1. Login
    post login_path, params: { email: @admin.email, password: "Admin@1234" }
    assert_redirected_to admin_dashboard_path
    assert_equal @admin.id, session[:admin_user_id]

    # 2. Access dashboard while logged in
    get admin_dashboard_path
    assert_response :success

    # 3. Logout
    delete logout_path
    assert_redirected_to login_path
    assert_nil session[:admin_user_id]

    # 4. Attempting dashboard again redirects to login
    get admin_dashboard_path
    assert_redirected_to login_path
  end
end
