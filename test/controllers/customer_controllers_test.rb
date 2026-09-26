# frozen_string_literal: true

require "test_helper"

class CustomerControllersTest < ActionDispatch::IntegrationTest
  setup do
    @city = City.create!(name: "Test City", state: "State", status: "active")

    @customer = User.create!(
      name: "Radha Customer",
      email: "radha_test_#{SecureRandom.hex(4)}@example.com",
      phone: "+91987#{rand(1000000..9999999)}",
      password: "Password@123",
      role: "customer",
      status: "active"
    )

    @other_customer = User.create!(
      name: "Other Customer",
      email: "other_test_#{SecureRandom.hex(4)}@example.com",
      phone: "+91988#{rand(1000000..9999999)}",
      password: "Password@123",
      role: "customer",
      status: "active"
    )

    @category = Category.create!(
      name: "Hair Care #{SecureRandom.hex(3)}",
      slug: "hair-care-#{SecureRandom.hex(3)}",
      status: "active"
    )

    @subcategory = @category.subcategories.create!(
      name: "Hair Spa #{SecureRandom.hex(3)}",
      status: "active"
    )

    @service = Service.create!(
      name: "Deluxe Hair Spa",
      base_price: 999.0,
      duration_minutes: 60,
      tag: "facial",
      subcategory: @subcategory,
      status: "active"
    )

    @address = @customer.addresses.create!(
      label: "Home",
      line1: "101 Lotus Apts",
      city: @city.name,
      pincode: "400001",
      is_default: true
    )

    @booking = @customer.customer_bookings.create!(
      booking_status: "confirmed",
      service_status: "pending",
      address: @address,
      scheduled_at: 1.day.from_now,
      time_slot: "10:00 AM - 11:30 AM",
      subtotal_amount: 999.0,
      total_amount: 999.0
    )
    @booking.booking_items.create!(service: @service, quantity: 1)
  end

  # ── 1. Unauthenticated Redirections ──────────────────────────────────────────
  test "unauthenticated access to /profile redirects to login" do
    get customer_profile_path
    assert_redirected_to login_path
    follow_redirect!
    assert_equal "Please sign in to access your profile and bookings.", flash[:alert]
  end

  test "unauthenticated access to /my-bookings redirects to login" do
    get customer_bookings_path
    assert_redirected_to login_path
  end

  # ── 2. Profile Management ───────────────────────────────────────────────────
  test "authenticated customer can view their profile" do
    sign_in_user(@customer)
    get customer_profile_path
    assert_response :success
    assert_select "h1", text: @customer.name
    assert_select ".bc-ptab", text: /Personal Info/
    assert_select ".bc-ptab", text: /Saved Addresses/
  end

  test "customer can update their profile information" do
    sign_in_user(@customer)
    new_name = "Radha Sharma Updated"
    patch customer_profile_path, params: {
      user: { name: new_name, email: @customer.email, phone: @customer.phone }
    }
    assert_redirected_to customer_profile_path(tab: "profile")
    @customer.reload
    assert_equal new_name, @customer.name
  end

  test "customer can update their password" do
    sign_in_user(@customer)
    patch customer_password_path, params: {
      current_password: "Password@123",
      new_password: "NewPassword@123",
      password_confirmation: "NewPassword@123"
    }
    assert_redirected_to customer_profile_path(tab: "security")
    assert_equal "Password changed successfully.", flash[:notice]
    assert @customer.reload.authenticate("NewPassword@123")
  end

  test "customer can create and manage addresses" do
    sign_in_user(@customer)

    # Add address
    assert_difference -> { @customer.addresses.count }, 1 do
      post customer_addresses_path, params: {
        address: {
          label: "Work Office",
          line1: "Unit 502 Cyber Tower",
          city: @city.name,
          pincode: "400076",
          is_default: "0"
        }
      }
    end
    assert_redirected_to customer_profile_path(tab: "addresses")

    new_addr = @customer.addresses.find_by(label: "Work Office")
    assert_not_nil new_addr

    # Set default
    patch customer_default_address_path(new_addr)
    assert_redirected_to customer_profile_path(tab: "addresses")
    assert new_addr.reload.is_default?
    assert_not @address.reload.is_default?

    # Delete address
    assert_difference -> { @customer.addresses.count }, -1 do
      delete customer_address_path(new_addr)
    end
    assert_redirected_to customer_profile_path(tab: "addresses")
  end

  # ── 3. My Bookings ──────────────────────────────────────────────────────────
  test "customer can list their bookings and filter by status" do
    sign_in_user(@customer)
    get customer_bookings_path
    assert_response :success
    assert_select "h1", text: "My Bookings"
    assert_select ".bc-bcard-box", minimum: 1

    # Filter upcoming
    get customer_bookings_path, params: { status: "upcoming" }
    assert_response :success
    assert_select ".bc-bcard-box", minimum: 1

    # Filter completed (empty for this customer)
    get customer_bookings_path, params: { status: "completed" }
    assert_response :success
  end

  test "customer can view booking details" do
    sign_in_user(@customer)
    get customer_booking_path(@booking)
    assert_response :success
    assert_select "h1", text: /Booking ##{@booking.display_id}/
    assert_select ".bc-step-label", text: /Booking Placed/
    assert_select ".bc-step-label", text: /Confirmed & Assigned/
  end

  test "IDOR protection: customer cannot view another customer's booking" do
    sign_in_user(@other_customer)
    get customer_booking_path(@booking)
    assert_redirected_to customer_bookings_path
    assert_equal "Booking not found.", flash[:alert]
  end

  test "customer can cancel a confirmed booking" do
    sign_in_user(@customer)
    patch cancel_customer_booking_path(@booking), params: { cancellation_reason: "Change of plans" }
    assert_redirected_to customer_booking_path(@booking)
    assert_equal "Booking ##{@booking.display_id} has been cancelled successfully.", flash[:notice]
    assert_equal "cancelled", @booking.reload.booking_status
  end

  test "customer can leave a review on a completed booking" do
    @booking.update!(booking_status: "completed", service_status: "completed")
    sign_in_user(@customer)

    assert_difference -> { Review.count }, 1 do
      post review_customer_booking_path(@booking), params: {
        rating: 5,
        comment: "Excellent service and very punctual!"
      }
    end
    assert_redirected_to customer_booking_path(@booking)
    assert_equal "Thank you for your review! Your feedback helps our beauticians maintain high standards.", flash[:notice]
    assert_equal 5, @booking.reload.review.rating
  end

  test "customer cannot review an incomplete booking" do
    @booking.update!(booking_status: "pending", service_status: "pending")
    sign_in_user(@customer)

    assert_no_difference -> { Review.count } do
      post review_customer_booking_path(@booking), params: { rating: 5, comment: "Premature review" }
    end
    assert_redirected_to customer_booking_path(@booking)
    assert_equal "You can only review bookings that have been completed.", flash[:alert]
  end

  test "review can only be given once for a completed booking" do
    @booking.update!(booking_status: "completed", service_status: "completed")
    sign_in_user(@customer)

    # First review succeeds
    assert_difference -> { Review.count }, 1 do
      post review_customer_booking_path(@booking), params: { rating: 5, comment: "First review" }
    end
    assert_redirected_to customer_booking_path(@booking)
    assert_equal "Thank you for your review! Your feedback helps our beauticians maintain high standards.", flash[:notice]

    # Second review attempt fails
    assert_no_difference -> { Review.count } do
      post review_customer_booking_path(@booking), params: { rating: 4, comment: "Duplicate review attempt" }
    end
    assert_redirected_to customer_booking_path(@booking)
    assert_equal "You have already submitted a review for this booking. Reviews can only be given once.", flash[:alert]
  end

  test "completed unreviewed booking displays review button, while reviewed booking displays rating badge" do
    @booking.update!(booking_status: "completed", service_status: "completed")
    sign_in_user(@customer)

    # 1. Before review: shows Leave Review button on index and review form on show
    get customer_bookings_path
    assert_response :success
    assert_select "button.bc-btn-review-sm", text: /Leave Review/

    get customer_booking_path(@booking)
    assert_response :success
    assert_select ".bc-review-prompt"
    assert_select "form[action=?]", review_customer_booking_path(@booking)

    # 2. Submit review
    post review_customer_booking_path(@booking), params: { rating: 4, comment: "Great haircut!" }

    # 3. After review: Leave Review button is gone, replaced by Rated badge
    get customer_bookings_path
    assert_response :success
    assert_select "button.bc-btn-review-sm", count: 0
    assert_select ".bc-reviewed-badge", text: /Rated 4\/5/

    get customer_booking_path(@booking)
    assert_response :success
    assert_select ".bc-review-prompt", count: 0
    assert_select ".bc-review-display", text: /Great haircut!/
    assert_select ".badge", text: /Review Submitted/
  end

  # ── 4. Navbar Component ─────────────────────────────────────────────────────
  test "public nav renders profile dropdown beside cart when customer is signed in" do
    sign_in_user(@customer)
    get "/"
    assert_response :success
    # Verify cart button exists
    assert_select "#bn-nav-cart-btn"
    # Verify profile dropdown trigger exists beside cart
    assert_select "#bc-nav-profile-wrap"
    assert_select "#bc-profile-dropdown-btn"
    assert_select "#bc-profile-dropdown-menu" do
      assert_select "a[href=?]", customer_profile_path
      assert_select "a[href=?]", customer_bookings_path
      assert_select "a[href=?]", cart_path
      assert_select "a[href=?]", logout_path
    end
  end

  # ── 5. Checkout Authentication & Cart Redirection ───────────────────────────
  test "unauthenticated customer attempting checkout is redirected to login" do
    add_service_to_guest_cart(@service)

    get checkout_page_path
    assert_redirected_to login_path
    assert_equal "Please sign in or create an account to proceed with your booking.", flash[:alert]
    assert_equal checkout_page_path, session[:return_to]
  end

  test "unauthenticated customer with cart who logs in is redirected to checkout with cart preserved" do
    add_service_to_guest_cart(@service)
    assert_not_nil session[:cart_id]

    get checkout_page_path
    assert_redirected_to login_path

    post login_path, params: { email: @customer.email, password: "Password@123" }
    assert_redirected_to checkout_page_path

    follow_redirect!
    assert_response :success
    assert_equal @customer.id, session[:user_id]
    assert @customer.active_cart.cart_items.exists?(service_id: @service.id)
  end

  test "unauthenticated customer with cart who signs up is redirected to checkout with cart preserved" do
    add_service_to_guest_cart(@service)
    assert_not_nil session[:cart_id]

    get checkout_page_path
    assert_redirected_to login_path

    new_email = "new_cust_#{SecureRandom.hex(4)}@example.com"
    post signup_path, params: {
      user: {
        name: "Aarti New",
        email: new_email,
        phone: "+91985#{rand(1000000..9999999)}",
        password: "Password@123",
        password_confirmation: "Password@123"
      }
    }
    assert_redirected_to checkout_page_path

    follow_redirect!
    assert_response :success
    new_user = User.find_by(email: new_email)
    assert_not_nil new_user
    assert_equal new_user.id, session[:user_id]
    assert new_user.active_cart.cart_items.exists?(service_id: @service.id)
  end

  test "customer can upload profile avatar which saves to Cloudinary" do
    sign_in_user(@customer)
    file = fixture_file_upload(Rails.root.join("test/fixtures/files/test.png"), "image/png")

    mock_cloudinary_url = "https://res.cloudinary.com/ki5nokty/image/upload/v1788953487/beauty_connect/avatars/test_cust.png"
    original_upload = CloudinaryService.method(:upload)
    original_enabled = CloudinaryService.method(:enabled?)

    begin
      CloudinaryService.define_singleton_method(:enabled?) { true }
      CloudinaryService.define_singleton_method(:upload) do |_file, folder: "beauty_connect"|
        { url: mock_cloudinary_url, public_id: "beauty_connect/avatars/test_cust" }
      end

      patch customer_profile_path, params: {
        user: { name: @customer.name, email: @customer.email, phone: @customer.phone, avatar: file }
      }
      assert_redirected_to customer_profile_path(tab: "profile")
      @customer.reload
      assert_equal mock_cloudinary_url, @customer.avatar_url
    ensure
      CloudinaryService.define_singleton_method(:enabled?, original_enabled)
      CloudinaryService.define_singleton_method(:upload, original_upload)
    end
  end

  test "customer can remove their profile avatar" do
    sign_in_user(@customer)
    @customer.update_columns(avatar_url: "https://res.cloudinary.com/test/old.jpg")

    patch customer_profile_path, params: {
      user: { name: @customer.name, email: @customer.email, phone: @customer.phone, remove_avatar: "1" }
    }
    assert_redirected_to customer_profile_path(tab: "profile")
    @customer.reload
    assert_nil @customer.avatar_url
  end

  test "customer can submit review for completed booking from my-bookings index" do
    sign_in_user(@customer)
    @booking.update!(booking_status: "completed", service_status: "completed")

    assert_difference -> { Review.count }, 1 do
      post review_customer_booking_path(@booking), params: {
        rating: 5,
        comment: "Excellent and punctual service!",
        return_to: "index"
      }
    end

    assert_redirected_to customer_bookings_path
    follow_redirect!
    assert_select ".bc-alert-success", text: /Thank you for your review/
    
    review = @booking.reload.review
    assert_not_nil review
    assert_equal 5, review.rating
    assert_equal "Excellent and punctual service!", review.comment
  end

  test "customer cannot review incomplete booking or review same booking twice" do
    sign_in_user(@customer)
    @booking.update!(booking_status: "confirmed")

    # Incomplete booking
    assert_no_difference -> { Review.count } do
      post review_customer_booking_path(@booking), params: { rating: 5, comment: "Too early!" }
    end
    assert_redirected_to customer_booking_path(@booking)

    # Completed booking
    @booking.update!(booking_status: "completed", service_status: "completed")
    post review_customer_booking_path(@booking), params: { rating: 4, comment: "Good job!" }
    assert_equal 4, @booking.reload.review.rating

    # Second review attempt rejected
    assert_no_difference -> { Review.count } do
      post review_customer_booking_path(@booking), params: { rating: 5, comment: "Second attempt" }
    end
    assert_redirected_to customer_booking_path(@booking)
  end

  private

  def add_service_to_guest_cart(service)
    get "/"
    cart = Cart.find(session[:cart_id])
    cart.cart_items.create!(
      service: service,
      quantity: 1,
      booking_date: 1.day.from_now.to_date,
      time_slot: "10:30 AM"
    )
    cart
  end
end
