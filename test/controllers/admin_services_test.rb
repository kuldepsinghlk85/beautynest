# frozen_string_literal: true

require "test_helper"

class AdminServicesTest < ActionDispatch::IntegrationTest
  setup do
    @admin = User.find_or_create_by!(email: "admin_services_test@BeautyNest.test") do |u|
      u.name = "Admin Services"
      u.phone = "+919999000088"
      u.password = "Admin@1234"
      u.password_confirmation = "Admin@1234"
      u.role = "admin"
      u.status = "active"
    end

    @category = Category.find_or_create_by!(slug: "admin-service-test-cat") do |c|
      c.name = "Test Category"
      c.description = "Category for service testing"
      c.status = "active"
    end
  end

  test "GET /admin/services requires admin login" do
    get "/admin/services"
    assert_redirected_to login_path
  end

  test "GET /admin/services renders successfully for admin" do
    post login_path, params: { email: @admin.email, password: "Admin@1234" }
    assert_redirected_to admin_dashboard_path

    get "/admin/services"
    assert_response :success
  end

  test "GET /admin/services/new renders form successfully for admin" do
    post login_path, params: { email: @admin.email, password: "Admin@1234" }
    get new_admin_service_path
    assert_response :success
    assert_includes response.body, "New Service"
    assert_includes response.body, "Subcategory"
  end

  test "POST /admin/services creates service with subcategory_id directly" do
    post login_path, params: { email: @admin.email, password: "Admin@1234" }
    subcategory = Subcategory.create!(
      category: @category,
      name: "Direct Subcat Test",
      status: "active"
    )

    assert_difference -> { Service.count }, 1 do
      post "/admin/services", params: {
        service: {
          name: "Direct Subcat Service",
          subcategory_id: subcategory.id,
          tag: "facial",
          base_price: 799.0,
          duration_minutes: 30,
          status: "active"
        }
      }
    end

    service = Service.find_by!(name: "Direct Subcat Service")
    assert_redirected_to admin_service_path(service)
    assert_equal subcategory.id, service.subcategory_id
  end

  test "POST /admin/services creates service with image" do
    post login_path, params: { email: @admin.email, password: "Admin@1234" }

    file = fixture_file_upload(Rails.root.join("test/fixtures/files/test.png"), "image/png")

    assert_difference -> { Service.count }, 1 do
      post "/admin/services", params: {
        service: {
          name: "Test Unique Facial Service",
          category_id: @category.id,
          base_price: 999.0,
          duration_minutes: 45,
          status: "active",
          image: file
        }
      }
    end

    service = Service.find_by!(name: "Test Unique Facial Service")
    assert_redirected_to admin_service_path(service)
    assert_equal "Test Unique Facial Service", service.name
    assert_equal 999.0, service.base_price
    assert service.image.attached?
  end

  test "PATCH /admin/services/:id replaces image and purges old blob without duplicate data" do
    post login_path, params: { email: @admin.email, password: "Admin@1234" }

    service = Service.create!(
      name: "Service Image Replace Test",
      category: @category,
      base_price: 500,
      duration_minutes: 30,
      status: "active"
    )

    file1 = fixture_file_upload(Rails.root.join("test/fixtures/files/test.png"), "image/png")
    service.image.attach(file1)
    old_blob_id = service.image.blob.id

    file2 = fixture_file_upload(Rails.root.join("test/fixtures/files/test.png"), "image/png")
    patch admin_service_path(service), params: {
      service: {
        image: file2
      }
    }

    assert_redirected_to admin_service_path(service)
    service.reload
    assert service.image.attached?
    assert_not_equal old_blob_id, service.image.blob.id
    assert_not ActiveStorage::Blob.exists?(id: old_blob_id)
  end

  test "PATCH /admin/services/:id with remove_image=1 removes image without leaving duplicate blobs" do
    post login_path, params: { email: @admin.email, password: "Admin@1234" }

    service = Service.create!(
      name: "Service Image Remove Test",
      category: @category,
      base_price: 600,
      duration_minutes: 40,
      status: "active"
    )

    file = fixture_file_upload(Rails.root.join("test/fixtures/files/test.png"), "image/png")
    service.image.attach(file)
    blob_id = service.image.blob.id

    patch admin_service_path(service), params: {
      service: {
        remove_image: "1"
      }
    }

    assert_redirected_to admin_service_path(service)
    service.reload
    assert_not service.image.attached?
    assert_not ActiveStorage::Blob.exists?(id: blob_id)
  end

  test "GET /admin/services/:id renders show page with service details" do
    post login_path, params: { email: @admin.email, password: "Admin@1234" }

    service = Service.create!(
      name: "Bridal Spa Treatment",
      category: @category,
      base_price: 1800,
      duration_minutes: 60,
      status: "active"
    )

    get admin_service_path(service)
    assert_response :success
    assert_includes response.body, "Bridal Spa Treatment"
    assert_includes response.body, "Delete Service"
  end

  test "GET /admin/services/:id/edit renders edit form" do
    post login_path, params: { email: @admin.email, password: "Admin@1234" }

    service = Service.create!(
      name: "Hair Spa Deluxe",
      category: @category,
      base_price: 1200,
      duration_minutes: 45,
      status: "active"
    )

    get edit_admin_service_path(service)
    assert_response :success
    assert_includes response.body, "Hair Spa Deluxe"
  end

  test "DELETE /admin/services/:id deletes service successfully and redirects" do
    post login_path, params: { email: @admin.email, password: "Admin@1234" }

    service = Service.create!(
      name: "Service To Delete",
      category: @category,
      base_price: 499,
      duration_minutes: 30,
      status: "active"
    )

    assert_difference -> { Service.count }, -1 do
      delete admin_service_path(service)
    end

    assert_redirected_to admin_services_path
    follow_redirect!
    assert_includes response.body, "Service &#39;Service To Delete&#39; deleted successfully."
  end

  test "DELETE /admin/services/:id nullifies service_id on booking_items without column error" do
    post login_path, params: { email: @admin.email, password: "Admin@1234" }

    service = Service.create!(
      name: "Service With Booking",
      category: @category,
      base_price: 750,
      duration_minutes: 35,
      status: "active"
    )

    customer = User.create!(
      name: "Customer For Booking",
      email: "cust_svc_test@BeautyNest.test",
      phone: "+919999000099",
      password: "Customer@1234",
      password_confirmation: "Customer@1234",
      role: "customer",
      status: "active"
    )

    booking = Booking.create!(customer: customer, status: "pending", total_amount: 750, subtotal_amount: 750)
    booking_item = BookingItem.create!(booking: booking, service: service, quantity: 1)

    assert_equal service.id, booking_item.service_id

    delete admin_service_path(service)
    assert_redirected_to admin_services_path

    booking_item.reload
    assert_nil booking_item.service_id
    assert_equal "Service With Booking", booking_item.service_name_snapshot
  end

  test "GET /admin/services with category_id, status, and sort filters satisfies Pundit policy scoping" do
    post login_path, params: { email: @admin.email, password: "Admin@1234" }

    Service.create!(name: "Facial Alpha", category: @category, base_price: 500, duration_minutes: 30, status: "active")
    Service.create!(name: "Facial Beta", category: @category, base_price: 800, duration_minutes: 45, status: "inactive")

    # Filter with category_id parameter
    get admin_services_path, params: { category_id: @category.id, status: "active", sort: "price_asc" }
    assert_response :success
    assert_includes response.body, "Facial Alpha"
    assert_not_includes response.body, "Facial Beta"

    # Filter with search and sort
    get admin_services_path, params: { search: "Alpha", sort: "price_desc" }
    assert_response :success
    assert_includes response.body, "Facial Alpha"
  end

  test "GET /admin/categories/:category_id/services nested route satisfies Pundit policy scoping" do
    post login_path, params: { email: @admin.email, password: "Admin@1234" }

    Service.create!(name: "Nested Service", category: @category, base_price: 650, duration_minutes: 40, status: "active")

    get admin_category_services_path(@category)
    assert_response :success
    assert_includes response.body, "Nested Service"
  end

  test "GET /admin/services renders KPI cards and supports featured and on_sale filters" do
    post login_path, params: { email: @admin.email, password: "Admin@1234" }

    Service.create!(name: "Deal Service", category: @category, base_price: 1000, discount_price: 799, duration_minutes: 50, featured: true, status: "active")
    Service.create!(name: "Standard Service", category: @category, base_price: 600, duration_minutes: 30, featured: false, status: "active")

    get admin_services_path
    assert_response :success
    assert_includes response.body, "Total Services"
    assert_includes response.body, "Featured Catalog"
    assert_includes response.body, "Discounted / Deals"
    assert_includes response.body, "Average Price"

    # Filter on_sale
    get admin_services_path, params: { on_sale: "true" }
    assert_response :success
    assert_includes response.body, "Deal Service"
    assert_not_includes response.body, "Standard Service"

    # Filter featured
    get admin_services_path, params: { featured: "true" }
    assert_response :success
    assert_includes response.body, "Deal Service"
    assert_not_includes response.body, "Standard Service"
  end
end
