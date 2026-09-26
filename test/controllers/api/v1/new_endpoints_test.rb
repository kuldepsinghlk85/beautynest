# frozen_string_literal: true

require "test_helper"

class Api::V1::NewEndpointsTest < ActionDispatch::IntegrationTest
  def setup
    @category = Category.create!(
      name: "Salon For Women Test 2",
      description: "Hair and skin care",
      status: "active"
    )

    @service = Service.create!(
      category: @category,
      name: "Sara Fruit Glow Facial",
      description: "Fruit glow facial",
      base_price: 1200.0,
      discount_price: 999.0,
      duration_minutes: 60,
      status: "active"
    )

    @customer = User.create!(
      name: "Ananya Sharma",
      email: "ananya.sharma@example.com",
      phone: "+919876549901",
      password: "Password123!",
      role: "customer",
      status: "active"
    )

    @other_customer = User.create!(
      name: "Kavita Rao",
      email: "kavita.rao@example.com",
      phone: "+919876549902",
      password: "Password123!",
      role: "customer",
      status: "active"
    )

    @city = City.find_or_create_by!(name: "Lucknow") do |c|
      c.state = "Uttar Pradesh"
      c.status = "active"
    end

    @worker = User.create!(
      name: "Sunita Verma",
      email: "sunita.worker@example.com",
      phone: "+919876549903",
      password: "WorkerPassword123!",
      role: "worker",
      status: "active"
    )
    @worker.create_worker_profile!(
      city_id: @city.id,
      experience_years: 5,
      bio: "Expert beautician in Lucknow",
      is_available: true,
      available_days: Date::DAYNAMES
    )

    @customer_token = obtain_token_for(@customer, "Password123!")
    @other_token    = obtain_token_for(@other_customer, "Password123!")
    @worker_token   = obtain_token_for(@worker, "WorkerPassword123!")
  end

  # ==========================================
  # 1. Customer Addresses API Tests
  # ==========================================
  test "POST /api/v1/customers/addresses creates address for customer" do
    post "/api/v1/customers/addresses",
         params: {
           address: {
             label: "Home",
             line1: "204, Sunflower Residency",
             line2: "Gomti Nagar",
             city: "Lucknow",
             state: "Uttar Pradesh",
             pincode: "226010",
             is_default: true
           }
         },
         headers: auth_header(@customer_token),
         as: :json

    assert_response :created
    json = JSON.parse(response.body)
    assert_equal "success", json["status"]
    data = json["data"]
    assert_equal "Home", data["label"]
    assert_equal "Lucknow", data["city"]
    assert_equal true, data["is_default"]
    assert_equal @customer.id, data["user_id"]
  end

  test "GET /api/v1/customers/addresses returns only customer's saved addresses" do
    addr1 = @customer.addresses.create!(
      line1: "101, Test St",
      city: "Lucknow",
      is_default: true
    )
    @other_customer.addresses.create!(
      line1: "Other St",
      city: "Delhi"
    )

    get "/api/v1/customers/addresses", headers: auth_header(@customer_token)
    assert_response :ok

    json = JSON.parse(response.body)
    assert_equal 1, json["data"].size
    assert_equal addr1.id, json["data"][0]["id"]
  end

  test "PATCH /api/v1/customers/addresses/:id updates address" do
    addr = @customer.addresses.create!(
      line1: "Old Address",
      city: "Lucknow"
    )

    patch "/api/v1/customers/addresses/#{addr.id}",
          params: { address: { line1: "New Address Updated", is_default: true } },
          headers: auth_header(@customer_token),
          as: :json

    assert_response :ok
    json = JSON.parse(response.body)
    assert_equal "New Address Updated", json["data"]["line1"]
    assert_equal true, json["data"]["is_default"]
  end

  test "DELETE /api/v1/customers/addresses/:id deletes address" do
    addr = @customer.addresses.create!(
      line1: "To Delete",
      city: "Lucknow"
    )

    delete "/api/v1/customers/addresses/#{addr.id}", headers: auth_header(@customer_token)
    assert_response :ok
    assert_nil Address.find_by(id: addr.id)
  end

  test "Customer address endpoints enforce IDOR protection" do
    other_addr = @other_customer.addresses.create!(
      line1: "Private Address",
      city: "Delhi"
    )

    patch "/api/v1/customers/addresses/#{other_addr.id}",
          params: { address: { line1: "Hacked" } },
          headers: auth_header(@customer_token),
          as: :json
    assert_response :not_found

    delete "/api/v1/customers/addresses/#{other_addr.id}",
           headers: auth_header(@customer_token)
    assert_response :not_found
  end

  # ==========================================
  # 2. Customer Cart API Tests
  # ==========================================
  test "GET /api/v1/cart returns active cart" do
    get "/api/v1/cart", headers: auth_header(@customer_token)
    assert_response :ok

    json = JSON.parse(response.body)
    assert_equal "success", json["status"]
    assert_equal 0, json["data"]["item_count"]
    assert_equal 0.0, json["data"]["subtotal"]
  end

  test "POST, PATCH, DELETE /api/v1/cart/items lifecycle" do
    # Add item
    post "/api/v1/cart/items",
         params: {
           cart_item: {
             service_id: @service.id,
             quantity: 1,
             scheduled_at: "2026-09-15T10:30:00Z"
           }
         },
         headers: auth_header(@customer_token),
         as: :json

    assert_response :created
    json = JSON.parse(response.body)
    item_id = json["data"]["id"]
    assert_not_nil item_id
    assert_equal 1, json["data"]["quantity"]
    assert_equal 999.0, json["data"]["unit_price"]

    # Verify cart has item
    get "/api/v1/cart", headers: auth_header(@customer_token)
    cart_json = JSON.parse(response.body)
    assert_equal 1, cart_json["data"]["item_count"]
    assert_equal 999.0, cart_json["data"]["subtotal"]

    # Update item quantity
    patch "/api/v1/cart/items/#{item_id}",
          params: { cart_item: { quantity: 3 } },
          headers: auth_header(@customer_token),
          as: :json

    assert_response :ok
    json = JSON.parse(response.body)
    assert_equal 3, json["data"]["quantity"]
    assert_equal 2997.0, json["data"]["line_total"]

    # Remove item
    delete "/api/v1/cart/items/#{item_id}", headers: auth_header(@customer_token)
    assert_response :ok

    get "/api/v1/cart", headers: auth_header(@customer_token)
    cart_json = JSON.parse(response.body)
    assert_equal 0, cart_json["data"]["item_count"]
  end

  test "POST /api/v1/cart/checkout creates booking and COD payment" do
    addr = @customer.addresses.create!(
      line1: "204, Sunflower Residency",
      city: "Lucknow",
      is_default: true
    )

    # Add item to cart
    post "/api/v1/cart/items",
         params: {
           cart_item: {
             service_id: @service.id,
             quantity: 2
           }
         },
         headers: auth_header(@customer_token),
         as: :json
    assert_response :created

    # Checkout
    post "/api/v1/cart/checkout",
         params: {
           address_id: addr.id,
           payment_method: "cod",
           notes: "Please call on arrival"
         },
         headers: auth_header(@customer_token),
         as: :json

    assert_response :created
    json = JSON.parse(response.body)
    data = json["data"]

    # Postman script tests: order.bookings[0].id or order.id
    booking_id = data["id"]
    assert_not_nil booking_id
    assert_equal booking_id, data["bookings"][0]["id"]
    assert_equal "pending", data["booking"]["status"]
    assert_equal 1998.0, data["booking"]["total_amount"]
    assert_equal "cod", data["payment"]["method"]
    assert_equal "pending", data["payment"]["status"]

    # Verify cart was cleared
    get "/api/v1/cart", headers: auth_header(@customer_token)
    cart_json = JSON.parse(response.body)
    assert_equal 0, cart_json["data"]["item_count"]
  end

  # ==========================================
  # 3. Customer Booking Review API Tests
  # ==========================================
  test "POST /api/v1/bookings/:id/review submits review successfully" do
    booking = @customer.customer_bookings.create!(
      status: "completed",
      worker: @worker,
      scheduled_at: 1.day.ago,
      subtotal_amount: 999.0,
      total_amount: 999.0
    )

    post "/api/v1/bookings/#{booking.id}/review",
         params: {
           review: {
             rating: 5,
             comment: "Great service, on time and professional."
           }
         },
         headers: auth_header(@customer_token),
         as: :json

    assert_response :created
    json = JSON.parse(response.body)
    data = json["data"]
    assert_equal 5, data["rating"]
    assert_equal "Great service, on time and professional.", data["comment"]
    assert_equal booking.id, data["booking_id"]

    # Prevent duplicate reviews
    post "/api/v1/bookings/#{booking.id}/review",
         params: { review: { rating: 4, comment: "Another review" } },
         headers: auth_header(@customer_token),
         as: :json
    assert_response :unprocessable_entity
  end

  # ==========================================
  # 4. Worker Logout API Tests
  # ==========================================
  test "DELETE /api/v1/worker/auth/logout revokes session" do
    delete "/api/v1/worker/auth/logout", headers: auth_header(@worker_token)
    assert_response :ok

    json = JSON.parse(response.body)
    assert_equal "success", json["status"]

    # Token is now revoked
    get "/api/v1/worker/profile", headers: auth_header(@worker_token)
    assert_response :unauthorized
  end

  # ==========================================
  # 5. Worker Accept Assigned Booking API Tests
  # ==========================================
  test "PATCH /api/v1/worker/bookings/:id/accept transitions booking to confirmed" do
    booking = @customer.customer_bookings.create!(
      status: "pending",
      worker: @worker,
      scheduled_at: 1.day.from_now,
      subtotal_amount: 999.0,
      total_amount: 999.0
    )

    patch "/api/v1/worker/bookings/#{booking.id}/accept",
          headers: auth_header(@worker_token)

    assert_response :ok
    json = JSON.parse(response.body)
    assert_includes %w[accepted confirmed], json["data"]["status"]
    assert_includes %w[accepted confirmed], booking.reload.status
  end

  private

  def obtain_token_for(user, password)
    post "/api/v1/auth/login", params: {
      email: user.email,
      password: password
    }, as: :json
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
