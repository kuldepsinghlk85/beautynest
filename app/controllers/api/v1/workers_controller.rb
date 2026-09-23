# frozen_string_literal: true

module Api
  module V1
    class WorkersController < BaseController
      skip_before_action :authenticate_api_user!, only: %i[index top show]

      # GET /api/v1/workers — List / Search beauticians with filters
      def index
        limit_val  = [params[:limit].to_i, 50].select(&:positive?).first || 20
        page_val   = [params[:page].to_i, 1].max
        offset_val = (page_val - 1) * limit_val

        workers = User.search_workers(
          city:      params[:city_id].presence || params[:city].presence,
          tier:      params[:tier].presence || params[:tier_slug].presence || params[:worker_tier_id].presence,
          available: params[:available],
          query:     params[:search].presence || params[:q].presence,
          sort:      params[:sort]
        ).limit(limit_val).offset(offset_val)

        render_success(
          workers.map { |w| worker_summary_json(w) },
          "Workers retrieved successfully."
        )
      end

      # GET /api/v1/workers/top — Top-rated beauticians
      def top
        limit_val = [params[:limit].to_i, 50].select(&:positive?).first || 10
        available_param = params[:available].to_s.casecmp?("false") ? nil : true

        top_workers = User.top_workers(
          city:      params[:city_id].presence || params[:city].presence,
          tier:      params[:tier].presence || params[:tier_slug].presence,
          available: available_param,
          limit:     limit_val
        )

        render_success(
          top_workers.map { |w| worker_summary_json(w) },
          "Top beauticians retrieved successfully."
        )
      end

      # GET /api/v1/workers/:id — Detailed beautician profile with recent reviews
      def show
        worker = User.workers.active.find_by(id: params[:id])
        return render_not_found("Beautician / Worker not found.") unless worker

        render_success(
          worker_detail_json(worker),
          "Beautician details retrieved successfully."
        )
      end

      private

      def worker_summary_json(w)
        wp = w.worker_profile
        tier = wp&.worker_tier
        city = wp&.city

        {
          id:               w.id,
          name:             w.name,
          email:            w.email,
          phone:            w.phone,
          avatar_url:       w.avatar_url,
          bio:              wp&.bio.presence || "Professional Beauty & Grooming Specialist",
          experience_years: wp&.experience_years || 0,
          rating_avg:       (wp&.rating_avg || 0.0).to_f,
          rating_count:     wp&.rating_count || 0,
          is_available:     wp&.is_available.nil? ? true : wp.is_available,
          available_today:  wp&.available_today? || false,
          time_slot:        wp&.time_slot_label || "Full Day (Throughout the Day)",
          available_days:   wp&.normalized_days || WorkerProfile::DEFAULT_DAYS,
          tier: tier ? {
            id:               tier.id,
            name:             tier.name,
            slug:             tier.slug,
            price_multiplier: tier.price_multiplier.to_f
          } : nil,
          city: city ? {
            id:    city.id,
            name:  city.name,
            state: city.state,
            slug:  city.slug
          } : nil
        }
      end

      def worker_detail_json(w)
        data = worker_summary_json(w)

        # Preload recent 10 reviews
        reviews = w.received_reviews.includes(:customer, :service).order(created_at: :desc).limit(10)
        data[:recent_reviews] = reviews.map do |r|
          {
            id:            r.id,
            customer_name: r.customer_name,
            service_name:  r.service_name,
            rating:        r.rating,
            comment:       r.comment,
            created_at:    r.created_at
          }
        end

        data
      end
    end
  end
end
