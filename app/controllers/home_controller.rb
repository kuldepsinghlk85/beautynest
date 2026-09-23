# frozen_string_literal: true

class HomeController < ApplicationController
  layout "public"

  def index
    # Pull live counts for the homepage stats
    @stats = {
      customers: User.customers.count,
      workers:   User.workers.active.count,
      bookings:  Booking.where(service_status: "completed").count,
      cities:    City.active.count
    }

    # Top categories for service grid
    @categories = Category.where(active: true).order(:name) rescue []

    # Dynamic active coupons for offers teaser
    @coupons = Coupon.valid_now.order(discount_value: :desc).limit(4) rescue []

    # Trending Doorstep Salon Rituals (Featured Services)
    @trending_services = Service.active.includes(:category).order(base_price: :desc).limit(6) rescue []

    # Featured Beauticians in Varanasi / City
    @featured_workers = User.workers.active.includes(worker_profile: :city).limit(6) rescue []
  end

  def index2
    # Preserve legacy homepage data
    @stats = {
      customers: User.customers.count,
      workers:   User.workers.active.count,
      bookings:  Booking.where(service_status: "completed").count,
      cities:    City.active.count
    }
    @categories = Category.where(active: true).order(:name).limit(6) rescue []
    @coupons = Coupon.valid_now.order(discount_value: :desc).limit(3) rescue []
    render :index2
  end
end
