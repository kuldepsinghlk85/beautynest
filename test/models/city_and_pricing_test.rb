# frozen_string_literal: true

require "test_helper"

class CityAndPricingTest < ActiveSupport::TestCase
  setup do
    @category = Category.create!(name: "Test Cat #{SecureRandom.hex(3)}", status: "active")
    @subcategory = Subcategory.create!(category: @category, name: "Test Sub #{SecureRandom.hex(3)}", status: "active")
    @service = Service.create!(
      subcategory: @subcategory,
      name: "Global Service #{SecureRandom.hex(3)}",
      tag: "facial",
      base_price: 1000,
      discount_price: 800,
      duration_minutes: 60,
      status: "active"
    )
    @city_mumbai = City.create!(name: "Mumbai #{SecureRandom.hex(3)}", state: "Maharashtra", status: "active")
    @city_delhi  = City.create!(name: "Delhi #{SecureRandom.hex(3)}",  state: "Delhi", status: "active")
  end

  test "creates city with slug" do
    city = City.create!(name: "Kolkata City", state: "West Bengal", status: "active")
    assert_equal "kolkata-city", city.slug
    assert city.active?
  end

  test "service returns default price when no city override exists" do
    assert_equal 1000, @service.base_price_for_city(@city_mumbai.id)
    assert_equal 800,  @service.discount_price_for_city(@city_mumbai.id)
    assert_equal 800,  @service.effective_price_for_city(@city_mumbai.id)
  end

  test "service returns city-specific price override when configured" do
    override = ServiceCityPrice.create!(
      service: @service,
      city: @city_mumbai,
      base_price: 1200,
      discount_price: 950,
      status: "active"
    )

    assert_equal 1200, @service.base_price_for_city(@city_mumbai.id)
    assert_equal 950,  @service.discount_price_for_city(@city_mumbai.id)
    assert_equal 950,  @service.effective_price_for_city(@city_mumbai.id)
    assert_equal "₹950", @service.display_price_for_city(@city_mumbai.id)

    # Delhi still falls back to default
    assert_equal 800, @service.effective_price_for_city(@city_delhi.id)
  end

  test "enforces discount_price strictly less than base_price on city override" do
    override = ServiceCityPrice.new(
      service: @service,
      city: @city_delhi,
      base_price: 1000,
      discount_price: 1200,
      status: "active"
    )
    assert_not override.valid?
    assert_includes override.errors[:discount_price], "must be less than 1000.0"
  end

  test "enforces uniqueness of city per service" do
    ServiceCityPrice.create!(
      service: @service,
      city: @city_mumbai,
      base_price: 1100,
      status: "active"
    )

    duplicate = ServiceCityPrice.new(
      service: @service,
      city: @city_mumbai,
      base_price: 1300,
      status: "active"
    )
    assert_not duplicate.valid?
    assert_includes duplicate.errors[:city_id], "already has a price configured for this service"
  end

  test "creates city with nested service price overrides" do
    city = City.create!(
      name: "Pune #{SecureRandom.hex(3)}",
      state: "Maharashtra",
      status: "active",
      service_city_prices_attributes: [
        {
          service_id: @service.id,
          base_price: 1150,
          discount_price: 900,
          status: "active"
        }
      ]
    )

    assert_equal 1, city.service_city_prices.count
    scp = city.service_city_prices.first
    assert_equal @service.id, scp.service_id
    assert_equal 1150, scp.base_price
    assert_equal 900, scp.discount_price
    assert_equal 900, @service.effective_price_for_city(city.id)
  end

  test "updates and destroys nested service price overrides on city" do
    city = City.create!(
      name: "Bengaluru #{SecureRandom.hex(3)}",
      status: "active",
      service_city_prices_attributes: [
        { service_id: @service.id, base_price: 1200, status: "active" }
      ]
    )
    scp = city.service_city_prices.first

    # Update price
    city.update!(
      service_city_prices_attributes: [
        { id: scp.id, base_price: 1350 }
      ]
    )
    assert_equal 1350, scp.reload.base_price

    # Delete via _destroy
    assert_difference -> { ServiceCityPrice.count }, -1 do
      city.update!(
        service_city_prices_attributes: [
          { id: scp.id, _destroy: "1" }
        ]
      )
    end
    assert_equal 0, city.reload.service_city_prices.count
  end

  test "rejects duplicate service overrides in city nested attributes" do
    city = City.new(
      name: "Chennai #{SecureRandom.hex(3)}",
      status: "active",
      service_city_prices_attributes: [
        { service_id: @service.id, base_price: 1100, status: "active" },
        { service_id: @service.id, base_price: 1200, status: "active" }
      ]
    )
    assert_not city.valid?
    assert_includes city.errors[:base], "Each service can only have one price override per city."
  end
end
