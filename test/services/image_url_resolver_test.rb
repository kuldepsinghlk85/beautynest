# frozen_string_literal: true

require "test_helper"

class ImageUrlResolverTest < ActiveSupport::TestCase
  setup do
    Rails.cache.clear
    @worker = User.new(
      name: "Test Beautician",
      email: "beautician.test@example.com",
      phone: "+919988776655",
      role: :worker,
      status: :active
    )
    @worker.id = SecureRandom.uuid
    @worker.updated_at = Time.now
  end

  # Case 1 — Valid image: returns valid image URL
  test "Case 1: Valid image returns valid image URL" do
    valid_url = "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80"
    resolved = ImageUrlResolver.resolve(valid_url, type: :beautician)
    assert_equal valid_url, resolved
  end

  # Case 2 — Missing image: nil / blank returns application fallback
  test "Case 2: Missing image (nil or blank) returns fallback" do
    assert_equal ImageUrlResolver::FALLBACK_CATEGORY, ImageUrlResolver.resolve(nil, type: :category)
    assert_equal ImageUrlResolver::FALLBACK_SERVICE, ImageUrlResolver.resolve("", type: :service)
    
    # For beautician with no avatar, returns either application fallback or verified CDN avatar
    resolved = ImageUrlResolver.resolve(nil, type: :beautician)
    assert resolved.present?
    assert ImageUrlResolver.valid_url?(resolved) || resolved == ImageUrlResolver::FALLBACK_BEAUTICIAN
  end

  # Case 3 — Invalid Unsplash URL: does NOT return invalid URL, returns fallback
  test "Case 3: Truncated Unsplash URL without hash is rejected and returns fallback" do
    invalid_url = "https://images.unsplash.com/photo-1573496359142?auto=format&fit=crop&w=400&q=80"
    
    refute ImageUrlResolver.valid_url?(invalid_url)
    assert ImageUrlResolver.known_invalid?(invalid_url)
    
    resolved = ImageUrlResolver.resolve(invalid_url, type: :beautician)
    refute_equal invalid_url, resolved
    assert ImageUrlResolver.valid_url?(resolved) || resolved == ImageUrlResolver::FALLBACK_BEAUTICIAN
  end

  # Case 4 — Known broken / 404 URL returns fallback and does NOT hit invalid URL
  test "Case 4: Known 404 URL returns fallback" do
    broken_url = "https://images.unsplash.com/photo-1512290900672-1f419b48b598?auto=format&fit=crop&w=800&q=80"
    
    refute ImageUrlResolver.valid_url?(broken_url)
    resolved = ImageUrlResolver.resolve(broken_url, type: :category)
    assert_equal ImageUrlResolver::FALLBACK_CATEGORY, resolved
  end

  # Case 5 — Valid external URL is preserved
  test "Case 5: Valid external HTTPS URL from allowed host is preserved" do
    valid_external = "https://res.cloudinary.com/demo/image/upload/sample.jpg"
    assert ImageUrlResolver.valid_url?(valid_external)
    assert_equal valid_external, ImageUrlResolver.resolve(valid_external, type: :service)
  end

  # Case 6 — Cache behavior: repeated requests use cache
  test "Case 6: Repeated resolution uses Rails cache" do
    valid_url = "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=400&q=80"
    @worker.avatar_url = valid_url

    # First call primes the cache
    result1 = ImageUrlResolver.resolve(@worker, type: :beautician, record: @worker)
    assert_equal valid_url, result1

    # Verify key is in cache
    cache_key = "img_res:User:#{@worker.id}:#{@worker.updated_at.to_i}:beautician"
    assert_equal valid_url, Rails.cache.read(cache_key)

    # Second call returns cached value
    result2 = ImageUrlResolver.resolve(@worker, type: :beautician, record: @worker)
    assert_equal result1, result2
  end

  # Case 7 — Model validation rejects invalid URL
  test "Case 7: User model validation rejects truncated Unsplash URL" do
    invalid_url = "https://images.unsplash.com/photo-1573496359142?auto=format&fit=crop&w=400&q=80"
    user = User.new(
      name: "Bad URL User",
      email: "bad.url@example.com",
      password: "Password@123",
      phone: "+919999988888",
      role: :worker,
      status: :active,
      avatar_url: invalid_url
    )
    refute user.valid?
    assert user.errors[:avatar_url].present?
  end
end
