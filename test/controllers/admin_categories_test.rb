# frozen_string_literal: true

require "test_helper"

class AdminCategoriesTest < ActionDispatch::IntegrationTest
  setup do
    @admin = User.find_or_create_by!(email: "admin_categories_test@BeautyNest.test") do |u|
      u.name = "Admin Categories"
      u.phone = "+919999000055"
      u.password = "Admin@1234"
      u.password_confirmation = "Admin@1234"
      u.role = "admin"
      u.status = "active"
    end

    @category = Category.find_or_create_by!(slug: "admin-category-test-slug") do |c|
      c.name = "Test Admin Category"
      c.description = "Category for admin testing"
      c.status = "active"
      c.featured = true
    end
  end

  test "GET /admin/categories renders successfully with images" do
    post login_path, params: { email: @admin.email, password: "Admin@1234" }

    get "/admin/categories"
    assert_response :success
    assert_includes response.body, "Test Admin Category"
  end

  test "GET /admin/categories/new renders new category form with image preview element" do
    post login_path, params: { email: @admin.email, password: "Admin@1234" }

    get "/admin/categories/new"
    assert_response :success
    assert_includes response.body, "category-image-input"
    assert_includes response.body, "category-preview-img"
  end

  test "POST /admin/categories creates category with image" do
    post login_path, params: { email: @admin.email, password: "Admin@1234" }

    file = fixture_file_upload(Rails.root.join("test/fixtures/files/test.png"), "image/png")

    assert_difference -> { Category.count }, 1 do
      post "/admin/categories", params: {
        category: {
          name: "Category With Uploaded Image",
          description: "Testing image upload",
          status: "active",
          image: file
        }
      }
    end

    created = Category.find_by!(name: "Category With Uploaded Image")
    assert_redirected_to admin_category_path(created)
    assert created.image.attached?
  end

  test "PATCH /admin/categories/:id replaces image and purges old blob without duplicate data" do
    post login_path, params: { email: @admin.email, password: "Admin@1234" }

    file1 = fixture_file_upload(Rails.root.join("test/fixtures/files/test.png"), "image/png")
    @category.image.attach(file1)
    assert @category.image.attached?
    old_blob_id = @category.image.blob.id

    file2 = fixture_file_upload(Rails.root.join("test/fixtures/files/test.png"), "image/png")

    patch admin_category_path(@category), params: {
      category: {
        name: "Test Admin Category Updated",
        image: file2
      }
    }

    assert_redirected_to admin_category_path(@category)
    @category.reload
    assert @category.image.attached?
    # Verify the old blob was purged so no duplicate storage is accumulated
    assert_not_equal old_blob_id, @category.image.blob.id
    assert_not ActiveStorage::Blob.exists?(id: old_blob_id)
  end

  test "PATCH /admin/categories/:id with remove_image=1 removes image without leaving duplicate blobs" do
    post login_path, params: { email: @admin.email, password: "Admin@1234" }

    file = fixture_file_upload(Rails.root.join("test/fixtures/files/test.png"), "image/png")
    @category.image.attach(file)
    assert @category.image.attached?
    blob_id = @category.image.blob.id

    patch admin_category_path(@category), params: {
      category: {
        remove_image: "1"
      }
    }

    assert_redirected_to admin_category_path(@category)
    @category.reload
    assert_not @category.image.attached?
    assert_not ActiveStorage::Blob.exists?(id: blob_id)
  end

  test "attach_image_from_url handles remote URLs gracefully" do
    # Validates URL format checking
    assert_not @category.attach_image_from_url("invalid-url")
    assert_includes @category.errors[:image], "must be a valid web URL starting with http:// or https://"

    mock_file = File.open(Rails.root.join("test/fixtures/files/test.png"), "rb")
    mock_file.define_singleton_method(:content_type) { "image/png" }

    original_open = URI::HTTP.instance_method(:open)
    begin
      URI::HTTP.define_method(:open) { |*_args| mock_file }
      assert @category.attach_image_from_url("https://res.cloudinary.com/test/image.png")
      assert @category.image.attached?
      assert_equal "image.png", @category.image.filename.to_s
    ensure
      URI::HTTP.define_method(:open, original_open)
      mock_file.close unless mock_file.closed?
    end
  end

  test "GET /admin/categories/:id renders show page with sub-categories and services" do
    post login_path, params: { email: @admin.email, password: "Admin@1234" }

    sub = Subcategory.create!(name: "Sub Category 1", category: @category, status: "active")
    svc = Service.create!(name: "Service In Cat", subcategory: sub, base_price: 299, duration_minutes: 30, status: "active")

    get admin_category_path(@category)
    assert_response :success
    assert_includes response.body, "Sub Category 1"
    assert_includes response.body, "Delete Category"
  end

  test "GET /admin/categories/:id/edit renders edit form" do
    post login_path, params: { email: @admin.email, password: "Admin@1234" }

    get edit_admin_category_path(@category)
    assert_response :success
    assert_includes response.body, "Edit Category"
    assert_includes response.body, @category.name
  end

  test "DELETE /admin/categories/:id deletes category successfully and redirects" do
    post login_path, params: { email: @admin.email, password: "Admin@1234" }

    cat_to_delete = Category.create!(name: "Category To Delete", status: "active")

    assert_difference -> { Category.count }, -1 do
      delete admin_category_path(cat_to_delete)
    end

    assert_redirected_to admin_categories_path
    follow_redirect!
    assert_includes response.body, "Category &#39;Category To Delete&#39; deleted successfully."
  end

  test "DELETE /admin/categories/:id cascades deletion to dependent sub-categories and services" do
    post login_path, params: { email: @admin.email, password: "Admin@1234" }

    parent = Category.create!(name: "Parent To Delete", status: "active")
    child = Subcategory.create!(name: "Child Under Parent", category: parent, status: "active")
    service = Service.create!(name: "Service Under Parent", subcategory: child, base_price: 150, duration_minutes: 20, status: "active")

    assert_difference -> { Category.count }, -1 do
      assert_difference -> { Subcategory.count }, -1 do
        assert_difference -> { Service.count }, -1 do
          delete admin_category_path(parent)
        end
      end
    end

    assert_redirected_to admin_categories_path
    assert_not Category.exists?(id: parent.id)
    assert_not Subcategory.exists?(id: child.id)
    assert_not Service.exists?(id: service.id)
  end
end


