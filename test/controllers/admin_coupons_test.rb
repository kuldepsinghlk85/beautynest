# frozen_string_literal: true

require "test_helper"

class AdminCouponsTest < ActionDispatch::IntegrationTest
  setup do
    @admin = User.find_or_create_by!(email: "admin_coupons_test@BeautyNest.test") do |u|
      u.name = "Admin Coupons"
      u.phone = "+919999000077"
      u.password = "Admin@1234"
      u.password_confirmation = "Admin@1234"
      u.role = "admin"
      u.status = "active"
    end

    @coupon = Coupon.find_or_create_by!(code: "TESTCODE20") do |c|
      c.description = "Test 20% discount coupon"
      c.discount_type = "percentage"
      c.discount_value = 20.0
      c.min_order_amount = 500.0
      c.max_discount = 200.0
      c.usage_limit = 100
      c.status = "active"
    end
  end

  test "GET /admin/coupons requires login" do
    get "/admin/coupons"
    assert_redirected_to login_path
  end

  test "GET /admin/coupons renders index successfully with KPIs for admin" do
    post login_path, params: { email: @admin.email, password: "Admin@1234" }
    assert_redirected_to admin_dashboard_path

    get "/admin/coupons"
    assert_response :success
    assert_includes response.body, "Coupons &amp; Discounts"
    assert_includes response.body, "TESTCODE20"
  end

  test "GET /admin/coupons filters dynamically by search, status, and discount_type" do
    post login_path, params: { email: @admin.email, password: "Admin@1234" }

    # Search filter
    get "/admin/coupons", params: { search: "TESTCODE" }
    assert_response :success
    assert_includes response.body, "TESTCODE20"

    get "/admin/coupons", params: { search: "NONEXISTENTXYZ" }
    assert_response :success
    assert_includes response.body, "No coupons found"

    # Status filter
    get "/admin/coupons", params: { status: "active" }
    assert_response :success
    assert_includes response.body, "TESTCODE20"

    # Discount type filter
    get "/admin/coupons", params: { discount_type: "percentage" }
    assert_response :success
    assert_includes response.body, "TESTCODE20"
  end

  test "GET /admin/coupons/new renders new coupon form" do
    post login_path, params: { email: @admin.email, password: "Admin@1234" }

    get "/admin/coupons/new"
    assert_response :success
    assert_includes response.body, "Create Coupon"
  end

  test "POST /admin/coupons creates a new coupon" do
    post login_path, params: { email: @admin.email, password: "Admin@1234" }

    unique_code = "SUMMER#{SecureRandom.hex(3).upcase}"
    assert_difference -> { Coupon.count }, 1 do
      post "/admin/coupons", params: {
        coupon: {
          code: unique_code,
          description: "Summer special flat discount",
          discount_type: "flat",
          discount_value: 150.0,
          min_order_amount: 800.0,
          usage_limit: 50,
          status: "active"
        }
      }
    end

    created = Coupon.find_by!(code: unique_code)
    assert_redirected_to admin_coupon_path(created)
    assert_equal 150.0, created.discount_value
    assert_equal "flat", created.discount_type
  end

  test "POST /admin/coupons fails with invalid parameters" do
    post login_path, params: { email: @admin.email, password: "Admin@1234" }

    # Missing code and invalid discount
    assert_no_difference -> { Coupon.count } do
      post "/admin/coupons", params: {
        coupon: {
          code: "",
          discount_value: -10
        }
      }
    end

    assert_response :unprocessable_entity
    assert_includes response.body, "can&#39;t be blank"
  end

  test "GET /admin/coupons/:id renders coupon show view" do
    post login_path, params: { email: @admin.email, password: "Admin@1234" }

    get admin_coupon_path(@coupon)
    assert_response :success
    assert_includes response.body, "TESTCODE20"
    assert_includes response.body, "Coupon Overview"
  end

  test "PATCH /admin/coupons/:id updates coupon" do
    post login_path, params: { email: @admin.email, password: "Admin@1234" }

    patch admin_coupon_path(@coupon), params: {
      coupon: {
        description: "Updated discount description",
        discount_value: 25.0
      }
    }

    assert_redirected_to admin_coupon_path(@coupon)
    @coupon.reload
    assert_equal 25.0, @coupon.discount_value
    assert_equal "Updated discount description", @coupon.description
  end

  test "PATCH /admin/coupons/:id/toggle_status toggles active/inactive" do
    post login_path, params: { email: @admin.email, password: "Admin@1234" }

    assert @coupon.active?
    patch toggle_status_admin_coupon_path(@coupon)
    @coupon.reload
    assert_equal "inactive", @coupon.status

    patch toggle_status_admin_coupon_path(@coupon)
    @coupon.reload
    assert_equal "active", @coupon.status
  end

  test "DELETE /admin/coupons/:id deletes coupon" do
    post login_path, params: { email: @admin.email, password: "Admin@1234" }

    to_delete = Coupon.create!(
      code: "DELETEME#{SecureRandom.hex(2).upcase}",
      discount_type: "flat",
      discount_value: 50.0,
      min_order_amount: 100.0,
      status: "active"
    )

    assert_difference -> { Coupon.count }, -1 do
      delete admin_coupon_path(to_delete)
    end

    assert_redirected_to admin_coupons_path
    assert_not Coupon.exists?(id: to_delete.id)
  end
end
