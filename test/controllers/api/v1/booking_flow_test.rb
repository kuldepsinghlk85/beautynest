# frozen_string_literal: true

require "test_helper"

class Api::V1::BookingFlowTest < ActionDispatch::IntegrationTest
  def setup
    @city = City.find_or_create_by!(slug: "mumbai-flow-test") do |c|
      c.name = "Mumbai"
      c.state = "Maharashtra"
      c.status = "active"
    end

    @delhi = City.find_or_create_by!(slug: "delhi-flow-test") do |c|
      c.name = "Delhi"
      c.state = "Delhi"
      c.status = "active"
    end

    @category = Category.find_or_create_by!(slug: "salon-flow-test") do |cat|
      cat.name = "Salon At Home"
      cat.status = "active"
    end

    @subcategory = Subcategory.find_or_create_by!(slug: "facials-flow-test") do |sub|
      sub.category = @category
      sub.name = "Facial Treatments"
      sub.status = "active"
    end

    @service = Service.find_or_create_by!(slug: "gold-facial-flow-test") do |s|
      s.subcategory = @subcategory
      s.name = "24K Gold Radiant Facial"
      s.description = "Luxury glow facial"
      s.base_price = 1500.0
      s.discount_price = 1299.0
      s.duration_minutes = 60
      s.status = "active"
      s.tag = "facial"
    end

    # City price override for Mumbai: 1199.0
    ServiceCityPrice.find_or_create_by!(service: @service, city: @city) do |scp|
      scp.base_price = 1400.0
      scp.discount_price = 1199.0
      scp.status = "active"
    end

    @customer = User.create!(
      name: "Riya Sen",
      email: "riya.sen.#{SecureRandom.hex(4)}@BeautyNest.test",
      phone: "+9198#{rand(10000000..99999999)}",
      password: "Password@123",
      password_confirmation: "Password@123",
      role: "customer",
      status: "active"
    )
    _, @token = generate_token_for(@customer)
    @auth_headers = { "Authorization" => "Bearer #{@token}" }

    @address = @customer.addresses.create!(
      label: "Home",
      line1: "Flat 402, Sea Breeze Apt",
      city: "Mumbai",
      city_id: @city.id,
      state: "Maharashtra",
      pincode: "400050",
      is_default: true
    )

    # Worker operating in Mumbai on Thursday, Friday, Saturday
    @worker = User.create!(
      name: "Pooja Sharma",
      email: "pooja.sharma.#{SecureRandom.hex(4)}@BeautyNest.test",
      phone: "+9197#{rand(10000000..99999999)}",
      password: "Worker@1234",
      password_confirmation: "Worker@1234",
      role: "worker",
      status: "active"
    )
    @worker.create_worker_profile!(
      city: @city,
      available_days: %w[Thursday Friday Saturday Monday],
      time_slot: "Full Day (Throughout the Day)",
      is_available: true,
      experience_years: 4,
      rating_avg: 4.9,
      rating_count: 25,
      bio: "Master Esthetician & Facial Specialist"
    )

    # Coupon
    @coupon = Coupon.find_or_create_by!(code: "GLOW200") do |c|
      c.description = "Flat 200 off"
      c.discount_type = "flat"
      c.discount_value = 200.0
      c.min_order_amount = 500.0
      c.status = "active"
      c.valid_from = 1.day.ago
      c.valid_until = 30.days.from_now
      c.usage_limit = 100
      c.usage_count = 0
    end
  end

  # Step 1: Select Services
  test "Step 1: GET /api/v1/booking_flow/services returns active services with city price override" do
    get "/api/v1/booking_flow/services",
        params: { city_id: @city.id },
        headers: @auth_headers

    assert_response :success
    json = JSON.parse(response.body)
    assert_equal "success", json["status"]
    assert json["data"].is_a?(Array)

    gold_service = json["data"].find { |s| s["id"] == @service.id }
    assert_not_nil gold_service
    assert_equal "1199.0", gold_service["effective_price"]
    assert_equal true, gold_service["has_city_override"]
  end

  # Step 2: Location Selection
  test "Step 2: GET /api/v1/booking_flow/locations returns admin-configured serviceable cities with worker count" do
    get "/api/v1/booking_flow/locations", headers: @auth_headers

    assert_response :success
    json = JSON.parse(response.body)
    assert_equal "success", json["status"]

    mumbai_city = json["data"].find { |c| c["id"] == @city.id }
    assert_not_nil mumbai_city
    assert_equal "Mumbai", mumbai_city["name"]
    assert_equal true, mumbai_city["serviceable"]
    assert mumbai_city["available_workers_count"] >= 1
  end

  # Step 3: Date Selection
  test "Step 3: GET /api/v1/booking_flow/dates returns rolling dates with real worker availability" do
    get "/api/v1/booking_flow/dates",
        params: { city_id: @city.id, days: 14 },
        headers: @auth_headers

    assert_response :success
    json = JSON.parse(response.body)
    assert_equal "success", json["status"]

    dates = json["data"]["dates"]
    assert_equal 14, dates.length
    assert_equal Date.current.strftime("%Y-%m-%d"), dates.first["date"]
    assert dates.first.key?("is_available")
    assert dates.first.key?("available_therapists_count")
    assert dates.first.key?("day_short")
  end

  # Step 4: Available Time Slot
  test "Step 4: GET /api/v1/booking_flow/time_slots returns standard time slots" do
    # Choose a date on Friday (worker is on duty)
    friday_date = Date.current.next_occurring(:friday).strftime("%Y-%m-%d")

    get "/api/v1/booking_flow/time_slots",
        params: { city_id: @city.id, date: friday_date },
        headers: @auth_headers

    assert_response :success
    json = JSON.parse(response.body)
    assert_equal "success", json["status"]

    slots = json["data"]["time_slots"]
    assert slots.any?
    slot_labels = slots.map { |s| s["slot"] }
    assert_includes slot_labels, "10:30 AM"
    assert_includes slot_labels, "03:00 PM"
    assert_includes slot_labels, "06:00 PM"

    avail_slot = slots.find { |s| s["slot"] == "10:30 AM" }
    assert_equal true, avail_slot["is_available"]
    assert avail_slot["available_workers_count"] >= 1
  end

  # Step 5: Staff / Therapist Selection
  test "Step 5: GET /api/v1/booking_flow/therapists lists real available therapists" do
    friday_date = Date.current.next_occurring(:friday).strftime("%Y-%m-%d")

    get "/api/v1/booking_flow/therapists",
        params: { city_id: @city.id, date: friday_date, time_slot: "10:30 AM" },
        headers: @auth_headers

    assert_response :success
    json = JSON.parse(response.body)
    assert_equal "success", json["status"]

    assert json["data"].key?("auto_assign_option")
    assert_nil json["data"]["auto_assign_option"]["id"]
    assert_equal true, json["data"]["auto_assign_option"]["recommended"]

    therapists = json["data"]["therapists"]
    assert therapists.any?
    pooja = therapists.find { |t| t["id"] == @worker.id }
    assert_not_nil pooja
    assert_equal "Pooja Sharma", pooja["name"]
    assert_equal 4.9, pooja["rating"]
  end

  # Step 6: Customer Details & Address Selection
  test "Step 6: GET & POST /api/v1/booking_flow/addresses" do
    get "/api/v1/booking_flow/addresses",
        params: { city_id: @city.id },
        headers: @auth_headers

    assert_response :success
    json = JSON.parse(response.body)
    assert_equal "success", json["status"]
    assert json["data"].any?
    assert_equal true, json["data"].first["matching_city"]

    # Test creating new address inline
    assert_difference -> { @customer.addresses.count }, 1 do
      post "/api/v1/booking_flow/addresses",
           params: {
             address: {
               label: "Work",
               line1: "Tower B, BKC Complex",
               city: "Mumbai",
               city_id: @city.id,
               state: "Maharashtra",
               pincode: "400051"
             }
           },
           headers: @auth_headers

      assert_response :created
    end
  end

  # Step 7: Booking Summary
  test "Step 7: POST /api/v1/booking_flow/summary computes pricing, city override and coupon" do
    friday_date = Date.current.next_occurring(:friday).strftime("%Y-%m-%d")

    post "/api/v1/booking_flow/summary",
         params: {
           city_id: @city.id,
           address_id: @address.id,
           date: friday_date,
           time_slot: "10:30 AM",
           items: [
             { service_id: @service.id, quantity: 2 }
           ],
           coupon_code: "GLOW200"
         },
         headers: @auth_headers

    assert_response :success
    json = JSON.parse(response.body)
    assert_equal "success", json["status"]

    data = json["data"]
    # Unit price with Mumbai override: 1199.0 * 2 = 2398.0
    assert_equal 2398.0, data["subtotal"].to_f
    # Coupon discount: 200.0
    assert_equal 200.0, data["discount"].to_f
    # Total: 2198.0
    assert_equal 2198.0, data["total"].to_f
    assert_equal 120, data["duration_minutes"]
    assert_equal "Pooja Sharma", data["therapist_name"]
  end

  # Step 8: Payment Options
  test "Step 8: GET /api/v1/booking_flow/payment_options returns payment methods" do
    get "/api/v1/booking_flow/payment_options", headers: @auth_headers

    assert_response :success
    json = JSON.parse(response.body)
    assert_equal "success", json["status"]

    methods = json["data"].map { |m| m["id"] }
    assert_includes methods, "cod"
    assert_includes methods, "upi"
    assert_includes methods, "card"
    assert_includes methods, "netbanking"
    assert_includes methods, "wallet"
  end

  # Step 9: Booking Confirmed (Direct items)
  test "Step 9: POST /api/v1/booking_flow/confirm creates booking, payment and assigns worker" do
    friday_date = Date.current.next_occurring(:friday).strftime("%Y-%m-%d")

    assert_difference -> { Booking.count }, 1 do
      assert_difference -> { Payment.count }, 1 do
        post "/api/v1/booking_flow/confirm",
             params: {
               city_id: @city.id,
               address_id: @address.id,
               date: friday_date,
               time_slot: "10:30 AM",
               therapist_id: @worker.id,
               items: [
                 { service_id: @service.id, quantity: 1 }
               ],
               coupon_code: "GLOW200",
               payment_method: "upi",
               notes: "Please ring the bell twice"
             },
             headers: @auth_headers

        assert_response :created
      end
    end

    json = JSON.parse(response.body)
    assert_equal "success", json["status"]
    data = json["data"]

    assert_equal "confirmed", data["booking_status"]
    assert_equal "10:30 AM", data["time_slot"]
    assert_equal @worker.id, data["therapist"]["id"]
    assert_equal "Pooja Sharma", data["therapist"]["name"]
    # Total with Mumbai price (1199) - 200 coupon = 999
    assert_equal 999.0, data["total"]
    assert_equal "completed", data["payment"]["status"]
    assert_equal "upi", data["payment"]["method"]

    created_booking = Booking.find(data["id"])
    assert_equal @city.id, created_booking.city_id
    assert_equal "10:30 AM", created_booking.time_slot
  end

  # Step 9: Booking Confirmed from Cart
  test "Step 9: POST /api/v1/booking_flow/confirm from cart clears cart upon success" do
    friday_date = Date.current.next_occurring(:friday).strftime("%Y-%m-%d")

    # Add item to cart first
    cart = @customer.active_cart
    cart.cart_items.create!(service: @service, quantity: 1)
    assert_equal 1, cart.cart_items.count

    post "/api/v1/booking_flow/confirm",
         params: {
           city_id: @city.id,
           address_id: @address.id,
           date: friday_date,
           time_slot: "01:30 PM",
           from_cart: true,
           payment_method: "cod"
         },
         headers: @auth_headers

    assert_response :created
    cart.reload
    assert_equal 0, cart.cart_items.count, "Expected cart to be emptied after checkout"
  end

  test "Booking flow endpoints require authentication" do
    get "/api/v1/booking_flow/locations"
    assert_response :unauthorized

    get "/api/v1/booking_flow/dates", params: { city_id: @city.id }
    assert_response :unauthorized
  end
end
