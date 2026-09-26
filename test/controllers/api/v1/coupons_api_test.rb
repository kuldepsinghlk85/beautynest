# frozen_string_literal: true

require "test_helper"

class Api::V1::CouponsApiTest < ActionDispatch::IntegrationTest
  def setup
    @customer = User.create!(
      name: "Ananya Test",
      email: "ananya.coupon.#{SecureRandom.hex(4)}@BeautyNest.test",
      phone: "+9198#{rand(10000000..99999999)}",
      password: "Password@123",
      role: "customer",
      status: "active"
    )
    _, @token = generate_token_for(@customer)
    @auth_headers = { "Authorization" => "Bearer #{@token}" }

    @worker = User.create!(
      name: "Sunita Worker",
      email: "worker.coupon.#{SecureRandom.hex(4)}@BeautyNest.test",
      phone: "+9197#{rand(10000000..99999999)}",
      password: "Password@123",
      role: "worker",
      status: "active"
    )
    _, @worker_token = generate_token_for(@worker)
    @worker_headers = { "Authorization" => "Bearer #{@worker_token}" }

    # Setup test coupons
    @pct_coupon = Coupon.find_or_create_by!(code: "TESTPCT20") do |c|
      c.discount_type = "percentage"
      c.discount_value = 20.0
      c.min_order_amount = 500.0
      c.max_discount = 300.0
      c.status = "active"
      c.valid_from = 1.day.ago
      c.valid_until = 30.days.from_now
      c.usage_limit = 100
      c.usage_count = 0
    end

    @flat_coupon = Coupon.find_or_create_by!(code: "TESTFLAT150") do |c|
      c.discount_type = "flat"
      c.discount_value = 150.0
      c.min_order_amount = 800.0
      c.status = "active"
      c.valid_from = 1.day.ago
      c.valid_until = 30.days.from_now
      c.usage_limit = 100
      c.usage_count = 0
    end

    @expired_coupon = Coupon.find_or_create_by!(code: "TESTEXPIRED") do |c|
      c.discount_type = "flat"
      c.discount_value = 100.0
      c.min_order_amount = 200.0
      c.status = "active"
      c.valid_from = 10.days.ago
      c.valid_until = 1.day.ago
    end
  end

  test "GET /api/v1/coupons requires customer authentication" do
    get "/api/v1/coupons"
    assert_response :unauthorized

    get "/api/v1/coupons", headers: @worker_headers
    assert_response :forbidden
  end

  test "GET /api/v1/coupons returns list of active, valid coupons" do
    get "/api/v1/coupons", headers: @auth_headers
    assert_response :success

    json = JSON.parse(response.body)
    assert_equal "success", json["status"]
    coupons = json["data"]["coupons"]
    assert coupons.is_a?(Array)
    assert coupons.any?

    codes = coupons.map { |c| c["code"] }
    assert_includes codes, "TESTPCT20"
    assert_includes codes, "TESTFLAT150"
    assert_not_includes codes, "TESTEXPIRED", "Expired coupons should not be listed"

    pct = coupons.find { |c| c["code"] == "TESTPCT20" }
    assert_equal "percentage", pct["discount_type"]
    assert_equal 20.0, pct["discount_value"]
    assert_equal 500.0, pct["min_order_amount"]
    assert_equal 300.0, pct["max_discount"]
    assert_not_nil pct["terms"]
  end

  test "GET /api/v1/coupons with ?amount=... calculates applicability and discount" do
    get "/api/v1/coupons", params: { amount: 1000 }, headers: @auth_headers
    assert_response :success

    json = JSON.parse(response.body)
    data = json["data"]
    assert_equal 1000.0, data["order_amount"]
    assert data["applicable_count"] >= 2

    pct = data["coupons"].find { |c| c["code"] == "TESTPCT20" }
    assert_equal true, pct["is_applicable"]
    # 20% of 1000 is 200 (capped at 300) -> 200
    assert_equal 200.0, pct["discount_amount"]

    flat = data["coupons"].find { |c| c["code"] == "TESTFLAT150" }
    assert_equal true, flat["is_applicable"]
    assert_equal 150.0, flat["discount_amount"]

    # Test with amount lower than min_order_amount
    get "/api/v1/coupons", params: { amount: 600 }, headers: @auth_headers
    json2 = JSON.parse(response.body)
    flat2 = json2["data"]["coupons"].find { |c| c["code"] == "TESTFLAT150" }
    assert_equal false, flat2["is_applicable"], "Amount 600 should not be applicable for min_order 800"
  end

  test "GET /api/v1/coupons/:code returns single coupon details" do
    get "/api/v1/coupons/TESTPCT20", headers: @auth_headers
    assert_response :success

    json = JSON.parse(response.body)
    assert_equal "TESTPCT20", json["data"]["code"]
    assert_equal 20.0, json["data"]["discount_value"]
  end

  test "POST /api/v1/coupons/validate successfully validates coupon and computes discount" do
    post "/api/v1/coupons/validate",
         params: { code: "testpct20", amount: 1200 },
         headers: @auth_headers,
         as: :json

    assert_response :success
    json = JSON.parse(response.body)
    assert_equal "success", json["status"]
    data = json["data"]
    assert_equal true, data["valid"]
    assert_equal "TESTPCT20", data["code"]
    # 20% of 1200 is 240
    assert_equal 240.0, data["discount_amount"]
    assert_equal 1200.0, data["subtotal"]
    assert_equal 960.0, data["final_amount"]
  end

  test "POST /api/v1/coupons/validate respects max_discount cap" do
    post "/api/v1/coupons/validate",
         params: { code: "TESTPCT20", amount: 2000 },
         headers: @auth_headers,
         as: :json

    assert_response :success
    json = JSON.parse(response.body)
    data = json["data"]
    # 20% of 2000 is 400, but max_discount is capped at 300
    assert_equal 300.0, data["discount_amount"]
    assert_equal 1700.0, data["final_amount"]
  end

  test "POST /api/v1/coupons/validate returns 422 if amount is less than min_order_amount" do
    post "/api/v1/coupons/validate",
         params: { code: "TESTFLAT150", amount: 500 },
         headers: @auth_headers,
         as: :json

    assert_response :unprocessable_entity
    json = JSON.parse(response.body)
    assert_includes json["errors"].first, "Minimum booking amount of ₹800 is required"
  end

  test "POST /api/v1/coupons/validate returns 422 for invalid or expired coupons" do
    post "/api/v1/coupons/validate",
         params: { code: "NONEXISTENT", amount: 1000 },
         headers: @auth_headers,
         as: :json

    assert_response :unprocessable_entity
    json = JSON.parse(response.body)
    assert_includes json["errors"].first, "invalid"

    post "/api/v1/coupons/validate",
         params: { code: "TESTEXPIRED", amount: 1000 },
         headers: @auth_headers,
         as: :json

    assert_response :unprocessable_entity
    json2 = JSON.parse(response.body)
    assert_includes json2["errors"].first, "expired"
  end
end
