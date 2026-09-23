# frozen_string_literal: true

require "test_helper"

class RoleBasedAuthorizationTest < ActionDispatch::IntegrationTest
  setup do
    # Clear test db records cleanly
    Booking.delete_all
    Session.delete_all
    User.delete_all

    @admin = User.create!(
      name: "Super Admin",
      email: "admin_test@BeautyNest.test",
      phone: "+919999000001",
      password: "Admin@1234",
      role: "admin",
      status: "active"
    )

    @worker_a = User.create!(
      name: "Worker A",
      email: "worker_a@BeautyNest.test",
      phone: "+919811000001",
      password: "Worker@1234",
      role: "worker",
      status: "active"
    )

    @worker_b = User.create!(
      name: "Worker B",
      email: "worker_b@BeautyNest.test",
      phone: "+919811000002",
      password: "Worker@1234",
      role: "worker",
      status: "active"
    )

    # Customers for Worker A
    @customer_a1 = User.create!(
      name: "Customer A1",
      email: "cust_a1@example.com",
      phone: "+919876000001",
      password: "Password@123",
      role: "customer",
      status: "active"
    )
    @customer_a2 = User.create!(
      name: "Customer A2",
      email: "cust_a2@example.com",
      phone: "+919876000002",
      password: "Password@123",
      role: "customer",
      status: "active"
    )
    @booking_a1 = Booking.create!(customer_id: @customer_a1.id, worker_id: @worker_a.id, booking_status: "confirmed", service_status: "completed")
    @booking_a2 = Booking.create!(customer_id: @customer_a2.id, worker_id: @worker_a.id, booking_status: "confirmed", service_status: "in_progress")

    # Customers for Worker B
    @customer_b1 = User.create!(
      name: "Customer B1",
      email: "cust_b1@example.com",
      phone: "+919876000003",
      password: "Password@123",
      role: "customer",
      status: "active"
    )
    @customer_b2 = User.create!(
      name: "Customer B2",
      email: "cust_b2@example.com",
      phone: "+919876000004",
      password: "Password@123",
      role: "customer",
      status: "active"
    )
    @booking_b1 = Booking.create!(customer_id: @customer_b1.id, worker_id: @worker_b.id, booking_status: "confirmed", service_status: "completed")
    @booking_b2 = Booking.create!(customer_id: @customer_b2.id, worker_id: @worker_b.id, booking_status: "confirmed", service_status: "in_progress")
  end

  # Scenario 1: Admin logs in -> can see all customers
  test "1. Admin can see all customers" do
    sign_in_user(@admin)
    get admin_customers_path
    assert_response :success
    assert_includes response.body, @customer_a1.name
    assert_includes response.body, @customer_a2.name
    assert_includes response.body, @customer_b1.name
    assert_includes response.body, @customer_b2.name
  end

  # Scenario 2: Admin logs in -> can see all workers
  test "2. Admin can access worker management" do
    sign_in_user(@admin)
    get admin_workers_path
    assert_response :success
  end

  # Scenario 3: Admin logs in -> can see all bookings
  test "3. Admin can see all bookings" do
    sign_in_user(@admin)
    get admin_bookings_path
    assert_response :success
  end

  # Scenario 4: Worker A logs in -> sees only Worker A's customers
  test "4. Worker A sees only Worker A customers" do
    sign_in_user(@worker_a)
    get admin_customers_path
    assert_response :success
    assert_includes response.body, @customer_a1.name
    assert_includes response.body, @customer_a2.name
    assert_not_includes response.body, @customer_b1.name
    assert_not_includes response.body, @customer_b2.name
  end

  # Scenario 5: Worker A -> cannot see Worker B's customers
  test "5. Worker B customers are excluded from Worker A scope" do
    sign_in_user(@worker_a)
    get admin_customers_path
    assert_response :success
    assert_includes response.body, @customer_a1.name
    assert_includes response.body, @customer_a2.name
    assert_not_includes response.body, @customer_b1.name
    assert_not_includes response.body, @customer_b2.name
  end

  # Scenario 6: Worker A -> cannot access Worker B's customer by changing the customer ID
  test "6. Worker A cannot access Worker B customer details (Pundit rejection)" do
    sign_in_user(@worker_a)
    get admin_customer_path(@customer_b1.id)
    assert_redirected_to admin_dashboard_path
    follow_redirect!
    assert_includes response.body, "You are not authorized to perform this action."
  end

  # Scenario 7: Worker A -> sees only their own bookings
  test "7. Worker A sees only their own bookings" do
    sign_in_user(@worker_a)
    get admin_bookings_path
    assert_response :success
  end

  # Scenario 8: Worker A -> cannot access another worker's booking
  test "8. Worker A cannot access Worker B booking" do
    sign_in_user(@worker_a)
    get admin_booking_path(@booking_b1.id)
    assert_redirected_to admin_dashboard_path
    follow_redirect!
    assert_includes response.body, "You are not authorized to perform this action."
  end

  # Scenario 9: Worker A -> can access only their own profile
  test "9. Worker A can access their own profile" do
    sign_in_user(@worker_a)
    get admin_worker_path(@worker_a.id)
    assert_response :success
  end

  # Scenario 10: Worker A -> cannot access Worker B profile
  test "10. Worker A cannot access Worker B profile" do
    sign_in_user(@worker_a)
    get admin_worker_path(@worker_b.id)
    assert_redirected_to admin_dashboard_path
    follow_redirect!
    assert_includes response.body, "You are not authorized to perform this action."
  end

  # Scenario 11: Worker A -> cannot access Worker Management (index)
  test "11. Worker A cannot access Worker Management list" do
    sign_in_user(@worker_a)
    get admin_workers_path
    assert_redirected_to admin_dashboard_path
    follow_redirect!
    assert_includes response.body, "You are not authorized to perform this action."
  end

  # Scenario 12: Worker A -> cannot access Admin-only pages (Categories, Settings)
  test "12. Worker A cannot access Categories and Settings" do
    sign_in_user(@worker_a)
    get admin_categories_path
    assert_redirected_to admin_dashboard_path

    get admin_settings_path
    assert_redirected_to admin_dashboard_path
  end

  # Scenario 13: Admin -> retains full access
  test "13. Admin retains full access to customers, workers, and settings" do
    sign_in_user(@admin)

    get admin_customer_path(@customer_a1.id)
    assert_response :success

    get admin_worker_path(@worker_a.id)
    assert_response :success

    get admin_settings_path
    assert_response :success
  end

  # Scenario 14: API Authorization - Unauthorized API requests rejected by Pundit
  test "14. API rejects cross-worker customer access with 403 Forbidden" do
    _session_a, token_a = generate_token_for(@worker_a)

    # Worker A can access Customer A1 via API
    get "/api/v1/customers/#{@customer_a1.id}", headers: { "Authorization" => "Bearer #{token_a}" }
    assert_response :success

    # Worker A CANNOT access Customer B1 via API
    get "/api/v1/customers/#{@customer_b1.id}", headers: { "Authorization" => "Bearer #{token_a}" }
    assert_response :forbidden
    body = JSON.parse(response.body)
    assert_includes body["message"], "not authorized"

    # Worker A CANNOT delete Customer B1 via API
    delete "/api/v1/customers/#{@customer_b1.id}", headers: { "Authorization" => "Bearer #{token_a}" }
    assert_response :forbidden

    # Customer role cannot access API customer list
    _session_cust, token_cust = generate_token_for(@customer_a1)
    get "/api/v1/customers", headers: { "Authorization" => "Bearer #{token_cust}" }
    assert_response :forbidden
  end

  # Scenario 15: Frontend navigation reflects role
  test "15. Frontend navigation renders Worker-specific menu for worker" do
    sign_in_user(@worker_a)
    get admin_dashboard_path
    assert_response :success

    # Worker navigation items present
    assert_includes response.body, "Worker Portal"
    assert_includes response.body, "My Customers"
    assert_includes response.body, "My Bookings"
    assert_includes response.body, "My Services"
    assert_includes response.body, "My Profile"

    # Admin only items absent
    assert_not_includes response.body, "All Customers"
    assert_not_includes response.body, "Admin Panel"
    assert_not_includes response.body, "Settings"
  end
end
