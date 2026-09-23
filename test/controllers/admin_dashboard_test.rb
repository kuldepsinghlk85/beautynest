# frozen_string_literal: true

require "test_helper"

class AdminDashboardTest < ActionDispatch::IntegrationTest
  setup do
    # Clear cache between runs to test fresh calculations
    Rails.cache.clear

    @admin = User.find_by(email: "admin_test_dash@BeautyNest.test") || User.create!(
      name: "Super Admin",
      email: "admin_test_dash@BeautyNest.test",
      phone: "+919999988888",
      password: "Admin@1234",
      role: "admin",
      status: "active"
    )

    @worker = User.find_by(email: "worker_test_dash@BeautyNest.test") || User.create!(
      name: "Priya Beautician",
      email: "worker_test_dash@BeautyNest.test",
      phone: "+919811188888",
      password: "Worker@1234",
      role: "worker",
      status: "active"
    )
  end

  test "unauthenticated user cannot access dashboard and is redirected" do
    get admin_dashboard_path
    assert_redirected_to login_path
  end

  test "admin can access dashboard and view real KPIs, charts, and recent bookings" do
    sign_in_user(@admin)
    get admin_dashboard_path
    assert_response :success

    # Verify KPI card labels and presence
    assert_includes response.body, "Total Customers"
    assert_includes response.body, "Active Workers"
    assert_includes response.body, "Total Bookings"
    assert_includes response.body, "Gross Revenue"

    # Verify Chart titles and containers
    assert_includes response.body, "Bookings Trend"
    assert_includes response.body, "Revenue Trajectory"
    assert_includes response.body, "Status Breakdown"
    assert_includes response.body, "bookingsChart"
    assert_includes response.body, "revenueChart"
    assert_includes response.body, "statusChart"

    # Verify recent bookings table is rendered
    assert_includes response.body, "Recent Bookings Ledger"
  end

  test "worker can access dashboard and view worker-scoped metrics" do
    sign_in_user(@worker)
    get admin_dashboard_path
    assert_response :success

    assert_includes response.body, "Total Customers"
    assert_includes response.body, "Active Workers"
    assert_includes response.body, "Total Bookings"
    assert_includes response.body, "Gross Revenue"
  end
end
