# frozen_string_literal: true

require "test_helper"

class ServiceTest < ActiveSupport::TestCase
  setup do
    @category = Category.create!(
      name: "Salon Test Category",
      slug: "salon-test-category-#{SecureRandom.hex(4)}",
      status: "active"
    )
  end

  test "accepts valid tags" do
    %w[facial korean-glow mani-padi].each do |tag|
      svc = Service.new(
        name: "Test #{tag}",
        category: @category,
        base_price: 500,
        duration_minutes: 45,
        status: "active",
        tag: tag
      )
      assert svc.valid?, "Service with tag #{tag} should be valid: #{svc.errors.full_messages}"
      assert_equal tag, svc.tag
    end
  end

  test "normalizes mani-pedi to mani-padi" do
    svc = Service.create!(
      name: "Pedicure Special",
      category: @category,
      base_price: 600,
      duration_minutes: 45,
      status: "active",
      tag: "mani-pedi"
    )
    assert_equal "mani-padi", svc.tag
    assert_equal "Mani-Pedi", svc.tag_label
  end

  test "rejects invalid tag" do
    svc = Service.new(
      name: "Invalid Tag Service",
      category: @category,
      base_price: 500,
      duration_minutes: 45,
      status: "active",
      tag: "invalid-tag"
    )
    assert_not svc.valid?
    assert_includes svc.errors[:tag], "is not included in the list"
  end

  test "defaults blank tag to facial" do
    svc = Service.create!(
      name: "Default Tag Service",
      category: @category,
      base_price: 500,
      duration_minutes: 45,
      status: "active"
    )
    assert_equal "facial", svc.tag
    assert_equal "Facial", svc.tag_label
  end

  test "by_tag scope filters services" do
    svc1 = Service.create!(name: "S1", category: @category, base_price: 100, duration_minutes: 30, tag: "facial")
    svc2 = Service.create!(name: "S2", category: @category, base_price: 100, duration_minutes: 30, tag: "korean-glow")
    svc3 = Service.create!(name: "S3", category: @category, base_price: 100, duration_minutes: 30, tag: "mani-padi")

    assert_includes Service.by_tag("facial"), svc1
    assert_not_includes Service.by_tag("facial"), svc2
    assert_includes Service.by_tag("korean-glow"), svc2
    assert_includes Service.by_tag("mani-padi"), svc3
  end

  test "as_json_api includes tag and tag_label" do
    svc = Service.create!(
      name: "JSON Tag Test",
      category: @category,
      base_price: 750,
      duration_minutes: 50,
      tag: "korean-glow"
    )
    json = svc.as_json_api
    assert_equal "korean-glow", json[:tag]
    assert_equal "Korean Glow", json[:tag_label]
  end

  test "handle_image_upload with remove: true clears image_url and purges attachment" do
    svc = Service.create!(
      name: "Image Remove Test",
      category: @category,
      base_price: 500,
      duration_minutes: 30,
      image_url: "https://res.cloudinary.com/test/image/upload/v1/test_img.png"
    )

    svc.handle_image_upload(nil, remove: true)
    assert_nil svc.image_url
  end

  test "cleanup_cloudinary_image is invoked when service is destroyed" do
    destroyed_urls = []
    original_destroy = CloudinaryService.method(:destroy_by_url)
    begin
      CloudinaryService.define_singleton_method(:destroy_by_url) { |url| destroyed_urls << url }
      svc = Service.create!(
        name: "Cloudinary Cleanup Test",
        category: @category,
        base_price: 500,
        duration_minutes: 30,
        image_url: "https://res.cloudinary.com/test/image/upload/v1/sample_service.png"
      )
      svc.destroy!
    ensure
      CloudinaryService.define_singleton_method(:destroy_by_url, original_destroy)
    end

    assert_includes destroyed_urls, "https://res.cloudinary.com/test/image/upload/v1/sample_service.png"
  end
end
