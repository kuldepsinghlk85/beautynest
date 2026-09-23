# frozen_string_literal: true

require "test_helper"

class Api::V1::ServicesSearchTest < ActionDispatch::IntegrationTest
  def setup
    @category = Category.create!(
      name: "Salon for Women",
      description: "Beauty and salon treatments",
      status: "active"
    )

    @subcategory = Subcategory.create!(
      name: "Facial & Skincare",
      category: @category,
      status: "active"
    )

    @service_1 = Service.create!(
      subcategory: @subcategory,
      name: "Glow Facial Treatment",
      description: "Hydrating and revitalizing facial treatment for radiant skin",
      base_price: 1500.0,
      discount_price: 1299.0,
      duration_minutes: 60,
      tag: "facial",
      featured: true,
      status: "active"
    )

    @service_2 = Service.create!(
      subcategory: @subcategory,
      name: "Deep Cleansing Cleanup",
      description: "Removes blackheads and dead skin cells",
      base_price: 800.0,
      discount_price: 699.0,
      duration_minutes: 40,
      tag: "facial",
      status: "active"
    )

    @service_3 = Service.create!(
      subcategory: @subcategory,
      name: "Deluxe Pedicure Experience",
      description: "Relaxing foot soak and massage",
      base_price: 900.0,
      discount_price: 799.0,
      duration_minutes: 50,
      tag: "mani-padi",
      status: "active"
    )
  end

  test "GET /api/v1/services/search is publicly accessible without token" do
    get "/api/v1/services/search", params: { q: "glow" }
    assert_response :success
    json = JSON.parse(response.body)
    assert_equal "success", json["status"]
    assert_equal "glow", json["query"]
    assert_equal 1, json["total_results"]
    assert_equal @service_1.id, json["data"].first["id"]
  end

  test "GET /api/v1/search standalone endpoint works identically" do
    get "/api/v1/search", params: { q: "pedicure" }
    assert_response :success
    json = JSON.parse(response.body)
    assert_equal "success", json["status"]
    assert_equal 1, json["total_results"]
    assert_equal @service_3.name, json["data"].first["name"]
  end

  test "debounced partial query matches service name" do
    get "/api/v1/services/search", params: { q: "fac" }
    assert_response :success
    json = JSON.parse(response.body)
    # Both service_1 (Glow Facial) and subcategory/tag matches
    ids = json["data"].map { |s| s["id"] }
    assert_includes ids, @service_1.id
    assert_includes ids, @service_2.id
  end

  test "search matches description keywords" do
    get "/api/v1/services/search", params: { q: "blackhead" }
    assert_response :success
    json = JSON.parse(response.body)
    assert_equal 1, json["total_results"]
    assert_equal @service_2.id, json["data"].first["id"]
  end

  test "search matches category or subcategory name" do
    get "/api/v1/services/search", params: { q: "Skincare" }
    assert_response :success
    json = JSON.parse(response.body)
    assert json["total_results"] >= 2
  end

  test "empty query returns empty array unless popular/featured is requested" do
    get "/api/v1/services/search", params: { q: "" }
    assert_response :success
    json = JSON.parse(response.body)
    assert_equal 0, json["total_results"]
    assert_equal [], json["data"]

    # When popular/featured is requested on empty query
    get "/api/v1/services/search", params: { q: "", popular: "true" }
    assert_response :success
    json = JSON.parse(response.body)
    assert json["total_results"] >= 1
    assert_equal @service_1.id, json["data"].first["id"]
  end

  test "search respects category filter" do
    other_cat = Category.create!(name: "Men Grooming", status: "active")
    get "/api/v1/services/search", params: { q: "facial", category_id: other_cat.id }
    assert_response :success
    json = JSON.parse(response.body)
    assert_equal 0, json["total_results"]
  end

  test "search results include rating and pricing data" do
    get "/api/v1/services/search", params: { q: "glow" }
    assert_response :success
    json = JSON.parse(response.body)
    item = json["data"].first
    assert item.key?("average_rating")
    assert item.key?("effective_price")
    assert item.key?("duration_minutes")
    assert item.key?("category")
  end
end
