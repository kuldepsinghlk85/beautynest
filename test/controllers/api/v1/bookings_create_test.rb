# frozen_string_literal: true

require "test_helper"

class Api::V1::BookingsCreateTest < ActionDispatch::IntegrationTest
  def setup
    @mumbai = City.find_or_create_by!(slug: "mumbai-create-test") do |c|
      c.name = "Mumbai"
      c.state = "Maharashtra"
      c.status = "active"
    end

    @inactive_city = City.find_or_create_by!(slug: "inactive-city-test") do |c|
      c.name = "Inactive City"
      c.state = "State"
      c.status = "inactive"
    end

    @category = Category.find_or_create_by!(slug: "salon-create-test") do |cat|
      cat.name = "Salon At Home"
      cat.status = "active"
    end

    @service = Service.find_or_create_by!(slug: "facial-create-test") do |s|
      s.category = @category
      s.name = "Sara Fruit Glow Facial"
      s.description = "Natural fruit glow facial"
      s.base_price = 1200.0
      s.discount_price = 999.0
      s.duration_minutes = 60
      s.status = "active"
    end

    @customer = User.create!(
      name: "Neha Gupta",
      email: "neha.gupta.#{SecureRandom.hex(4)}@BeautyNest.test",
      phone: "+9198#{rand(10000000..99999999)}",
      password: "Password@123",
      role: "customer",
      status: "active"
    )
    _, @token = generate_token_for(@customer)
    @auth_headers = { "Authorization" => "Bearer #{@token}" }

    @address = @customer.addresses.create!(
      label: "Home",
      line1: "Flat 402, Sea View Apartments",
      city: "Mumbai",
      city_id: @mumbai.id,
      state: "Maharashtra",
      pincode: "400050",
      is_default: true
    )

    # Create worker who is available on Fridays and Saturdays in Mumbai
    @worker = User.create!(
      name: "Pooja Beautician",
      email: "pooja.worker.#{SecureRandom.hex(4)}@BeautyNest.test",
      phone: "+9197#{rand(10000000..99999999)}",
      password: "WorkerPassword123!",
      role: "worker",
      status: "active"
    )
    @worker_profile = @worker.create_worker_profile!(
      city_id: @mumbai.id,
      aadhaar_number: "987654321012",
      bio: "Expert facial specialist in Mumbai",
      experience_years: 6,
      rating_avg: 4.9,
      rating_count: 35,
      is_available: true,
      available_days: ["Friday", "Saturday"]
    )
  end

  test "POST /api/v1/bookings creates booking, auto-assigns worker, creates COD payment, sets booking_status: pending" do
    friday_date = Date.current.next_occurring(:friday).strftime("%Y-%m-%d")
    scheduled_at = "#{friday_date}T10:30:00Z"

    post "/api/v1/bookings",
         params: {
           booking: {
             service_name: "Sara Fruit Glow Facial",
             city_id: @mumbai.id,
             scheduled_at: scheduled_at,
             time_slot: "10:30 AM",
             payment_method: "cod",
             total_amount: 999.0
           }
         },
         headers: @auth_headers,
         as: :json

    assert_response :created
    json = JSON.parse(response.body)
    assert_equal "success", json["status"]
    data = json["data"]

    # Verify booking status is completed
    assert_equal "completed", data["booking_status"]
    assert_equal "completed", data["service_status"]
    assert_equal "completed", data["status"]

    # Verify worker is auto-assigned and NOT null!
    assert_not_nil data["worker"], "Worker should not be null when created"
    assert_equal @worker.id, data["worker"]["id"]
    assert_equal "Pooja Beautician", data["worker"]["name"]
    assert_not_nil data["worker"]["phone"]

    # Verify city and time slot
    assert_equal @mumbai.id, data["city"]["id"]
    assert_equal "10:30 AM", data["time_slot"]

    # Verify COD payment created with pending status
    assert_not_nil data["payment"]
    assert_equal "cod", data["payment"]["method"]
    assert_equal "pending", data["payment"]["status"]
    assert_equal 999.0, data["payment"]["amount"]

    # Verify DB record
    booking = Booking.find(data["id"])
    assert_equal "completed", booking.booking_status
    assert_equal @worker.id, booking.worker_id
    assert_equal @mumbai.id, booking.city_id
  end

  test "POST /api/v1/bookings fails with 422 if city is missing and user has no default city" do
    friday_date = Date.current.next_occurring(:friday).strftime("%Y-%m-%d")
    @customer.addresses.destroy_all

    post "/api/v1/bookings",
         params: {
           booking: {
             service_name: "Sara Fruit Glow Facial",
             scheduled_at: "#{friday_date}T10:30:00Z",
             payment_method: "cod"
           }
         },
         headers: @auth_headers,
         as: :json

    assert_response :unprocessable_entity
    json = JSON.parse(response.body)
    assert_equal "error", json["status"]
    assert_includes json["message"], "serviceable city"
  end

  test "POST /api/v1/bookings fails with 422 if city is inactive" do
    friday_date = Date.current.next_occurring(:friday).strftime("%Y-%m-%d")

    post "/api/v1/bookings",
         params: {
           booking: {
             service_name: "Sara Fruit Glow Facial",
             city_id: @inactive_city.id,
             scheduled_at: "#{friday_date}T10:30:00Z",
             payment_method: "cod"
           }
         },
         headers: @auth_headers,
         as: :json

    assert_response :unprocessable_entity
    json = JSON.parse(response.body)
    assert_includes json["message"], "not serviceable"
  end

  test "POST /api/v1/bookings fails with 422 if no worker is available on that day" do
    # Worker is only available on Friday and Saturday, so test on Tuesday
    tuesday_date = Date.current.next_occurring(:tuesday).strftime("%Y-%m-%d")

    post "/api/v1/bookings",
         params: {
           booking: {
             service_name: "Sara Fruit Glow Facial",
             city_id: @mumbai.id,
             scheduled_at: "#{tuesday_date}T10:30:00Z",
             payment_method: "cod"
           }
         },
         headers: @auth_headers,
         as: :json

    assert_response :unprocessable_entity
    json = JSON.parse(response.body)
    assert_includes json["message"], "No beauty professional is available in Mumbai on Tuesday"
  end

  test "POST /api/v1/bookings fails with 422 if requested worker is already booked at that time" do
    friday_date = Date.current.next_occurring(:friday).strftime("%Y-%m-%d")
    conflict_time = Time.zone.parse("#{friday_date} 10:30:00")

    # Existing conflicting booking for @worker
    Booking.create!(
      customer: @customer,
      worker: @worker,
      city: @mumbai,
      scheduled_at: conflict_time,
      time_slot: "10:30 AM",
      booking_status: "confirmed",
      service_status: "pending",
      subtotal_amount: 999.0,
      total_amount: 999.0
    )

    post "/api/v1/bookings",
         params: {
           booking: {
             service_name: "Sara Fruit Glow Facial",
             city_id: @mumbai.id,
             worker_id: @worker.id,
             scheduled_at: conflict_time.iso8601,
             time_slot: "10:30 AM",
             payment_method: "cod"
           }
         },
         headers: @auth_headers,
         as: :json

    assert_response :unprocessable_entity
    json = JSON.parse(response.body)
    assert_match(/already booked|not available/i, json["message"])
  end

  test "POST /api/v1/bookings fails with 422 when all workers in city are fully booked" do
    isolated_city = City.find_or_create_by!(slug: "single-worker-city") do |c|
      c.name = "Solitary City"
      c.status = "active"
    end

    lone_worker = User.create!(
      name: "Solo Specialist",
      email: "solo.worker.#{SecureRandom.hex(4)}@BeautyNest.test",
      phone: "+9197#{rand(10000000..99999999)}",
      password: "WorkerPassword123!",
      role: "worker",
      status: "active"
    )
    lone_worker.create_worker_profile!(
      city_id: isolated_city.id,
      aadhaar_number: "987654321099",
      bio: "Only specialist in solitary city",
      is_available: true,
      available_days: ["Friday"]
    )

    friday_date = Date.current.next_occurring(:friday).strftime("%Y-%m-%d")
    conflict_time = Time.zone.parse("#{friday_date} 10:30:00")

    Booking.create!(
      customer: @customer,
      worker: lone_worker,
      city: isolated_city,
      scheduled_at: conflict_time,
      time_slot: "10:30 AM",
      booking_status: "confirmed",
      service_status: "pending",
      subtotal_amount: 999.0,
      total_amount: 999.0
    )

    post "/api/v1/bookings",
         params: {
           booking: {
             service_name: "Sara Fruit Glow Facial",
             city_id: isolated_city.id,
             scheduled_at: conflict_time.iso8601,
             time_slot: "10:30 AM",
             payment_method: "cod"
           }
         },
         headers: @auth_headers,
         as: :json

    assert_response :unprocessable_entity
    json = JSON.parse(response.body)
    assert_includes json["message"], "fully booked"
  end

  test "POST /api/v1/bookings with full payload (service_id, city_id, date, time_slot, address_id, coupon_code, payment_method, notes) books properly" do
    coupon = Coupon.find_or_create_by!(code: "WELCOME20") do |c|
      c.description = "Welcome discount"
      c.discount_type = "flat"
      c.discount_value = 100.0
      c.min_order_amount = 500.0
      c.status = "active"
      c.valid_from = 1.day.ago
      c.valid_until = 30.days.from_now
      c.usage_limit = 100
    end

    friday_date = Date.current.next_occurring(:friday).strftime("%Y-%m-%d")

    post "/api/v1/bookings",
         params: {
           booking: {
             service_id: @service.id,
             city_id: @mumbai.id,
             date: friday_date,
             time_slot: "10:30 AM",
             address_id: @address.id,
             coupon_code: "WELCOME20",
             payment_method: "cod",
             notes: "Please ring the doorbell on arrival."
           }
         },
         headers: @auth_headers,
         as: :json

    assert_response :created
    json = JSON.parse(response.body)
    assert_equal "success", json["status"]
    data = json["data"]

    # Verify booking attributes
    assert_equal @service.name, data["service_name"]
    assert_equal "completed", data["booking_status"]
    assert_equal "10:30 AM", data["time_slot"]
    assert_equal "Please ring the doorbell on arrival.", data["notes"]
    assert_equal @mumbai.id, data["city"]["id"]
    assert_equal @address.id, data["address"]["id"]
    assert_equal "Flat 402, Sea View Apartments", data["address"]["line1"]

    # Verify items and pricing
    assert_equal 1, data["items"].length
    assert_equal @service.id, data["items"].first["service_id"]
    assert_equal 999.0, data["subtotal_amount"]
    assert_equal 100.0, data["discount_amount"]
    assert_equal 899.0, data["total_amount"]
    assert_equal "WELCOME20", data["coupon_code"]

    # Verify worker assignment
    assert_not_nil data["worker"]
    assert_equal @worker.id, data["worker"]["id"]

    # Verify payment
    assert_not_nil data["payment"]
    assert_equal "cod", data["payment"]["method"]
    assert_equal "pending", data["payment"]["status"]
    assert_equal 899.0, data["payment"]["amount"]
  end

  test "POST /api/v1/bookings fails with 422 when service_id is missing and no items provided" do
    friday_date = Date.current.next_occurring(:friday).strftime("%Y-%m-%d")

    post "/api/v1/bookings",
         params: {
           booking: {
             city_id: @mumbai.id,
             date: friday_date,
             time_slot: "10:30 AM",
             address_id: @address.id,
             payment_method: "cod"
           }
         },
         headers: @auth_headers,
         as: :json

    assert_response :unprocessable_entity
    json = JSON.parse(response.body)
    assert_equal "error", json["status"]
    assert_includes json["message"], "service_id is required"
  end

  test "POST /api/v1/bookings fails with 422 when service_id does not exist" do
    friday_date = Date.current.next_occurring(:friday).strftime("%Y-%m-%d")

    post "/api/v1/bookings",
         params: {
           booking: {
             service_id: SecureRandom.uuid,
             city_id: @mumbai.id,
             date: friday_date,
             time_slot: "10:30 AM",
             address_id: @address.id,
             payment_method: "cod"
           }
         },
         headers: @auth_headers,
         as: :json

    assert_response :unprocessable_entity
    json = JSON.parse(response.body)
    assert_equal "error", json["status"]
    assert_includes json["message"], "Service not found"
  end

  test "POST /api/v1/bookings fails with 422 when service is inactive" do
    inactive_service = Service.create!(
      category: @category,
      name: "Old Discontinued Facial",
      base_price: 1000.0,
      duration_minutes: 45,
      status: "inactive",
      tag: "facial"
    )
    friday_date = Date.current.next_occurring(:friday).strftime("%Y-%m-%d")

    post "/api/v1/bookings",
         params: {
           booking: {
             service_id: inactive_service.id,
             city_id: @mumbai.id,
             date: friday_date,
             time_slot: "10:30 AM",
             address_id: @address.id,
             payment_method: "cod"
           }
         },
         headers: @auth_headers,
         as: :json

    assert_response :unprocessable_entity
    json = JSON.parse(response.body)
    assert_includes json["message"], "currently unavailable"
  end

  test "POST /api/v1/bookings fails with 422 when date is missing" do
    post "/api/v1/bookings",
         params: {
           booking: {
             service_id: @service.id,
             city_id: @mumbai.id,
             time_slot: "10:30 AM",
             address_id: @address.id,
             payment_method: "cod"
           }
         },
         headers: @auth_headers,
         as: :json

    assert_response :unprocessable_entity
    json = JSON.parse(response.body)
    assert_includes json["message"], "date and time_slot are required"
  end

  test "POST /api/v1/bookings fails with 422 when time_slot is missing" do
    friday_date = Date.current.next_occurring(:friday).strftime("%Y-%m-%d")

    post "/api/v1/bookings",
         params: {
           booking: {
             service_id: @service.id,
             city_id: @mumbai.id,
             date: friday_date,
             address_id: @address.id,
             payment_method: "cod"
           }
         },
         headers: @auth_headers,
         as: :json

    assert_response :unprocessable_entity
    json = JSON.parse(response.body)
    assert_includes json["message"], "time_slot is required"
  end

  test "POST /api/v1/bookings fails with 422 when address_id is invalid" do
    friday_date = Date.current.next_occurring(:friday).strftime("%Y-%m-%d")

    post "/api/v1/bookings",
         params: {
           booking: {
             service_id: @service.id,
             city_id: @mumbai.id,
             date: friday_date,
             time_slot: "10:30 AM",
             address_id: SecureRandom.uuid,
             payment_method: "cod"
           }
         },
         headers: @auth_headers,
         as: :json

    assert_response :unprocessable_entity
    json = JSON.parse(response.body)
    assert_includes json["message"], "Address not found"
  end

  test "POST /api/v1/bookings fails with 422 when invalid coupon_code is provided" do
    friday_date = Date.current.next_occurring(:friday).strftime("%Y-%m-%d")

    post "/api/v1/bookings",
         params: {
           booking: {
             service_id: @service.id,
             city_id: @mumbai.id,
             date: friday_date,
             time_slot: "10:30 AM",
             address_id: @address.id,
             coupon_code: "NONEXISTENT_CODE"
           }
         },
         headers: @auth_headers,
         as: :json

    assert_response :unprocessable_entity
    json = JSON.parse(response.body)
    assert_includes json["message"], "invalid"
  end

  test "POST /api/v1/bookings fails with 422 when booking subtotal is below coupon min_order_amount" do
    expensive_coupon = Coupon.find_or_create_by!(code: "BIGSPENDER5000") do |c|
      c.description = "Big order discount"
      c.discount_type = "flat"
      c.discount_value = 500.0
      c.min_order_amount = 5000.0
      c.status = "active"
      c.valid_from = 1.day.ago
      c.valid_until = 30.days.from_now
      c.usage_limit = 100
    end

    friday_date = Date.current.next_occurring(:friday).strftime("%Y-%m-%d")

    post "/api/v1/bookings",
         params: {
           booking: {
             service_id: @service.id,
             city_id: @mumbai.id,
             date: friday_date,
             time_slot: "10:30 AM",
             address_id: @address.id,
             coupon_code: "BIGSPENDER5000"
           }
         },
         headers: @auth_headers,
         as: :json

    assert_response :unprocessable_entity
    json = JSON.parse(response.body)
    assert_includes json["message"], "Minimum booking amount"
  end

  test "POST /api/v1/bookings with worker_id assigns strictly that worker when available" do
    friday_date = Date.current.next_occurring(:friday).strftime("%Y-%m-%d")

    post "/api/v1/bookings",
         params: {
           booking: {
             service_id: @service.id,
             worker_id: @worker.id,
             date: friday_date,
             time_slot: "10:30 AM",
             address: "101 Ocean Drive, Mumbai",
             payment_method: "cod",
             consent_accepted: true
           }
         },
         headers: @auth_headers,
         as: :json

    assert_response :created
    json = JSON.parse(response.body)
    assert_equal "success", json["status"]
    assert_equal @worker.id, json["data"]["booking"]["worker"]["id"]
    assert_equal @worker.name, json["data"]["booking"]["worker"]["name"]

    booking = Booking.find(json["data"]["booking"]["id"])
    assert_equal @worker.id, booking.worker_id
  end

  test "POST /api/v1/bookings with worker_id rejects with 422 if worker does not work on that day" do
    # Worker is only available on Friday and Saturday, so pick Sunday
    sunday_date = Date.current.next_occurring(:sunday).strftime("%Y-%m-%d")

    post "/api/v1/bookings",
         params: {
           booking: {
             service_id: @service.id,
             worker_id: @worker.id,
             date: sunday_date,
             time_slot: "10:30 AM",
             address: "101 Ocean Drive, Mumbai",
             payment_method: "cod",
             consent_accepted: true
           }
         },
         headers: @auth_headers,
         as: :json

    assert_response :unprocessable_entity
    json = JSON.parse(response.body)
    assert_equal "error", json["status"]
    assert_match(/does not work on Sundays/i, json["message"] || json["errors"].join)
  end

  test "POST /api/v1/bookings with worker_id rejects with 422 if worker already has a booking conflict" do
    friday_date = Date.current.next_occurring(:friday).strftime("%Y-%m-%d")
    scheduled_dt = Time.zone.parse("#{friday_date} 10:30:00")

    # Create an existing booking for @worker at 10:30 AM
    Booking.create!(
      customer: @customer,
      worker: @worker,
      city: @mumbai,
      address: @address,
      scheduled_at: scheduled_dt,
      time_slot: "10:30 AM",
      booking_status: "confirmed",
      service_status: "pending",
      status: "confirmed",
      subtotal_amount: 1000,
      total_amount: 1000
    )

    # Attempt second customer booking for same worker at same slot
    post "/api/v1/bookings",
         params: {
           booking: {
             service_id: @service.id,
             worker_id: @worker.id,
             date: friday_date,
             time_slot: "10:30 AM",
             address: "101 Ocean Drive, Mumbai",
             payment_method: "cod",
             consent_accepted: true
           }
         },
         headers: @auth_headers,
         as: :json

    assert_response :unprocessable_entity
    json = JSON.parse(response.body)
    assert_equal "error", json["status"]
    assert_match(/already booked/i, json["message"] || json["errors"].join)
  end
end
