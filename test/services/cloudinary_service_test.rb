# frozen_string_literal: true

require "test_helper"

class CloudinaryServiceTest < ActiveSupport::TestCase
  test "extract_public_id correctly extracts public_id from various Cloudinary URLs" do
    url_with_version = "https://res.cloudinary.com/ki5nokty/image/upload/v1788953487/beauty_connect/services/abc123.jpg"
    assert_equal "beauty_connect/services/abc123", CloudinaryService.extract_public_id(url_with_version)

    url_without_version = "https://res.cloudinary.com/ki5nokty/image/upload/beauty_connect/categories/cat_456.png"
    assert_equal "beauty_connect/categories/cat_456", CloudinaryService.extract_public_id(url_without_version)

    url_with_query_params = "https://res.cloudinary.com/ki5nokty/image/upload/v1/beauty_connect/img789.webp?_a=BACMTiGT"
    assert_equal "beauty_connect/img789", CloudinaryService.extract_public_id(url_with_query_params)
  end

  test "extract_public_id returns nil for non-cloudinary URLs or blank inputs" do
    assert_nil CloudinaryService.extract_public_id(nil)
    assert_nil CloudinaryService.extract_public_id("")
    assert_nil CloudinaryService.extract_public_id("https://images.unsplash.com/photo-1522337360788-8b13dee7a37e")
    assert_nil CloudinaryService.extract_public_id("https://example.com/images/test.png")
  end

  test "destroy_by_url returns nil for non-cloudinary URLs without error" do
    assert_nil CloudinaryService.destroy_by_url(nil)
    assert_nil CloudinaryService.destroy_by_url("https://images.unsplash.com/photo-1522337360788-8b13dee7a37e")
  end

  test "upload returns nil when file is blank" do
    assert_nil CloudinaryService.upload(nil)
    assert_nil CloudinaryService.upload("")
  end
end
