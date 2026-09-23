# frozen_string_literal: true

require "test_helper"

class AdminPaginationTest < ActionDispatch::IntegrationTest
  setup do
    @admin = User.find_or_create_by!(email: "admin_pagination_test@BeautyNest.test") do |u|
      u.name = "Admin Pagination"
      u.phone = "+919999000077"
      u.password = "Admin@1234"
      u.password_confirmation = "Admin@1234"
      u.role = "admin"
      u.status = "active"
    end

    @category = Category.find_or_create_by!(slug: "admin-pag-test-cat") do |c|
      c.name = "Test Category"
      c.status = "active"
    end

    3.times do |i|
      Service.create!(name: "Pag Service #{i}", category: @category, base_price: 500 + (i * 100), duration_minutes: 30, status: "active")
    end

    3.times do |i|
      User.create!(
        name: "Customer Pag #{i}",
        email: "customer_pag_#{i}@test.com",
        phone: "+9198880000#{i}#{rand(10..99)}",
        password: "Password@123",
        role: "customer",
        status: "active"
      )
    end
  end

  test "GET /admin/services renders pagination controls with multi-page navigation" do
    post login_path, params: { email: @admin.email, password: "Admin@1234" }

    get admin_services_path, params: { per_page: 2, page: 1, status: "active" }
    assert_response :success
    assert_includes response.body, "Total:"
    assert_includes response.body, "Page 1 of"
    assert_includes response.body, "page=2"

    get admin_services_path, params: { per_page: 2, page: 2, status: "active" }
    assert_response :success
    assert_includes response.body, "Total:"
    assert_includes response.body, "bc-pagination-bar"
  end

  test "GET /admin/customers renders pagination controls" do
    post login_path, params: { email: @admin.email, password: "Admin@1234" }

    get admin_customers_path, params: { per_page: 2, page: 1 }
    assert_response :success
    assert_includes response.body, "Total:"
    assert_includes response.body, "page=2"
  end

  test "GET /admin/categories renders pagination controls" do
    post login_path, params: { email: @admin.email, password: "Admin@1234" }

    get admin_categories_path, params: { per_page: 1, page: 1 }
    assert_response :success
    assert_includes response.body, "Total:"
    assert_includes response.body, "bc-pagination-bar"
  end

  test "Admin::BaseController#paginate handles safe limits and total counts" do
    post login_path, params: { email: @admin.email, password: "Admin@1234" }

    # Requesting out-of-bounds page should clamp gracefully
    get admin_services_path, params: { per_page: 2, page: 999 }
    assert_response :success
    assert_includes response.body, "Total:"
  end

  test "default pagination uses 10 items per page and renders next page option" do
    post login_path, params: { email: @admin.email, password: "Admin@1234" }

    12.times do |i|
      Service.create!(name: "Extra Service #{i}", category: @category, base_price: 300, duration_minutes: 20, status: "active")
    end

    get admin_services_path
    assert_response :success
    assert_includes response.body, "Total:"
    assert_includes response.body, "Page 1 of"
    assert_includes response.body, "bc-page-btn--active"
    assert_includes response.body, "page=2"
    refute_includes response.body, "Per page:"
  end
end
