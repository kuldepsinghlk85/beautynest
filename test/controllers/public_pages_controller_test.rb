# frozen_string_literal: true

require "test_helper"

class PublicPagesControllerTest < ActionDispatch::IntegrationTest
  def setup
    @category = Category.create!(
      name: "Facial Care",
      slug: "facial-care",
      status: :active,
      featured: true
    )
    @subcategory = @category.subcategories.create!(
      name: "Deep Cleansing",
      slug: "deep-cleansing",
      status: :active
    )
    @service = @subcategory.services.create!(
      category: @category,
      name: "Gold Glow Facial",
      slug: "gold-glow-facial",
      base_price: 1200,
      duration_minutes: 60,
      status: :active
    )

    @worker = User.create!(
      name: "Sunita Sharma",
      email: "sunita.test@beautynest.com",
      password: "Worker@1234",
      phone: "+919876543210",
      role: :worker,
      status: :active
    )
    @city = City.create!(name: "Delhi", slug: "delhi", status: :active)
    @tier = WorkerTier.create!(name: "Elite", slug: "elite", price_multiplier: 1.15, position: 1, status: :active)
    @worker.create_worker_profile!(
      city: @city,
      worker_tier: @tier,
      aadhaar_number: "123456789012",
      experience_years: 5,
      rating_avg: 4.9,
      rating_count: 32,
      bio: "Korean Glass Skin and O3+ Whitening specialist"
    )
  end

  test "GET /categories renders SSR carousel and category cards" do
    get "/categories"
    assert_response :success
    assert_select ".bn-carousel-wrap", 1
    assert_select ".bn-cs-slide", 1
    assert_select ".bn-cat-card" do
      assert_select ".bn-cat-card-name", text: "Facial Care"
      assert_select ".bn-cat-service-count", text: "1 Services"
    end
  end

  test "GET /categories/:slug renders category detail with subcategory pills and services" do
    get "/categories/#{@category.slug}"
    assert_response :success
    assert_select ".bn-detail-header h1", text: "Facial Care"
    assert_select ".bn-sub-tab", 2 # "All" + "Deep Cleansing"
    assert_select ".bn-svc-card" do
      assert_select ".bn-svc-card-name", text: "Gold Glow Facial"
      assert_select ".bn-svc-price", text: /₹1,?200/
    end
  end

  test "GET /beauticians renders SSR beauticians list with exact BeauticianCard UI and real DB experience" do
    get "/beauticians"
    assert_response :success
    assert_select ".bn-prof-badge", text: /1 VERIFIED BEAUTICIANS/i
    assert_select ".bn-card" do
      assert_select ".bn-card-name", text: "Sunita Sharma"
      assert_select ".bn-card-rating-badge", text: /4\.9/
      assert_select ".bn-card-location", text: /Delhi/
      assert_select ".bn-badge-gray", text: /5 Yrs Exp/
      assert_select ".bn-status-doorstep", text: /Available for Doorstep/
      assert_select ".bn-book-btn[href*='worker_id=#{@worker.id}']", text: /Book with Sunita/
    end
  end

  test "GET /categories with worker_id renders assigned worker banner and retains worker_id in category links" do
    get "/categories", params: { worker_id: @worker.id }
    assert_response :success
    assert_select ".bn-assigned-worker-banner", 1
    assert_select ".bn-aw-name", text: "Booking exclusively with Sunita Sharma"
    assert_select ".bn-aw-exp", text: "5 Yrs Exp"
    assert_select ".bn-cat-card[href*='worker_id=#{@worker.id}']", 1
    assert_select ".bn-cs-cta[href*='worker_id=#{@worker.id}']", 1
  end

  test "GET /categories/:slug with worker_id renders banner, modal, and retains worker_id in tabs" do
    get "/categories/#{@category.slug}", params: { worker_id: @worker.id }
    assert_response :success
    assert_select ".bn-assigned-worker-banner", 1
    assert_select ".bn-aw-name", text: "Booking exclusively with Sunita Sharma"
    assert_select ".bn-aw-exp", text: "5 Yrs Exp"
    assert_select ".bn-sub-tab[href*='worker_id=#{@worker.id}']", 2
    assert_select ".bn-detail-back[href*='worker_id=#{@worker.id}']", 1
    assert_select "#bn-booking-modal", 1
    assert_select "#bn-modal-worker-card", 1
  end

  test "GET /beauticians with filter parameters" do
    get "/beauticians", params: { city: "delhi", q: "Sunita", sort: "experience" }
    assert_response :success
    assert_select ".bn-card-name", text: "Sunita Sharma"
  end

  test "GET /offers renders dynamic coupons from database" do
    coupon = Coupon.create!(
      code: "TESTFEST50",
      description: "Flat 50% discount on festive bookings",
      discount_type: "percentage",
      discount_value: 50,
      min_order_amount: 500,
      status: "active"
    )

    get "/offers"
    assert_response :success
    assert_select ".bc-coupon-card"
    assert_select ".bc-code-text", text: coupon.code
    assert_select ".bc-coupon-discount", text: "50% OFF"
  end

  test "GET /privacy renders comprehensive privacy policy page and includes footer links" do
    get "/privacy"
    assert_response :success
    assert_select "h1", text: /Your Privacy is Our Sanctuary/i
    assert_select ".bc-page-pretitle", text: /PRIVACY & DATA PROTECTION/i
    assert_select "#overview", 1
    assert_select "#grievance-officer", 1
    assert_select "footer a[href='/privacy']", text: "Privacy Policy"
  end
end
