# frozen_string_literal: true

require "test_helper"

class SubcategoryTest < ActiveSupport::TestCase
  setup do
    @category = Category.create!(
      name: "Salon Category #{SecureRandom.hex(4)}",
      status: "active"
    )
  end

  test "creates valid subcategory" do
    sub = Subcategory.new(
      category: @category,
      name: "Hair Care",
      status: "active"
    )
    assert sub.valid?
    assert sub.save
    assert_equal "hair-care", sub.slug
  end

  test "requires category" do
    sub = Subcategory.new(name: "Orphan Subcategory", status: "active")
    assert_not sub.valid?
    assert_includes sub.errors[:category_id], "can't be blank"
  end

  test "requires name" do
    sub = Subcategory.new(category: @category, name: "", status: "active")
    assert_not sub.valid?
    assert_includes sub.errors[:name], "can't be blank"
  end

  test "validates status inclusion" do
    sub = Subcategory.new(category: @category, name: "Test", status: "invalid")
    assert_not sub.valid?
    assert_includes sub.errors[:status], "is not included in the list"
  end

  test "does not respond to image_url or image (no image option allowed)" do
    sub = Subcategory.new(category: @category, name: "No Image Sub")
    assert_not sub.respond_to?(:image_url), "Subcategory should NOT have image_url"
  end

  test "counts active services" do
    sub = Subcategory.create!(category: @category, name: "Skin Care", status: "active")
    Service.create!(
      subcategory: sub,
      name: "Facial A",
      tag: "facial",
      base_price: 500,
      duration_minutes: 45,
      status: "active"
    )
    Service.create!(
      subcategory: sub,
      name: "Facial B",
      tag: "facial",
      base_price: 600,
      duration_minutes: 45,
      status: "inactive"
    )

    assert_equal 1, sub.service_count
  end

  test "category reaches services through subcategories" do
    sub = Subcategory.create!(category: @category, name: "Nail Care", status: "active")
    svc = Service.create!(
      subcategory: sub,
      name: "Manicure",
      tag: "mani-padi",
      base_price: 400,
      duration_minutes: 30,
      status: "active"
    )

    assert_includes @category.services, svc
    assert_equal @category, svc.category
  end
end
