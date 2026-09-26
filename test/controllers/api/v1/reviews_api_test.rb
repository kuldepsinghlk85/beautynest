# frozen_string_literal: true

require "test_helper"

class Api::V1::ReviewsApiTest < ActionDispatch::IntegrationTest
  def setup
    @category = Category.create!(
      name: "Public Test Category",
      description: "Category for public API test",
      status: "active"
    )

    @subcategory = Subcategory.create!(
      name: "Public Test Subcategory",
      category: @category,
      status: "active"
    )

    @service = Service.create!(
      subcategory: @subcategory,
      name: "Public Test Service",
      description: "Service for public test",
      base_price: 1500.0,
      discount_price: 1200.0,
      duration_minutes: 60,
      status: "active",
      about: "About Public Test Service details.",
      benefits: ["Benefit 1", "Benefit 2"],
      process: ["Step 1", "Step 2"]
    )

    @customer = User.create!(
      name: "Public Test Customer",
      email: "public_customer_#{SecureRandom.hex(4)}@example.com",
      phone: "+919#{rand(100000000..999999999)}",
      password: "CustomerPassword123!",
      role: "customer",
      status: "active"
    )

    @worker = User.create!(
      name: "Specialist Maya",
      email: "worker_maya_#{SecureRandom.hex(4)}@example.com",
      phone: "+919#{rand(100000000..999999999)}",
      password: "WorkerPassword123!",
      role: "worker",
      status: "active"
    )
    @worker.create_worker_profile!(experience_years: 5, rating_avg: 5.0, rating_count: 1, aadhaar_number: "123456789012")

    @customer_token = obtain_token_for(@customer)
  end

  # ── 1. 6 PUBLIC CATALOG APIS (NO TOKEN REQUIRED) ──────────────────────────
  test "6 Catalog APIs are publicly accessible without authentication" do
    # 1. Categories index
    get "/api/v1/categories"
    assert_response :success
    json = JSON.parse(response.body)
    assert_equal "success", json["status"]

    # 2. Categories show
    get "/api/v1/categories/#{@category.slug}"
    assert_response :success
    json = JSON.parse(response.body)
    assert_equal @category.name, json.dig("data", "name")

    # 3. Subcategories index
    get "/api/v1/subcategories"
    assert_response :success
    json = JSON.parse(response.body)
    assert_equal "success", json["status"]

    # 4. Subcategories show
    get "/api/v1/subcategories/#{@subcategory.slug}"
    assert_response :success
    json = JSON.parse(response.body)
    assert_equal @subcategory.name, json.dig("data", "name")

    # 5. Services index
    get "/api/v1/services"
    assert_response :success
    json = JSON.parse(response.body)
    item = json["data"].find { |s| s["id"] == @service.id }
    assert item.present?
    assert item.key?("average_rating")
    assert item.key?("reviews_count")
    assert item.key?("rating")

    # 6. Services show (with 4 fields: about, benefits, process, reviews)
    get "/api/v1/services/#{@service.slug}"
    assert_response :success
    json = JSON.parse(response.body)
    data = json["data"]
    assert_equal @service.name, data["name"]
    assert_equal "About Public Test Service details.", data["about"]
    assert_equal ["Benefit 1", "Benefit 2"], data["benefits"]
    assert_equal ["Step 1", "Step 2"], data["process"]
    assert data["reviews"].is_a?(Array)
  end

  # ── 2. BOOKING REVIEWS ENDPOINT (/api/v1/booking/reviews) ─────────────────
  test "POST /api/v1/booking/reviews submits review for completed booking and GET lists it" do
    booking = create_test_booking(customer: @customer, worker: @worker, service: @service, service_status: "completed")

    post "/api/v1/booking/reviews", params: {
      booking_id: booking.id,
      rating: 5,
      comment: "Worker Maya was prompt, polite, and skilled."
    }, headers: auth_header(@customer_token), as: :json

    assert_response :created
    json = JSON.parse(response.body)
    assert_equal "success", json["status"]
    assert_equal 5, json.dig("data", "rating")
    assert_equal @service.id, json.dig("data", "service_id")

    # GET /api/v1/booking/reviews
    get "/api/v1/booking/reviews", headers: auth_header(@customer_token)
    assert_response :success
    json = JSON.parse(response.body)
    assert json["data"].any? { |r| r["booking_id"] == booking.id }
  end

  # ── 3. SERVICE REVIEWS ENDPOINT (/api/v1/service/reviews) ─────────────────
  test "POST /api/v1/service/reviews requires completed booking for that service" do
    # Customer has NOT booked or completed @service yet
    post "/api/v1/service/reviews", params: {
      service_id: @service.id,
      rating: 5,
      comment: "Trying to review without completing service"
    }, headers: auth_header(@customer_token), as: :json

    assert_response :unprocessable_entity
    json = JSON.parse(response.body)
    assert json["errors"].first.include?("No completed booking found")

    # Now customer has a booking, but it is pending / in_progress
    booking = create_test_booking(customer: @customer, worker: @worker, service: @service, service_status: "in_progress")

    post "/api/v1/service/reviews", params: {
      service_id: @service.id,
      rating: 5,
      comment: "Trying to review before completion"
    }, headers: auth_header(@customer_token), as: :json

    assert_response :unprocessable_entity
    json = JSON.parse(response.body)
    assert json["errors"].first.include?("once the service status is completed")

    # Now mark booking completed
    booking.update!(service_status: "completed")

    post "/api/v1/service/reviews", params: {
      service_id: @service.id,
      rating: 5,
      comment: "Now service is completed, excellent results!"
    }, headers: auth_header(@customer_token), as: :json

    assert_response :created
    json = JSON.parse(response.body)
    assert_equal "success", json["status"]
    assert_equal @service.id, json.dig("data", "service_id")
    assert_equal 5, json.dig("data", "rating")

    # Second review attempt for same service by same customer must be rejected
    post "/api/v1/service/reviews", params: {
      service_id: @service.id,
      rating: 4,
      comment: "Duplicate attempt"
    }, headers: auth_header(@customer_token), as: :json

    assert_response :unprocessable_entity

    # GET /api/v1/service/reviews?service_id=...
    get "/api/v1/service/reviews", params: { service_id: @service.id }
    assert_response :success
    json = JSON.parse(response.body)
    assert json["data"].any? { |r| r["service_id"] == @service.id && r["rating"] == 5 }

    # GET /api/v1/services/:id includes the newly submitted review and updated rating
    get "/api/v1/services/#{@service.slug}"
    assert_response :success
    json = JSON.parse(response.body)
    assert_equal 5.0, json.dig("data", "average_rating")
    assert_equal 1, json.dig("data", "reviews_count")
    assert json.dig("data", "reviews").any? { |r| r["comment"] == "Now service is completed, excellent results!" }
  end

  test "submitting booking review does not block submitting service review for the completed service" do
    booking = create_test_booking(customer: @customer, worker: @worker, service: @service, service_status: "completed")

    # 1. Customer submits booking review
    post "/api/v1/booking/reviews", params: {
      booking_id: booking.id,
      rating: 5,
      comment: "Worker was fantastic!"
    }, headers: auth_header(@customer_token), as: :json
    assert_response :created

    # 2. Customer submits service review for the same completed service — MUST succeed
    post "/api/v1/service/reviews", params: {
      service_id: @service.id,
      rating: 4,
      comment: "Great skin results from this facial."
    }, headers: auth_header(@customer_token), as: :json
    assert_response :created
    json = JSON.parse(response.body)
    assert_equal "success", json["status"]
    assert_equal 4, json.dig("data", "rating")

    # 3. Duplicate service review is still blocked
    post "/api/v1/service/reviews", params: {
      service_id: @service.id,
      rating: 5,
      comment: "Another service review attempt"
    }, headers: auth_header(@customer_token), as: :json
    assert_response :unprocessable_entity
    json = JSON.parse(response.body)
    assert_includes json["errors"].first, "already been submitted for this service"

    # 4. Duplicate booking review is still blocked
    post "/api/v1/booking/reviews", params: {
      booking_id: booking.id,
      rating: 5,
      comment: "Another booking review attempt"
    }, headers: auth_header(@customer_token), as: :json
    assert_response :unprocessable_entity
    json = JSON.parse(response.body)
    assert_includes json["errors"].first, "already been submitted for this booking"
  end

  private

  def create_test_booking(customer:, worker:, service:, service_status:)
    booking = Booking.create!(
      customer: customer,
      worker: worker,
      booking_status: "confirmed",
      service_status: service_status,
      scheduled_at: 1.day.from_now,
      subtotal_amount: service.effective_price,
      total_amount: service.effective_price,
      discount_amount: 0.0
    )
    BookingItem.create!(
      booking: booking,
      service: service,
      service_name_snapshot: service.name,
      price_snapshot: service.effective_price,
      duration_minutes_snapshot: service.duration_minutes,
      quantity: 1
    )
    booking
  end

  def obtain_token_for(user)
    post "/api/v1/auth/login", params: {
      email: user.email,
      password: "CustomerPassword123!"
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
