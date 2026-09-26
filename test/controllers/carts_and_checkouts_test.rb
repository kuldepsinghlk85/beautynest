# frozen_string_literal: true

require "test_helper"

class CartsAndCheckoutsTest < ActionDispatch::IntegrationTest
  setup do
    @category = Category.create!(
      name: "Facial Care #{SecureRandom.hex(3)}",
      slug: "facial-care-#{SecureRandom.hex(3)}",
      status: "active"
    )

    @service = Service.create!(
      name: "Gold Glow Facial #{SecureRandom.hex(3)}",
      slug: "gold-facial-#{SecureRandom.hex(3)}",
      category: @category,
      base_price: 1200.0,
      duration_minutes: 60,
      status: "active"
    )

    @city_delhi = City.create!(name: "Delhi #{SecureRandom.hex(2)}", state: "Delhi", status: "active")
    @city_mumbai = City.create!(name: "Mumbai #{SecureRandom.hex(2)}", state: "Maharashtra", status: "active")

    @worker = User.create!(
      name: "Priya Specialist",
      email: "priya_#{SecureRandom.hex(4)}@test.com",
      phone: "9876543210",
      role: "worker",
      status: "active",
      password: "password123"
    )

    @worker_profile = WorkerProfile.create!(
      user: @worker,
      city: @city_delhi,
      experience_years: 5,
      is_available: true,
      available_days: %w[Monday Tuesday Wednesday Thursday Friday Saturday Sunday],
      time_slot: "Full Day",
      aadhaar_number: "123456789012",
      kyc_status: "approved",
      bio: "Top beauty expert serving #{@city_delhi.name}"
    )

    @coupon = Coupon.create!(
      code: "SAVE20_#{SecureRandom.hex(2).upcase}",
      discount_type: "percentage",
      discount_value: 20,
      min_order_amount: 500,
      status: "active"
    )
  end

  test "GET /cart renders SSR cart page successfully" do
    get cart_path
    assert_response :success
    assert_select "h1", /Your Service Cart/i
  end

  test "POST /cart/items verifies availability and rejects if beautician does not serve that city" do
    tomorrow = 1.day.from_now.strftime("%Y-%m-%d")
    post add_item_cart_path, params: {
      service_id: @service.id,
      worker_id: @worker.id,
      city_id: @city_mumbai.id, # Priya serves Delhi, not Mumbai!
      date: tomorrow,
      time_slot: "10:30 AM",
      quantity: 1
    }, as: :json

    assert_response :unprocessable_entity
    json = JSON.parse(response.body)
    assert_equal false, json["success"]
    assert_includes json["error"], "not available in #{@city_mumbai.name}"
  end

  test "POST /cart/items succeeds and adds item when beautician is available in the city" do
    tomorrow = 1.day.from_now.strftime("%Y-%m-%d")
    post add_item_cart_path, params: {
      service_id: @service.id,
      worker_id: @worker.id,
      city_id: @city_delhi.id,
      date: tomorrow,
      time_slot: "10:30 AM",
      quantity: 1
    }, as: :json

    assert_response :created
    json = JSON.parse(response.body)
    assert_equal true, json["success"]
    assert_equal 1, json["item_count"]
    assert_equal 1200.0, json["cart"]["subtotal"]

    # Now verify SSR cart view renders the item and assigned beautician
    get cart_path
    assert_response :success
    assert_select ".bn-cwb-name", text: @worker.name
    assert_select ".bn-item-name", text: @service.name
  end

  test "Coupon application and removal on SSR cart" do
    # First add item to cart
    tomorrow = 1.day.from_now.strftime("%Y-%m-%d")
    post add_item_cart_path, params: {
      service_id: @service.id,
      worker_id: @worker.id,
      city_id: @city_delhi.id,
      date: tomorrow,
      time_slot: "10:30 AM",
      quantity: 1
    }

    # Apply coupon
    post apply_coupon_cart_path, params: { code: @coupon.code }
    assert_redirected_to cart_path
    follow_redirect!
    assert_select ".bn-ca-code", text: "✓ #{@coupon.code}"

    # Remove coupon
    delete remove_coupon_cart_path
    assert_redirected_to cart_path
    follow_redirect!
    assert_select ".bn-ca-code", count: 0
  end

  test "Full checkout flow: Cart -> Checkout -> Success Confirmation" do
    tomorrow = 1.day.from_now.strftime("%Y-%m-%d")
    
    # 1. Add item with verified beautician
    post add_item_cart_path, params: {
      service_id: @service.id,
      worker_id: @worker.id,
      city_id: @city_delhi.id,
      date: tomorrow,
      time_slot: "10:30 AM",
      quantity: 1
    }
    assert_redirected_to cart_path

    # 2. View SSR Checkout Page
    get checkout_page_path
    assert_response :success
    assert_select "h1", "Complete Your Booking"
    assert_select ".bn-cws-name", text: @worker.name

    # 3. Submit Checkout (order placement)
    assert_difference("Booking.count", 1) do
      post checkout_path, params: {
        customer_name: "Anita Verma",
        customer_phone: "9911223344",
        customer_email: "anita_#{SecureRandom.hex(3)}@example.com",
        line1: "Flat 401, Lotus Towers",
        city: @city_delhi.name,
        pincode: "110001",
        payment_method: "cod",
        notes: "Ring the bell once."
      }
    end

    booking = Booking.last
    assert_redirected_to success_checkout_path(booking.id)
    assert_equal @worker.id, booking.worker_id
    assert_equal "confirmed", booking.booking_status
    assert_equal 1200.0, booking.total_amount.to_f
    assert_equal 1, booking.booking_items.count
    assert_equal @service.id, booking.booking_items.first.service_id

    # 4. View SSR Confirmation Page
    follow_redirect!
    assert_response :success
    assert_select "h1", "Booking Confirmed!"
    assert_select ".bn-scd-worker-name", text: @worker.name
  end

  test "POST /cart/items requires date and time_slot parameters before adding to cart" do
    post add_item_cart_path, params: {
      service_id: @service.id,
      quantity: 1
    }, as: :json

    assert_response :unprocessable_entity
    json = JSON.parse(response.body)
    assert_equal false, json["success"]
    assert_includes json["error"], "Please select an appointment date and time slot"
  end

  test "Adding multiple items with independent dates and time slots preserves separate schedules in cart and booking" do
    service2 = Service.create!(
      name: "Hair Spa Deluxe #{SecureRandom.hex(3)}",
      slug: "hair-spa-#{SecureRandom.hex(3)}",
      category: @category,
      base_price: 1500.0,
      duration_minutes: 45,
      status: "active"
    )

    day1 = 1.day.from_now.strftime("%Y-%m-%d")
    day2 = 2.days.from_now.strftime("%Y-%m-%d")

    # Add 1st service for Day 1 at 10:30 AM
    post add_item_cart_path, params: {
      service_id: @service.id,
      worker_id: @worker.id,
      city_id: @city_delhi.id,
      date: day1,
      time_slot: "10:30 AM",
      quantity: 1
    }, as: :json
    assert_response :created

    # Add 2nd service for Day 2 at 03:00 PM (independent schedule!)
    post add_item_cart_path, params: {
      service_id: service2.id,
      worker_id: @worker.id,
      city_id: @city_delhi.id,
      date: day2,
      time_slot: "03:00 PM",
      quantity: 1
    }, as: :json
    assert_response :created

    cart = Cart.last
    assert_equal 2, cart.cart_items.count

    item1 = cart.cart_items.find_by(service_id: @service.id)
    item2 = cart.cart_items.find_by(service_id: service2.id)

    assert_equal Date.parse(day1), item1.booking_date
    assert_equal "10:30 AM", item1.time_slot
    assert_equal @worker.id, item1.worker_id

    assert_equal Date.parse(day2), item2.booking_date
    assert_equal "03:00 PM", item2.time_slot
    assert_equal @worker.id, item2.worker_id

    # Place order at checkout
    post checkout_path, params: {
      customer_name: "Meenakshi Sundaram",
      customer_phone: "9811002233",
      customer_email: "meena_#{SecureRandom.hex(3)}@example.com",
      line1: "Flat 202, Metro Greens",
      city: @city_delhi.name,
      pincode: "110016",
      payment_method: "cod"
    }

    booking = Booking.last
    assert_redirected_to success_checkout_path(booking.id)
    assert_equal 2, booking.booking_items.count

    b_item1 = booking.booking_items.find_by(service_id: @service.id)
    b_item2 = booking.booking_items.find_by(service_id: service2.id)

    assert_equal Date.parse(day1), b_item1.booking_date
    assert_equal "10:30 AM", b_item1.time_slot
    assert_equal @worker.id, b_item1.worker_id

    assert_equal Date.parse(day2), b_item2.booking_date
    assert_equal "03:00 PM", b_item2.time_slot
    assert_equal @worker.id, b_item2.worker_id
  end

  test "GET /api/v1/booking_flow/workers returns available workers for city, date, and slot" do
    tomorrow = 1.day.from_now.strftime("%Y-%m-%d")

    get "/api/v1/booking_flow/workers", params: {
      city_id: @city_delhi.id,
      date: tomorrow,
      time_slot: "10:30 AM"
    }

    assert_response :success
    json = JSON.parse(response.body)
    assert_equal "success", json["status"]
    assert json["data"]["count"] >= 1
    worker_names = json["data"]["workers"].map { |w| w["name"] }
    assert_includes worker_names, @worker.name
  end

  test "POST /cart/items auto-assigns available worker in city when worker_id is omitted" do
    tomorrow = 1.day.from_now.strftime("%Y-%m-%d")

    post add_item_cart_path, params: {
      service_id: @service.id,
      city_id: @city_delhi.id,
      date: tomorrow,
      time_slot: "10:30 AM",
      quantity: 1
    }, as: :json

    assert_response :created
    json = JSON.parse(response.body)
    assert_equal true, json["success"]
    assert_not_nil json["cart"]["worker_id"]

    cart_item = CartItem.last
    assert_not_nil cart_item.worker_id
    assert_equal @worker.id, cart_item.worker_id
  end

  test "POST /cart/items rejects when city has no available beauty professionals" do
    empty_city = City.create!(name: "Kolkata #{SecureRandom.hex(2)}", state: "West Bengal", status: "active")
    tomorrow = 1.day.from_now.strftime("%Y-%m-%d")

    post add_item_cart_path, params: {
      service_id: @service.id,
      city_id: empty_city.id,
      date: tomorrow,
      time_slot: "10:30 AM",
      quantity: 1
    }, as: :json

    assert_response :unprocessable_entity
    json = JSON.parse(response.body)
    assert_equal false, json["success"]
    assert_includes json["error"], "No beauty professionals are currently active in #{empty_city.name}"
  end

  test "POST /cart/items rejects when requested worker does not work on that day" do
    # Create worker who only works Monday to Friday
    weekend_worker = User.create!(
      name: "Weekend Off Worker #{SecureRandom.hex(2)}",
      email: "wo_#{SecureRandom.hex(4)}@test.com",
      phone: "9876543299",
      role: "worker",
      status: "active",
      password: "password123"
    )
    WorkerProfile.create!(
      user: weekend_worker,
      city: @city_delhi,
      experience_years: 4,
      is_available: true,
      available_days: %w[Monday],
      time_slot: "Full Day",
      aadhaar_number: "123456789099",
      kyc_status: "approved",
      bio: "Monday only worker"
    )

    # Pick next Sunday
    sunday = Date.current.end_of_week(:sunday).strftime("%Y-%m-%d")
    sunday = (Date.current + 7.days).end_of_week(:sunday).strftime("%Y-%m-%d") if sunday == Date.current.strftime("%Y-%m-%d")

    post add_item_cart_path, params: {
      service_id: @service.id,
      worker_id: weekend_worker.id,
      city_id: @city_delhi.id,
      date: sunday,
      time_slot: "10:30 AM",
      quantity: 1
    }, as: :json

    assert_response :unprocessable_entity
    json = JSON.parse(response.body)
    assert_equal false, json["success"]
    assert_includes json["error"], "does not work on"
  end

  test "Switching cities across sessions assigns the corresponding city's worker rather than retaining a stale worker" do
    mumbai_worker = User.create!(
      name: "Roshni Mumbai Expert #{SecureRandom.hex(2)}",
      email: "roshni_#{SecureRandom.hex(4)}@test.com",
      phone: "9876543288",
      role: "worker",
      status: "active",
      password: "password123"
    )
    WorkerProfile.create!(
      user: mumbai_worker,
      city: @city_mumbai,
      experience_years: 6,
      is_available: true,
      available_days: %w[Monday Tuesday Wednesday Thursday Friday Saturday Sunday],
      time_slot: "Full Day",
      aadhaar_number: "123456789088",
      kyc_status: "approved",
      bio: "Mumbai beauty specialist"
    )

    tomorrow = 1.day.from_now.strftime("%Y-%m-%d")

    # Step 1: Book in Delhi -> Assigns Priya
    post add_item_cart_path, params: {
      service_id: @service.id,
      city_id: @city_delhi.id,
      date: tomorrow,
      time_slot: "10:30 AM"
    }, as: :json
    assert_response :created
    cart = Cart.last
    assert_equal @worker.id, cart.effective_worker.id

    # Step 2: Clear cart
    delete clear_cart_path
    assert_redirected_to cart_path
    cart.reload
    assert_nil cart.worker_id

    # Step 3: Book in Mumbai -> Must assign Roshni (Mumbai worker), NOT Priya (Delhi worker)!
    post add_item_cart_path, params: {
      service_id: @service.id,
      city_id: @city_mumbai.id,
      date: tomorrow,
      time_slot: "10:30 AM"
    }, as: :json
    assert_response :created
    cart.reload
    assert_equal mumbai_worker.id, cart.effective_worker.id
    assert_equal @city_mumbai.id, cart.effective_city.id
  end
end
