# frozen_string_literal: true

require "test_helper"

class Api::V1::WishlistApiTest < ActionDispatch::IntegrationTest
  def setup
    @category = Category.create!(
      name: "Wishlist Test Category",
      description: "Category for testing wishlist",
      status: "active"
    )

    @subcategory = Subcategory.create!(
      name: "Wishlist Test Subcategory",
      category: @category,
      status: "active"
    )

    @service_1 = Service.create!(
      subcategory: @subcategory,
      name: "Wishlist Facial Service",
      description: "Facial treatment for test",
      base_price: 1200.0,
      discount_price: 999.0,
      duration_minutes: 45,
      status: "active"
    )

    @service_2 = Service.create!(
      subcategory: @subcategory,
      name: "Wishlist Hair Spa",
      description: "Hair spa treatment for test",
      base_price: 1800.0,
      discount_price: 1500.0,
      duration_minutes: 60,
      status: "active"
    )

    @customer = User.create!(
      name: "Wishlist Tester",
      email: "wishlist_tester_#{SecureRandom.hex(4)}@example.com",
      phone: "+919#{rand(100000000..999999999)}",
      password: "CustomerPassword123!",
      role: "customer",
      status: "active"
    )

    @other_customer = User.create!(
      name: "Other Customer",
      email: "other_cust_#{SecureRandom.hex(4)}@example.com",
      phone: "+919#{rand(100000000..999999999)}",
      password: "CustomerPassword123!",
      role: "customer",
      status: "active"
    )

    @customer_token = obtain_token_for(@customer)
    @other_token    = obtain_token_for(@other_customer)
  end

  test "unauthenticated requests are rejected" do
    get "/api/v1/wishlist"
    assert_response :unauthorized

    post "/api/v1/wishlist", params: { service_id: @service_1.id }, as: :json
    assert_response :unauthorized
  end

  test "POST /api/v1/wishlist adds a service to customer's wishlist" do
    post "/api/v1/wishlist",
         params: { service_id: @service_1.id },
         headers: auth_header(@customer_token),
         as: :json

    assert_response :created
    json = JSON.parse(response.body)
    assert_equal "success", json["status"]
    assert_equal @service_1.id, json.dig("data", "service_id")
    assert_equal @service_1.name, json.dig("data", "name")
    assert_equal "Service added to wishlist.", json["message"]

    # Calling again for same service returns OK and does not duplicate
    post "/api/v1/wishlist",
         params: { service_id: @service_1.id },
         headers: auth_header(@customer_token),
         as: :json

    assert_response :ok
    json = JSON.parse(response.body)
    assert_equal "Service is already in your wishlist.", json["message"]
    assert_equal 1, @customer.favorites.count
  end

  test "GET /api/v1/wishlist returns the customer's wishlisted services" do
    @customer.favorites.create!(service: @service_1)
    @customer.favorites.create!(service: @service_2)

    get "/api/v1/wishlist", headers: auth_header(@customer_token)

    assert_response :success
    json = JSON.parse(response.body)
    assert_equal "success", json["status"]
    assert_equal 2, json["data"].size

    service_ids = json["data"].map { |item| item["service_id"] }
    assert_includes service_ids, @service_1.id
    assert_includes service_ids, @service_2.id

    first_item = json["data"].first
    assert first_item.key?("name")
    assert first_item.key?("price")
    assert first_item.key?("category_name")
    assert first_item.key?("service")
  end

  test "POST /api/v1/wishlist/toggle toggles service in and out of wishlist" do
    # 1. Toggle ON
    post "/api/v1/wishlist/toggle",
         params: { service_id: @service_1.id },
         headers: auth_header(@customer_token),
         as: :json

    assert_response :created
    json = JSON.parse(response.body)
    assert_equal true, json.dig("data", "in_wishlist")
    assert_equal 1, @customer.favorites.count

    # 2. Toggle OFF
    post "/api/v1/wishlist/toggle",
         params: { service_id: @service_1.id },
         headers: auth_header(@customer_token),
         as: :json

    assert_response :success
    json = JSON.parse(response.body)
    assert_equal false, json.dig("data", "in_wishlist")
    assert_equal 0, @customer.favorites.count
  end

  test "GET /api/v1/wishlist/check checks if a service is in wishlist" do
    get "/api/v1/wishlist/check",
        params: { service_id: @service_1.id },
        headers: auth_header(@customer_token)

    assert_response :success
    json = JSON.parse(response.body)
    assert_equal false, json.dig("data", "in_wishlist")

    @customer.favorites.create!(service: @service_1)

    get "/api/v1/wishlist/check",
        params: { service_id: @service_1.id },
        headers: auth_header(@customer_token)

    assert_response :success
    json = JSON.parse(response.body)
    assert_equal true, json.dig("data", "in_wishlist")
  end

  test "DELETE /api/v1/wishlist/:id removes item by service_id and by favorite_id" do
    fav1 = @customer.favorites.create!(service: @service_1)
    fav2 = @customer.favorites.create!(service: @service_2)

    # Remove by service_id
    delete "/api/v1/wishlist/#{@service_1.id}", headers: auth_header(@customer_token)
    assert_response :success
    assert_nil Favorite.find_by(id: fav1.id)

    # Remove by favorite_id
    delete "/api/v1/wishlist/#{fav2.id}", headers: auth_header(@customer_token)
    assert_response :success
    assert_nil Favorite.find_by(id: fav2.id)

    assert_equal 0, @customer.favorites.count
  end

  test "DELETE /api/v1/wishlist clears all items from wishlist" do
    @customer.favorites.create!(service: @service_1)
    @customer.favorites.create!(service: @service_2)

    delete "/api/v1/wishlist", headers: auth_header(@customer_token)

    assert_response :success
    json = JSON.parse(response.body)
    assert_equal 2, json.dig("data", "cleared_count")
    assert_equal 0, @customer.favorites.count
  end

  test "IDOR protection: customer cannot delete another customer's favorite" do
    other_fav = @other_customer.favorites.create!(service: @service_1)

    delete "/api/v1/wishlist/#{other_fav.id}", headers: auth_header(@customer_token)
    assert_response :not_found

    assert Favorite.exists?(id: other_fav.id)
  end

  test "/api/v1/favorites alias routes work identically" do
    post "/api/v1/favorites",
         params: { service_id: @service_1.id },
         headers: auth_header(@customer_token),
         as: :json

    assert_response :created

    get "/api/v1/favorites", headers: auth_header(@customer_token)
    assert_response :success
    json = JSON.parse(response.body)
    assert_equal 1, json["data"].size
  end

  private

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
