# frozen_string_literal: true

require "test_helper"

class ServiceEnhancementsTest < ActiveSupport::TestCase
  setup do
    @category = Category.create!(name: "Spa & Massage", slug: "spa-massage-test-#{SecureRandom.hex(4)}")
    @subcategory = Subcategory.create!(name: "Aromatherapy", slug: "aromatherapy-test-#{SecureRandom.hex(4)}", category: @category)
    @service = Service.create!(
      name: "Deep Tissue Massage",
      slug: "deep-tissue-massage-#{SecureRandom.hex(4)}",
      subcategory: @subcategory,
      base_price: 1500.00,
      duration_minutes: 60,
      tag: "facial",
      status: "active"
    )
    @customer = User.create!(
      name: "Test Customer",
      email: "cust_test_#{SecureRandom.hex(4)}@example.com",
      phone: "+91#{rand(1000000000..9999999999)}",
      role: "customer",
      status: "active",
      password: "password123"
    )
    @worker_user = User.create!(
      name: "Test Worker",
      email: "worker_test_#{SecureRandom.hex(4)}@example.com",
      phone: "+91#{rand(1000000000..9999999999)}",
      role: "worker",
      status: "active",
      password: "password123"
    )
    @worker_profile = WorkerProfile.create!(user: @worker_user)
  end

  test "WorkerTier creation and WorkerProfile association" do
    tier = WorkerTier.create!(
      name: "Gold Specialist",
      slug: "gold-specialist",
      price_multiplier: 1.5,
      position: 1,
      status: "active"
    )
    assert tier.persisted?
    assert_equal "Gold Specialist", tier.name
    assert_equal 1.5, tier.price_multiplier

    @worker_profile.update!(worker_tier: tier)
    assert_equal tier, @worker_profile.reload.worker_tier
    assert_includes tier.worker_profiles, @worker_profile
  end

  test "ServiceTierPrice overrides base multiplier" do
    tier = WorkerTier.create!(name: "Silver", slug: "silver-#{SecureRandom.hex(3)}", price_multiplier: 1.25)
    stp = ServiceTierPrice.create!(
      service: @service,
      worker_tier: tier,
      price: 1800.00
    )
    assert stp.persisted?
    assert_equal 1800.00, stp.price
    assert_includes @service.worker_tiers, tier
  end

  test "Product catalog and ServiceProduct linkage" do
    product = Product.create!(
      name: "Organic Massage Oil",
      cost_price: 250.00,
      selling_price: 500.00,
      unit: "bottle",
      status: "active"
    )
    assert product.persisted?

    service_product = ServiceProduct.create!(
      service: @service,
      product: product,
      is_required: true
    )
    assert service_product.persisted?
    assert_includes @service.products, product
  end

  test "Booking with GPS coordinates, BookingProduct, and ServiceConsent" do
    booking = Booking.create!(
      customer: @customer,
      worker: @worker_user,
      total_amount: 1500.00,
      subtotal_amount: 1500.00,
      booking_status: "confirmed",
      service_status: "pending",
      customer_latitude: 19.076090,
      customer_longitude: 72.877426,
      location_captured_at: Time.current
    )
    assert booking.persisted?
    assert_in_delta 19.076090, booking.customer_latitude, 0.0001
    assert_in_delta 72.877426, booking.customer_longitude, 0.0001
    assert booking.location_captured_at.present?

    product = Product.create!(
      name: "Facial Serum",
      cost_price: 300.00,
      selling_price: 600.00,
      unit: "piece"
    )

    bp = BookingProduct.create!(
      booking: booking,
      product: product,
      product_name_snapshot: product.name,
      price_snapshot: product.selling_price,
      quantity: 2
    )
    assert_equal 1200.00, bp.line_total
    assert_includes booking.booking_products, bp

    consent = ServiceConsent.create!(
      booking: booking,
      product_source: "platform",
      terms_accepted: true,
      terms_version: "v1.0",
      recorded_by_worker: @worker_user,
      consented_at: Time.current
    )
    assert consent.persisted?
    assert_equal consent, booking.reload.service_consent
  end

  test "BookingExtraCharge lifecycle (pending, approved, rejected)" do
    booking = Booking.create!(
      customer: @customer,
      worker: @worker_user,
      total_amount: 1500.00,
      subtotal_amount: 1500.00,
      booking_status: "confirmed",
      service_status: "in_progress"
    )

    charge = BookingExtraCharge.create!(
      booking: booking,
      added_by_worker: @worker_user,
      charge_type: "custom",
      description: "Extra deep conditioning therapy",
      amount: 450.00,
      quantity: 1,
      status: "pending"
    )
    assert charge.pending?
    assert_equal 450.00, charge.line_total

    charge.approve!
    assert charge.approved?
    assert charge.approved_at.present?

    charge.reject!
    assert charge.rejected?
  end

  test "LiveLocation tracking and HomepageSection CMS" do
    loc = LiveLocation.create!(
      user: @worker_user,
      latitude: 19.100000,
      longitude: 72.850000,
      recorded_at: Time.current
    )
    assert loc.persisted?
    assert_equal @worker_user, loc.user

    section = HomepageSection.create!(
      section_key: "hero_banner",
      title: "Luxury Beauty Services at Home",
      subtitle: "Certified professionals deliver salon luxury right to your door",
      content: { "cta_label" => "Book Now", "cta_link" => "/services" },
      position: 1,
      status: "active"
    )
    assert section.persisted?
    assert_equal "Luxury Beauty Services at Home", section.title
    assert_equal "Book Now", section.content["cta_label"]
  end
end
