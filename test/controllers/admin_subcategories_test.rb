# frozen_string_literal: true

require "test_helper"

class AdminSubcategoriesTest < ActionDispatch::IntegrationTest
  setup do
    @admin = User.find_by(email: "admin@BeautyNest.test") || User.create!(
      email: "admin@BeautyNest.test",
      password: "Admin@1234",
      phone: "+919999999999",
      name: "Admin User",
      role: "admin",
      status: "active"
    )
    @category = Category.create!(
      name: "Test Cat #{SecureRandom.hex(3)}",
      status: "active"
    )
    @subcategory = Subcategory.create!(
      category: @category,
      name: "Existing Sub #{SecureRandom.hex(3)}",
      status: "active"
    )
  end

  test "GET /admin/subcategories redirects unauthenticated users" do
    get admin_subcategories_path
    assert_redirected_to login_path
  end

  test "GET /admin/subcategories succeeds for admin" do
    sign_in_admin(@admin)
    get admin_subcategories_path
    assert_response :success
    assert_includes response.body, "Subcategories"
    assert_includes response.body, @subcategory.name
  end

  test "GET /admin/subcategories with category filter" do
    sign_in_admin(@admin)
    get admin_subcategories_path, params: { category_id: @category.id }
    assert_response :success
    assert_includes response.body, @subcategory.name
  end

  test "POST /admin/subcategories creates subcategory" do
    sign_in_admin(@admin)
    assert_difference("Subcategory.count", 1) do
      post admin_subcategories_path, params: {
        subcategory: {
          name: "Brand New Subcategory",
          category_id: @category.id,
          description: "New Subcategory Description",
          position: 1,
          status: "active"
        }
      }
    end
    created = Subcategory.find_by(name: "Brand New Subcategory")
    assert_redirected_to admin_subcategory_path(created)
  end

  test "PATCH /admin/subcategories/:id updates subcategory" do
    sign_in_admin(@admin)
    patch admin_subcategory_path(@subcategory), params: {
      subcategory: {
        name: "Updated Subcategory Name"
      }
    }
    assert_redirected_to admin_subcategory_path(@subcategory)
    assert_equal "Updated Subcategory Name", @subcategory.reload.name
  end

  test "DELETE /admin/subcategories/:id removes subcategory" do
    sign_in_admin(@admin)
    assert_difference("Subcategory.count", -1) do
      delete admin_subcategory_path(@subcategory)
    end
    assert_redirected_to admin_subcategories_path
  end
end
