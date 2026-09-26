# frozen_string_literal: true

require "test_helper"

class AdminCitiesAndPricingTest < ActionDispatch::IntegrationTest
  setup do
    @admin = User.find_by(email: "admin@BeautyNest.test") || User.create!(
      email: "admin@BeautyNest.test",
      password: "Admin@1234",
      phone: "+919999999999",
      name: "Admin User",
      role: "admin",
      status: "active"
    )
    @category = Category.create!(name: "Pricing Cat #{SecureRandom.hex(3)}", status: "active")
    @subcategory = Subcategory.create!(category: @category, name: "Pricing Sub #{SecureRandom.hex(3)}", status: "active")
    @service = Service.create!(
      subcategory: @subcategory,
      name: "Pricing Service #{SecureRandom.hex(3)}",
      tag: "facial",
      base_price: 1500,
      duration_minutes: 60,
      status: "active"
    )
    @city = City.create!(name: "Test City #{SecureRandom.hex(3)}", state: "State A", status: "active")
  end

  test "GET /admin/cities succeeds for admin" do
    sign_in_admin(@admin)
    get admin_cities_path
    assert_response :success
    assert_includes response.body, "Serviceable Cities"
    assert_includes response.body, @city.name
  end

  test "POST /admin/cities creates a new city" do
    sign_in_admin(@admin)
    assert_difference("City.count", 1) do
      post admin_cities_path, params: {
        city: {
          name: "Hyderabad #{SecureRandom.hex(3)}",
          state: "Telangana",
          status: "active"
        }
      }
    end
    assert_response :redirect
  end

  test "POST /admin/service_city_prices sets custom price override" do
    sign_in_admin(@admin)
    assert_difference("ServiceCityPrice.count", 1) do
      post admin_service_city_prices_path, params: {
        service_city_price: {
          service_id: @service.id,
          city_id: @city.id,
          base_price: 1800,
          discount_price: 1600,
          status: "active"
        }
      }
    end

    assert_redirected_to admin_service_path(@service)
    assert_equal 1600, @service.effective_price_for_city(@city.id)
  end

  test "DELETE /admin/service_city_prices/:id resets to default price" do
    sign_in_admin(@admin)
    scp = ServiceCityPrice.create!(
      service: @service,
      city: @city,
      base_price: 1800,
      discount_price: 1600,
      status: "active"
    )

    assert_difference("ServiceCityPrice.count", -1) do
      delete admin_service_city_price_path(scp)
    end

    assert_redirected_to admin_service_path(@service)
    assert_equal 1500, @service.effective_price_for_city(@city.id)
  end

  test "GET /admin/cities/new renders form with price overrides options" do
    sign_in_admin(@admin)
    get new_admin_city_path
    assert_response :success
    assert_includes response.body, "City-Wise Price Overrides"
    assert_includes response.body, "Add Price Override"
    assert_includes response.body, @service.name
  end

  test "POST /admin/cities creates city with nested price overrides" do
    sign_in_admin(@admin)
    unique_name = "Jaipur #{SecureRandom.hex(3)}"
    assert_difference -> { City.count } => 1, -> { ServiceCityPrice.count } => 1 do
      post admin_cities_path, params: {
        city: {
          name: unique_name,
          state: "Rajasthan",
          status: "active",
          service_city_prices_attributes: {
            "0" => {
              service_id: @service.id,
              base_price: 1750,
              discount_price: 1400,
              status: "active"
            }
          }
        }
      }
    end

    city = City.find_by!(name: unique_name)
    assert_redirected_to admin_city_path(city)
    assert_equal 1, city.service_city_prices.count
    assert_equal 1400, @service.effective_price_for_city(city.id)
  end

  test "GET /admin/cities/:id/edit renders existing price overrides and delete options" do
    sign_in_admin(@admin)
    scp = ServiceCityPrice.create!(
      service: @service,
      city: @city,
      base_price: 1800,
      discount_price: 1600,
      status: "active"
    )

    get edit_admin_city_path(@city)
    assert_response :success
    assert_includes response.body, "City-Wise Price Overrides"
    assert_includes response.body, @service.name
    assert_includes response.body, "1800"
    assert_includes response.body, "remove-existing-btn"
  end

  test "PATCH /admin/cities/:id updates and deletes overrides via nested attributes" do
    sign_in_admin(@admin)
    scp = ServiceCityPrice.create!(
      service: @service,
      city: @city,
      base_price: 1800,
      discount_price: 1600,
      status: "active"
    )

    # Update base price and discount price
    patch admin_city_path(@city), params: {
      city: {
        name: @city.name,
        service_city_prices_attributes: {
          "0" => {
            id: scp.id,
            service_id: @service.id,
            base_price: 1950,
            discount_price: 1700,
            status: "active"
          }
        }
      }
    }
    assert_redirected_to admin_city_path(@city)
    assert_equal 1950, scp.reload.base_price
    assert_equal 1700, scp.discount_price

    # Delete override via _destroy: "1"
    assert_difference -> { ServiceCityPrice.count }, -1 do
      patch admin_city_path(@city), params: {
        city: {
          name: @city.name,
          service_city_prices_attributes: {
            "0" => {
              id: scp.id,
              _destroy: "1"
            }
          }
        }
      }
    end
    assert_redirected_to admin_city_path(@city)
    assert_equal 0, @city.reload.service_city_prices.count
  end

  test "DELETE /admin/service_city_prices/:id redirects to return_to destination" do
    sign_in_admin(@admin)
    scp = ServiceCityPrice.create!(
      service: @service,
      city: @city,
      base_price: 1800,
      discount_price: 1600,
      status: "active"
    )

    delete admin_service_city_price_path(scp, return_to: edit_admin_city_path(@city))
    assert_redirected_to edit_admin_city_path(@city)
    assert_not ServiceCityPrice.exists?(id: scp.id)
  end
end
