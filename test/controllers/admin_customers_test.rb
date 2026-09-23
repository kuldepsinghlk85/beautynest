# frozen_string_literal: true

require "test_helper"

class AdminCustomersTest < ActionDispatch::IntegrationTest
  def setup
    @admin = User.create!(
      name: "Admin User",
      email: "admin_cust_test@example.com",
      phone: "+919111122223",
      password: "Admin@1234",
      role: "admin",
      status: "active"
    )

    @customer = User.create!(
      name: "Priya Sharma",
      email: "priya_cust_test@example.com",
      phone: "+919222233334",
      password: "Password@123",
      role: "customer",
      status: "active"
    )

    @customer2 = User.create!(
      name: "Karan Johar",
      email: "karan_cust_test@example.com",
      phone: "+919333344445",
      password: "Password@123",
      role: "customer",
      status: "active"
    )
  end

  test "admin can list, search, view, and delete customer" do
    # 1. Login as admin
    post login_path, params: { email: @admin.email, password: "Admin@1234" }
    assert_redirected_to admin_dashboard_path

    # 2. List Customers
    get admin_customers_path
    assert_response :success
    assert_includes response.body, "Priya Sharma"
    assert_includes response.body, "Karan Johar"
    assert_includes response.body, "customers_list" # Turbo frame present
    assert_includes response.body, "data-action=\"input->search#debounce\"" # Debounce search present

    # 3. Search filter
    get admin_customers_path, params: { q: "Karan" }
    assert_response :success
    assert_includes response.body, "Karan Johar"
    refute_includes response.body, "Priya Sharma"

    # 4. View Customer Details
    get admin_customer_path(@customer.id)
    assert_response :success
    assert_includes response.body, "Priya Sharma"
    assert_includes response.body, "Customer Information"
    assert_includes response.body, "Contact Details"
    assert_includes response.body, "Delete Customer"

    # 5. Delete Customer
    assert_difference("User.customers.count", -1) do
      delete admin_customer_path(@customer.id)
    end
    assert_redirected_to admin_customers_path
    follow_redirect!
    assert_includes response.body, "Customer &#39;Priya Sharma&#39; was deleted successfully."
    assert_nil User.find_by(id: @customer.id)
  end

  test "admin can deactivate and activate customer, and deactivated customer cannot login" do
    # 1. Active customer can login via API initially
    post "/api/v1/auth/login", params: { email: @customer.email, password: "Password@123" }
    assert_response :ok
    json = JSON.parse(response.body)
    token = json.dig("data", "token")

    # Access profile with token -> works
    get "/api/v1/auth/me", headers: { "Authorization" => "Bearer #{token}" }
    assert_response :ok

    # 2. Admin logs into control panel and deactivates the customer
    post login_path, params: { email: @admin.email, password: "Admin@1234" }
    assert_redirected_to admin_dashboard_path

    patch toggle_status_admin_customer_path(@customer.id)
    assert_redirected_to admin_customers_path
    follow_redirect!
    assert_includes response.body, "deactivated"

    @customer.reload
    assert_equal "inactive", @customer.status

    # 3. Deactivated customer CANNOT login via API
    post "/api/v1/auth/login", params: { email: @customer.email, password: "Password@123" }
    assert_response :forbidden
    error_json = JSON.parse(response.body)
    assert_includes (error_json["message"] || error_json.dig("error", "message")), "inactive"

    # 4. Old token can no longer access /api/v1/auth/me (sessions revoked / account inactive)
    get "/api/v1/auth/me", headers: { "Authorization" => "Bearer #{token}" }
    assert_response :forbidden
    assert_includes response.body, "inactive"

    # 5. Admin reactivates the customer
    patch toggle_status_admin_customer_path(@customer.id)
    assert_redirected_to admin_customers_path
    follow_redirect!
    assert_includes response.body, "activated"

    @customer.reload
    assert_equal "active", @customer.status

    # 6. Reactivated customer CAN login via API again
    post "/api/v1/auth/login", params: { email: @customer.email, password: "Password@123" }
    assert_response :ok
  end

  test "admin customer management has no new/create/edit/update routes" do
    post login_path, params: { email: @admin.email, password: "Admin@1234" }

    # POST /admin/customers (create) does not exist -> 404
    post "/admin/customers", params: { customer: { name: "Test" } }
    assert_response :not_found

    # GET /admin/customers/:id/edit (edit) does not exist -> 404
    get "/admin/customers/#{@customer.id}/edit"
    assert_response :not_found

    # PATCH /admin/customers/:id (update) does not exist -> 404
    patch "/admin/customers/#{@customer.id}", params: { customer: { name: "New" } }
    assert_response :not_found
  end
end
