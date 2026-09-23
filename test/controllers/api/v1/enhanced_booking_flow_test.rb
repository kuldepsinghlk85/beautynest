# frozen_string_literal: true

require "test_helper"

module Api
  module V1
    class EnhancedBookingFlowTest < ActionDispatch::IntegrationTest
      setup do
        @mumbai = City.create!(name: "Mumbai", slug: "mumbai-enhanced-#{SecureRandom.hex(4)}", status: "active")
        @category = Category.create!(name: "Salon at Home", slug: "salon-at-home-#{SecureRandom.hex(4)}")
        @subcategory = Subcategory.create!(name: "Facials", slug: "facials-#{SecureRandom.hex(4)}", category: @category)
        @service = Service.create!(
          name: "Signature Glow Facial",
          slug: "signature-glow-facial-#{SecureRandom.hex(4)}",
          subcategory: @subcategory,
          base_price: 1000.0,
          duration_minutes: 60,
          tag: "facial",
          status: "active"
        )

        @customer = User.create!(
          name: "Ananya Sharma",
          email: "ananya.sharma.#{SecureRandom.hex(4)}@example.com",
          phone: "+9191#{rand(10000000..99999999)}",
          password: "CustomerPassword123!",
          role: "customer",
          status: "active"
        )
        _, @token = generate_token_for(@customer)
        @auth_headers = { "Authorization" => "Bearer #{@token}" }

        @address = @customer.addresses.create!(
          label: "Home",
          line1: "Bungalow 7, Bandra West",
          city: "Mumbai",
          city_id: @mumbai.id,
          state: "Maharashtra",
          pincode: "400050",
          is_default: true
        )

        # Worker Tiers
        WorkerTier.ensure_default_tiers!
        @bronze_tier = WorkerTier.find_by!(slug: "bronze")
        @silver_tier = WorkerTier.find_by!(slug: "silver")
        @gold_tier   = WorkerTier.find_by!(slug: "gold")

        # Create workers in Bronze, Silver, Gold tiers
        @bronze_worker = create_tiered_worker("Bronze Worker", @bronze_tier)
        @silver_worker = create_tiered_worker("Silver Worker", @silver_tier)
        @gold_worker   = create_tiered_worker("Gold Worker", @gold_tier)

        # Ensure standard settings
        Setting.set("consent_form_required", "true")
        Setting.set("product_choice_enabled", "true")
        Setting.set("platform_product_fee", "150.0")
      end

      test "GET /api/v1/booking_flow/consent_form returns consent details and product options" do
        get "/api/v1/booking_flow/consent_form", headers: @auth_headers
        assert_response :success
        json = JSON.parse(response.body)
        assert_equal "success", json["status"]
        data = json["data"]

        assert_equal true, data["required"]
        assert_not_nil data["title"]
        assert_not_nil data["version"]
        assert_not_nil data["content"]
        assert_equal 150.0, data["product_choice"]["platform_product_fee"]
        assert_equal 2, data["product_choice"]["options"].length
      end

      test "POST /api/v1/bookings rejects when consent_form_required is true and consent_accepted is false or missing" do
        friday_date = Date.current.next_occurring(:friday).strftime("%Y-%m-%d")

        post "/api/v1/bookings",
             params: {
               booking: {
                 service_id: @service.id,
                 city_id: @mumbai.id,
                 date: friday_date,
                 time_slot: "10:30 AM",
                 address_id: @address.id,
                 worker_id: @bronze_worker.id,
                 consent_accepted: false
               }
             },
             headers: @auth_headers,
             as: :json

        assert_response :unprocessable_entity
        json = JSON.parse(response.body)
        assert_equal "error", json["status"]
        assert_includes json["message"], "agree to the service consent form"
      end

      test "POST /api/v1/bookings succeeds with consent_accepted: true and creates ServiceConsent" do
        friday_date = Date.current.next_occurring(:friday).strftime("%Y-%m-%d")

        post "/api/v1/bookings",
             params: {
               booking: {
                 service_id: @service.id,
                 city_id: @mumbai.id,
                 date: friday_date,
                 time_slot: "10:30 AM",
                 address_id: @address.id,
                 worker_id: @bronze_worker.id,
                 consent_accepted: true,
                 product_source: "customer"
               }
             },
             headers: @auth_headers,
             as: :json

        assert_response :created
        json = JSON.parse(response.body)
        data = json["data"]
        assert_not_nil data["consent"]
        assert_equal true, data["consent"]["terms_accepted"]
        assert_equal "customer", data["consent"]["product_source"]

        # Check DB record
        booking = Booking.find(data["id"])
        assert_not_nil booking.service_consent
        assert_equal true, booking.service_consent.terms_accepted
        assert_equal "customer", booking.service_consent.product_source
      end

      test "POST /api/v1/bookings with platform product source adds platform fee" do
        friday_date = Date.current.next_occurring(:friday).strftime("%Y-%m-%d")

        post "/api/v1/bookings",
             params: {
               booking: {
                 service_id: @service.id,
                 city_id: @mumbai.id,
                 date: friday_date,
                 time_slot: "10:30 AM",
                 address_id: @address.id,
                 worker_id: @bronze_worker.id,
                 consent_accepted: true,
                 product_source: "platform"
               }
             },
             headers: @auth_headers,
             as: :json

        assert_response :created
        json = JSON.parse(response.body)
        data = json["data"]

        # Base price 1000 + platform fee 150 = 1150
        assert_equal 1150.0, data["subtotal_amount"]
        assert_equal 1150.0, data["total_amount"]
        assert_equal 150.0, data["platform_product_fee"]
        assert_equal "platform", data["product_source"]

        booking = Booking.find(data["id"])
        assert_equal 1, booking.booking_products.count
        assert_equal 150.0, booking.booking_products.first.price_snapshot.to_f
      end

      test "POST /api/v1/bookings dynamically applies Silver (1.25x) and Gold (1.50x) tier multipliers" do
        friday_date = Date.current.next_occurring(:friday).strftime("%Y-%m-%d")

        # 1. Silver Worker booking (1000 * 1.25 = 1250)
        post "/api/v1/bookings",
             params: {
               booking: {
                 service_id: @service.id,
                 city_id: @mumbai.id,
                 date: friday_date,
                 time_slot: "10:30 AM",
                 address_id: @address.id,
                 worker_id: @silver_worker.id,
                 consent_accepted: true,
                 product_source: "customer"
               }
             },
             headers: @auth_headers,
             as: :json

        assert_response :created
        data_silver = JSON.parse(response.body)["data"]
        assert_equal 1250.0, data_silver["subtotal_amount"]
        assert_equal 1250.0, data_silver["total_amount"]
        assert_equal "Silver", data_silver["worker_tier"]["name"]

        # 2. Gold Worker booking with platform product kit (1000 * 1.50 = 1500 + 150 fee = 1650)
        post "/api/v1/bookings",
             params: {
               booking: {
                 service_id: @service.id,
                 city_id: @mumbai.id,
                 date: friday_date,
                 time_slot: "12:00 PM",
                 address_id: @address.id,
                 worker_id: @gold_worker.id,
                 consent_accepted: true,
                 product_source: "platform",
                 customer_latitude: 19.0760,
                 customer_longitude: 72.8777
               }
             },
             headers: @auth_headers,
             as: :json

        assert_response :created
        data_gold = JSON.parse(response.body)["data"]
        assert_equal 1650.0, data_gold["subtotal_amount"]
        assert_equal 1650.0, data_gold["total_amount"]
        assert_equal "Gold", data_gold["worker_tier"]["name"]
        assert_in_delta 19.0760, data_gold["customer_latitude"], 0.001
        assert_in_delta 72.8777, data_gold["customer_longitude"], 0.001
      end

      test "POST /api/v1/bookings uses ServiceTierPrice override if present" do
        # Configure specific Gold price override: 1800 instead of 1500
        ServiceTierPrice.create!(service: @service, worker_tier: @gold_tier, price: 1800.0)

        friday_date = Date.current.next_occurring(:friday).strftime("%Y-%m-%d")

        post "/api/v1/bookings",
             params: {
               booking: {
                 service_id: @service.id,
                 city_id: @mumbai.id,
                 date: friday_date,
                 time_slot: "01:30 PM",
                 address_id: @address.id,
                 worker_id: @gold_worker.id,
                 consent_accepted: true,
                 product_source: "customer"
               }
             },
             headers: @auth_headers,
             as: :json

        assert_response :created
        data = JSON.parse(response.body)["data"]
        assert_equal 1800.0, data["subtotal_amount"]
        assert_equal 1800.0, data["total_amount"]
      end

      private

      def create_tiered_worker(name, tier)
        worker = User.create!(
          name: name,
          email: "#{name.parameterize}.#{SecureRandom.hex(4)}@BeautyNest.test",
          phone: "+9198#{rand(10000000..99999999)}",
          password: "WorkerPassword123!",
          role: "worker",
          status: "active"
        )
        worker.create_worker_profile!(
          city_id: @mumbai.id,
          worker_tier: tier,
          bio: "#{tier.name} specialist",
          experience_years: 5,
          rating_avg: 4.8,
          rating_count: 20,
          is_available: true,
          available_days: ["Friday", "Saturday"]
        )
        worker
      end
    end
  end
end
