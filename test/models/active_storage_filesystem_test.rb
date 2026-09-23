# frozen_string_literal: true

require "test_helper"

class ActiveStorageFilesystemTest < ActionDispatch::IntegrationTest
  setup do
    @admin = User.find_or_create_by!(email: "admin_storage_test@BeautyNest.test") do |u|
      u.name = "Storage Test Admin"
      u.phone = "+919999000099"
      u.password = "Admin@1234"
      u.password_confirmation = "Admin@1234"
      u.role = "admin"
      u.status = "active"
    end

    @category = Category.find_or_create_by!(slug: "storage-test-category") do |c|
      c.name = "Storage Test Category"
      c.description = "Category for testing image upload to file system"
      c.status = "active"
    end
  end

  test "attaching image to Category uses local file system disk service" do
    file = fixture_file_upload("test.png", "image/png")
    @category.image.attach(file)
    assert @category.save!
    assert @category.image.attached?
    assert_equal "DiskService", @category.image.blob.service.class.name.demodulize
  end

  test "attaching image to Service uses local file system disk service" do
    file = fixture_file_upload("test.png", "image/png")
    service = Service.new(
      name: "Storage Test Service",
      category: @category,
      base_price: 500,
      duration_minutes: 30,
      status: "active"
    )
    service.image.attach(file)
    assert service.save!
    assert service.image.attached?
    assert_equal "DiskService", service.image.blob.service.class.name.demodulize
  end
end
