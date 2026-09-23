# frozen_string_literal: true

require "test_helper"

class WorkerPanelServiceAndPaymentTest < ActionDispatch::IntegrationTest
  setup do
    @city = City.create!(name: "Delhi", state: "Delhi", status: "active")

    @customer = User.create!(
      name: "Pooja Customer",
      email: "pooja_worker_test_#{SecureRandom.hex(4)}@example.com",
      phone: "+91971#{rand(1000000..9999999)}",
      password: "Password@123",
      role: "customer",
      status: "active"
    )

    @worker = User.create!(
      name: "Anjali Beautician",
      email: "anjali_worker_test_#{SecureRandom.hex(4)}@example.com",
      phone: "+91972#{rand(1000000..9999999)}",
      password: "Worker@1234",
      role: "worker",
      status: "active"
    )

    @other_worker = User.create!(
      name: "Meena Beautician",
      email: "meena_worker_test_#{SecureRandom.hex(4)}@example.com",
      phone: "+91973#{rand(1000000..9999999)}",
      password: "Worker@1234",
      role: "worker",
      status: "active"
    )

    @admin = User.create!(
      name: "Admin User",
      email: "admin_worker_test_#{SecureRandom.hex(4)}@example.com",
      phone: "+91974#{rand(1000000..9999999)}",
      password: "Admin@1234",
      role: "admin",
      status: "active"
    )

    @category = Category.create!(
      name: "Hair Services #{SecureRandom.hex(3)}",
      slug: "hair-services-#{SecureRandom.hex(3)}",
      status: "active"
    )

    @subcategory = @category.subcategories.create!(
      name: "Hair Styling #{SecureRandom.hex(3)}",
      status: "active"
    )

    @service = Service.create!(
      name: "Party Hair Styling",
      base_price: 1200.0,
      duration_minutes: 45,
      tag: "facial",
      subcategory: @subcategory,
      status: "active"
    )

    @address = @customer.addresses.create!(
      label: "Home",
      line1: "Flat 202, Sunshine Heights",
      city: @city.name,
      pincode: "110001",
      is_default: true
    )

    @booking = Booking.create!(
      customer: @customer,
      worker: @worker,
      city: @city,
      address: @address,
      booking_status: "pending",
      service_status: "pending",
      scheduled_at: 1.day.from_now,
      date: 1.day.from_now.to_date.to_s,
      time_slot: "11:00 AM - 12:00 PM",
      subtotal_amount: 1200.0,
      total_amount: 1200.0,
      payment_method: "cash"
    )

    @booking.booking_items.create!(
      service: @service,
      service_name_snapshot: @service.name,
      price_snapshot: 1200.0,
      duration_minutes_snapshot: 45,
      quantity: 1
    )

    @payment = @booking.payments.create!(
      amount: 1200.0,
      method: "cash",
      status: "pending"
    )
  end

  test "when booking is assigned to worker, its service and payment are initially in pending state" do
    assert_equal "pending", @booking.service_status
    assert_equal "pending", @booking.booking_status
    assert_equal "pending", @payment.status
    assert_equal "pending", @booking.payment_status
    assert_not @booking.completed?
    assert_not @booking.payment_completed?
  end

  test "assigned worker can mark service completed via web panel" do
    sign_in_user(@worker)

    patch complete_service_admin_booking_path(@booking)
    assert_redirected_to admin_booking_path(@booking)
    follow_redirect!
    assert_match(/Service marked as completed successfully/i, flash[:notice])

    @booking.reload
    assert_equal "completed", @booking.service_status
    assert_equal "completed", @booking.booking_status
    assert @booking.completed?
  end

  test "assigned worker can mark pending payment completed via web panel" do
    sign_in_user(@worker)

    patch complete_payment_admin_booking_path(@booking), params: { payment_method: "cash" }
    assert_redirected_to admin_booking_path(@booking)
    follow_redirect!
    assert_match(/Payment collected and marked as completed/i, flash[:notice])

    @booking.reload
    @payment.reload
    assert_equal "completed", @payment.status
    assert_equal "completed", @booking.payment_status
    assert @booking.payment_completed?
  end

  test "assigned worker can complete service and collect payment simultaneously" do
    sign_in_user(@worker)

    patch complete_service_admin_booking_path(@booking), params: { collect_payment: "1" }
    assert_redirected_to admin_booking_path(@booking)

    @booking.reload
    assert_equal "completed", @booking.service_status
    assert_equal "completed", @booking.booking_status
    assert_equal "completed", @booking.payment_status
    assert @booking.completed?
    assert @booking.payment_completed?
  end

  test "unassigned worker cannot complete service or payment for another worker's booking" do
    sign_in_user(@other_worker)

    patch complete_service_admin_booking_path(@booking)
    assert_redirected_to admin_dashboard_path
    follow_redirect!
    assert_match(/not authorized/i, flash[:alert])

    patch complete_payment_admin_booking_path(@booking)
    assert_redirected_to admin_dashboard_path
    follow_redirect!
    assert_match(/not authorized/i, flash[:alert])

    @booking.reload
    assert_equal "pending", @booking.service_status
    assert_equal "pending", @booking.payment_status
  end

  test "admin can complete service and payment for any booking" do
    sign_in_user(@admin)

    patch complete_service_admin_booking_path(@booking)
    assert_redirected_to admin_booking_path(@booking)

    patch complete_payment_admin_booking_path(@booking), params: { payment_method: "upi" }
    assert_redirected_to admin_booking_path(@booking)

    @booking.reload
    assert_equal "completed", @booking.service_status
    assert_equal "completed", @booking.payment_status
  end

  test "worker api complete_service and complete_payment endpoints work" do
    _session, token = generate_token_for(@worker)
    headers = { "Authorization" => "Bearer #{token}", "Accept" => "application/json" }

    patch "/api/v1/worker/bookings/#{@booking.id}/complete_service", headers: headers
    assert_response :success
    json = JSON.parse(response.body)
    assert_equal "success", json["status"]
    assert_equal "completed", json["data"]["service_status"]

    patch "/api/v1/worker/bookings/#{@booking.id}/complete_payment", headers: headers, params: { method: "cash" }
    assert_response :success
    json_pay = JSON.parse(response.body)
    assert_equal "success", json_pay["status"]

    @booking.reload
    assert_equal "completed", @booking.service_status
    assert_equal "completed", @booking.payment_status
  end

  test "once worker completes service and payment, customer sees completed booking and can review" do
    # 1. Worker marks service and payment completed
    sign_in_user(@worker)
    patch complete_service_admin_booking_path(@booking), params: { collect_payment: "1" }
    @booking.reload
    assert @booking.completed?
    assert @booking.payment_completed?

    # 2. Customer visits /my-bookings and /my-bookings/:id
    sign_in_user(@customer)

    get customer_bookings_path(status: "completed")
    assert_response :success
    assert_includes response.body, @booking.display_id

    get customer_booking_path(@booking)
    assert_response :success
    # Review form is unlocked
    assert_includes response.body, "Your appointment is completed! Please take a moment to rate your specialist."

    # 3. Customer submits review
    post review_customer_booking_path(@booking), params: { rating: 5, comment: "Fabulous service, on time and very skilled!" }
    assert_redirected_to customer_booking_path(@booking)
    follow_redirect!
    assert_match(/Thank you for your review/i, flash[:notice])

    @booking.reload
    assert @booking.reviewed?
    assert_equal 5, @booking.review.rating
  end
end
