# frozen_string_literal: true

module Api
  module V1
    class StatsController < BaseController
      skip_before_action :authenticate_api_user!, only: %i[index]

      # GET /api/v1/stats — Public Platform Statistics (Customers, Beauticians, Bookings, Ratings)
      def index
        city_scope = nil
        if params[:city_id].present? || params[:city].present?
          target_city = params[:city_id].presence || params[:city].presence
          city_scope = City.find_by(id: target_city) || City.find_by(slug: target_city)
        end

        if city_scope
          customer_count     = User.customers.joins(:addresses).where(addresses: { city_id: city_scope.id }).distinct.count
          total_workers      = User.workers.joins(:worker_profile).where(worker_profiles: { city_id: city_scope.id }).count
          active_workers     = User.workers.active.joins(:worker_profile).where(worker_profiles: { city_id: city_scope.id, is_available: true }).count
          completed_bookings = Booking.where(city_id: city_scope.id, service_status: "completed").count
          total_bookings     = Booking.where(city_id: city_scope.id).count
          avg_rating         = WorkerProfile.where(city_id: city_scope.id).where("rating_count > 0").average(:rating_avg)&.to_f&.round(2) || 5.0
          total_reviews      = Review.joins(:worker).joins("INNER JOIN worker_profiles ON worker_profiles.user_id = users.id").where(worker_profiles: { city_id: city_scope.id }).count
        else
          customer_count     = User.customers.count
          active_customers   = User.customers.active.count
          total_workers      = User.workers.count
          active_workers     = User.workers.active.joins(:worker_profile).where(worker_profiles: { is_available: true }).count
          completed_bookings = Booking.where(service_status: "completed").count
          total_bookings     = Booking.count
          total_services     = Service.active.count
          total_cities       = City.active.count
          avg_rating         = WorkerProfile.where("rating_count > 0").average(:rating_avg)&.to_f&.round(2) || 5.0
          total_reviews      = Review.count
        end

        stats_data = {
          total_customers:          customer_count,
          total_workers:            total_workers,
          total_active_workers:     active_workers,
          total_completed_bookings: completed_bookings,
          total_bookings:           total_bookings,
          average_rating:           avg_rating,
          total_reviews:            total_reviews
        }

        unless city_scope
          stats_data.merge!(
            total_active_customers: active_customers,
            total_services:         total_services,
            total_cities:           total_cities
          )
        else
          stats_data[:city] = {
            id:    city_scope.id,
            name:  city_scope.name,
            state: city_scope.state,
            slug:  city_scope.slug
          }
        end

        render_success(stats_data, "Platform statistics retrieved successfully.")
      end
    end
  end
end
