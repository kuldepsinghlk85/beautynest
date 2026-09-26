# frozen_string_literal: true

require "test_helper"

class Api::V1::CustomerApiTest < ActionDispatch::IntegrationTest
  def setup
    @category = Category.create!(
      name: "Salon For Women Test",
      description: "Hair, facial and skin care",
      status: "active"
    )

    @sub_category = Subcategory.create!(
      name: "Facials Test",
      category: @category,
      status: "active"
    )

    @service = Service.create!(
      subcategory: @sub_category,
      name: "Gold Glow Facial Test",
      description: "Luxury 24k facial",
      base_price: 1200.0,
      discount_price: 999.0,
      duration_minutes: 60,
      status: "active",
      featured: true
    )

    @customer = User.create!(
      name: "Pooja Sharma",
      email: "pooja.test@example.com",
      phone: "+919876541111",
      password: "CustomerPassword123!",
      role: "customer",
      status: "active"
    )

    @other_customer = User.create!(
      name: "Riya Patel",
      email: "riya.test@example.com",
      phone: "+919876542222",
      password: "CustomerPassword123!",
      role: "customer",
      status: "active"
    )

    @worker = User.create!(
      name: "Worker Reena",
      email: "reena.worker@example.com",
      phone: "+919876543333",
      password: "WorkerPassword123!",
      role: "worker",
      status: "active"
    )

    @customer_token = obtain_token_for(@customer)
    @other_token    = obtain_token_for(@other_customer)
    @worker_token   = obtain_token_for(@worker)
  end

  # ── AUTHENTICATION ────────────────────────────────────────────────────────
  test "POST /api/v1/auth/register and login works" do
    post "/api/v1/auth/register", params: {
      user: {
        name: "Newbie Customer",
        email: "newbie@example.com",
        phone: "+919876544444",
        password: "SecretPassword123!",
        password_confirmation: "SecretPassword123!"
      }
    }, as: :json
    assert_response :created
    json = JSON.parse(response.body)
    assert_equal "success", json["status"]
    assert json.dig("data", "token").present?

    # Login
    post "/api/v1/auth/login", params: {
      email: "newbie@example.com",
      password: "SecretPassword123!"
    }, as: :json
    assert_response :success
    json = JSON.parse(response.body)
    token = json.dig("data", "token")
    assert token.present?

    # Me
    get "/api/v1/auth/me", headers: auth_header(token)
    assert_response :success
    json = JSON.parse(response.body)
    assert_equal "Newbie Customer", json.dig("data", "user", "name")

    # Logout
    delete "/api/v1/auth/logout", headers: auth_header(token)
    assert_response :success

    # Revoked token cannot access
    get "/api/v1/auth/me", headers: auth_header(token)
    assert_response :unauthorized
  end

  # ── CUSTOMER PROFILE & IDOR PROTECTION ─────────────────────────────────────
  test "GET /api/v1/customers/:id retrieves own profile" do
    get "/api/v1/customers/#{@customer.id}", headers: auth_header(@customer_token)
    assert_response :success
    json = JSON.parse(response.body)
    assert_equal "success", json["status"]
    assert_equal @customer.name, json.dig("data", "name")
  end

  test "GET /api/v1/customers/:id fails with 404 for other customer (IDOR protection)" do
    get "/api/v1/customers/#{@other_customer.id}", headers: auth_header(@customer_token)
    assert_response :not_found
  end

  test "PATCH /api/v1/customers/:id updates own profile" do
    patch "/api/v1/customers/#{@customer.id}",
          params: { customer: { name: "Pooja Verma", phone: "+919876599999" } },
          headers: auth_header(@customer_token),
          as: :json
    assert_response :success
    json = JSON.parse(response.body)
    assert_equal "Pooja Verma", json.dig("data", "name")
    assert_equal "+919876599999", @customer.reload.phone
  end

  test "DELETE /api/v1/customers/:id deletes own account" do
    temp_cust = User.create!(
      name: "Temporary Customer",
      email: "temp@example.com",
      phone: "+919876545555",
      password: "CustomerPassword123!",
      role: "customer",
      status: "active"
    )
    token = obtain_token_for(temp_cust)

    delete "/api/v1/customers/#{temp_cust.id}", headers: auth_header(token)
    assert_response :success
    assert_nil User.find_by(id: temp_cust.id)
  end

  # ── CATEGORIES ────────────────────────────────────────────────────────────
  test "GET /api/v1/categories returns clean active top-level categories without nested subcategories" do
    get "/api/v1/categories", headers: auth_header(@customer_token)
    assert_response :success
    json = JSON.parse(response.body)
    assert_equal "success", json["status"]
    data = json["data"]
    assert data.any? { |c| c["id"] == @category.id }
    cat = data.find { |c| c["id"] == @category.id }
    assert_nil cat["subcategories"]

    # Separate Subcategories API with category_id returns subcategories and their services
    get "/api/v1/subcategories", params: { category_id: @category.id }, headers: auth_header(@customer_token)
    assert_response :success
    sub_json = JSON.parse(response.body)
    assert_equal "success", sub_json["status"]
    subs = sub_json["data"]
    assert subs.any? { |s| s["id"] == @sub_category.id }
    target_sub = subs.find { |s| s["id"] == @sub_category.id }
    assert target_sub["services"].any? { |srv| srv["id"] == @service.id }

    # Separate Services API connected with subcategory_id returns services
    get "/api/v1/services", params: { subcategory_id: @sub_category.id }, headers: auth_header(@customer_token)
    assert_response :success
    srv_json = JSON.parse(response.body)
    assert_equal "success", srv_json["status"]
    assert srv_json["data"].any? { |srv| srv["id"] == @service.id }
  end

  test "GET /api/v1/categories/:id returns category details with services" do
    get "/api/v1/categories/#{@category.slug}", headers: auth_header(@customer_token)
    assert_response :success
    json = JSON.parse(response.body)
    assert_equal "success", json["status"]
    assert_equal @category.name, json.dig("data", "name")
    assert json.dig("data", "services").any? { |s| s["id"] == @service.id }
  end

  test "GET /api/v1/categories/:category_id/services returns category services" do
    get "/api/v1/categories/#{@category.id}/services", headers: auth_header(@customer_token)
    assert_response :success
    json = JSON.parse(response.body)
    assert_equal "success", json["status"]
    assert json["data"].any? { |s| s["id"] == @service.id }
  end

  # ── SERVICES ──────────────────────────────────────────────────────────────
  test "GET /api/v1/services lists services with filter and search" do
    get "/api/v1/services", params: { search: "Gold", sort: "price_asc" }, headers: auth_header(@customer_token)
    assert_response :success
    json = JSON.parse(response.body)
    assert_equal "success", json["status"]
    assert json["data"].any? { |s| s["id"] == @service.id }
  end

  test "GET /api/v1/services/:id returns service details" do
    get "/api/v1/services/#{@service.slug}", headers: auth_header(@customer_token)
    assert_response :success
    json = JSON.parse(response.body)
    assert_equal "success", json["status"]
    assert_equal @service.name, json.dig("data", "name")
  end

  # ── BOOKINGS ──────────────────────────────────────────────────────────────
  test "POST /api/v1/bookings creates booking with service_name and list/show/cancel flow" do
    # 1. Create booking
    post "/api/v1/bookings", params: {
      booking: {
        service_name: "Gold Glow Facial Test",
        scheduled_at: 2.days.from_now.iso8601,
        total_amount: 999.0,
        notes: "Ring bell twice"
      }
    }, headers: auth_header(@customer_token), as: :json
    assert_response :created
    json = JSON.parse(response.body)
    assert_equal "success", json["status"]
    booking_id = json.dig("data", "id")
    assert booking_id.present?
    assert_equal "Gold Glow Facial Test", json.dig("data", "service_name")
    assert_equal "pending", json.dig("data", "status")

    # 2. List bookings
    get "/api/v1/bookings", headers: auth_header(@customer_token)
    assert_response :success
    json = JSON.parse(response.body)
    assert json["data"].any? { |b| b["id"] == booking_id }

    # 3. Show booking
    get "/api/v1/bookings/#{booking_id}", headers: auth_header(@customer_token)
    assert_response :success
    json = JSON.parse(response.body)
    assert_equal booking_id, json.dig("data", "id")

    # 4. IDOR check: Other customer cannot see this booking
    get "/api/v1/bookings/#{booking_id}", headers: auth_header(@other_token)
    assert_response :not_found

    # 5. Cancel booking
    patch "/api/v1/bookings/#{booking_id}/cancel", headers: auth_header(@customer_token)
    assert_response :success
    json = JSON.parse(response.body)
    assert_equal "cancelled", json.dig("data", "status")

    # 6. Cannot cancel already cancelled booking
    patch "/api/v1/bookings/#{booking_id}/cancel", headers: auth_header(@customer_token)
    assert_response :unprocessable_entity
  end

  test "POST /api/v1/bookings creates booking with service_id" do
    post "/api/v1/bookings", params: {
      booking: {
        service_id: @service.id,
        scheduled_at: 3.days.from_now.iso8601
      }
    }, headers: auth_header(@customer_token), as: :json
    assert_response :created
    json = JSON.parse(response.body)
    assert_equal @service.name, json.dig("data", "service_name")
    assert_equal @service.effective_price.to_f, json.dig("data", "total_amount")
  end

  # ── ROLE ISOLATION ────────────────────────────────────────────────────────
  test "Workers can browse public catalog but are forbidden from customer booking routes" do
    get "/api/v1/categories", headers: auth_header(@worker_token)
    assert_response :success

    get "/api/v1/services", headers: auth_header(@worker_token)
    assert_response :success

    get "/api/v1/bookings", headers: auth_header(@worker_token)
    assert_response :forbidden
  end

  private

  def obtain_token_for(user)
    post "/api/v1/auth/login", params: {
      email: user.email,
      password: "CustomerPassword123!"
    }, as: :json
    if response.status != 200
      post "/api/v1/auth/login", params: {
        email: user.email,
        password: "WorkerPassword123!"
      }, as: :json
    end
    json = JSON.parse(response.body)
    json.dig("data", "token")
  end

  def auth_header(token)
    {
      "Authorization" => "Bearer #{token}",
      "Content-Type" => "application/json"
    }
  end
end
