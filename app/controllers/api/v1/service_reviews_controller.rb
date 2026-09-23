# frozen_string_literal: true

module Api
  module V1
    class ServiceReviewsController < BaseController
      skip_before_action :authenticate_api_user!, only: :index
      before_action :require_customer!, only: :create
      before_action :set_service, only: %i[create]

      # GET /api/v1/service/reviews (Supports ?service_id=uuid_or_slug)
      def index
        target_service_id = params[:service_id].presence || params[:service_slug].presence
        if target_service_id.present?
          service = Service.find_by(id: target_service_id) || Service.friendly.find_by(slug: target_service_id)
          return render_not_found("Service not found.") unless service

          reviews = service.reviews.includes(:customer).recent
          render_success(
            reviews.map { |r| service_review_json(r) },
            "Service reviews retrieved successfully."
          )
        elsif current_api_user&.customer?
          reviews = current_api_user.given_reviews.where.not(service_id: nil).includes(:service).recent
          render_success(
            reviews.map { |r| service_review_json(r) },
            "Customer service reviews retrieved successfully."
          )
        else
          # Public listing of recent published reviews
          reviews = Review.where.not(service_id: nil).includes(:customer, :service).recent.limit(50)
          render_success(
            reviews.map { |r| service_review_json(r) },
            "Service reviews retrieved successfully."
          )
        end
      end

      # POST /api/v1/service/reviews
      def create
        # 1. Check if customer has a completed booking containing this service
        completed_booking = find_completed_booking_for(@service)

        unless completed_booking
          pending_booking = find_any_booking_for(@service)
          if pending_booking
            return render_unprocessable(
              ["Reviews can only be submitted once the service status is completed. Current service status: '#{pending_booking.service_status}'."]
            )
          else
            return render_unprocessable(
              ["You can only review a service after booking and completing it. No completed booking found for this service."]
            )
          end
        end

        # 2. Check for duplicate review by this customer for this service
        if Review.exists?(customer_id: current_api_user.id, service_id: @service.id)
          return render_unprocessable(
            ["Review has already been submitted for this service. Only one review per service is permitted."]
          )
        end

        # 3. Validate rating
        rating_val = (params.dig(:review, :rating) || params[:rating]).to_i
        if rating_val < 1 || rating_val > 5
          return render_unprocessable(["Rating must be an integer between 1 and 5."])
        end

        comment_val = (params.dig(:review, :comment) || params[:comment]).to_s.strip

        review = Review.new(
          customer:    current_api_user,
          service:     @service,
          rating:      rating_val,
          comment:     comment_val
        )

        if review.save
          render_success(
            service_review_json(review),
            "Service review submitted successfully.",
            :created
          )
        else
          render_unprocessable(review.errors.full_messages)
        end
      end

      private

      def set_service
        target_service_id = params.dig(:review, :service_id) || params[:service_id]
        if target_service_id.blank?
          return render_unprocessable(["service_id is required."])
        end

        @service = Service.find_by(id: target_service_id) || Service.friendly.find_by(slug: target_service_id)
        render_not_found("Service not found.") unless @service
      end

      def find_completed_booking_for(service)
        current_api_user.customer_bookings
                        .where(service_status: "completed")
                        .order(created_at: :desc)
                        .find do |b|
                          b.booking_items.any? { |bi| bi.service_id == service.id || bi.service_name_snapshot == service.name } ||
                            b.services.include?(service)
                        end
      end

      def find_any_booking_for(service)
        current_api_user.customer_bookings
                        .order(created_at: :desc)
                        .find do |b|
                          b.booking_items.any? { |bi| bi.service_id == service.id || bi.service_name_snapshot == service.name } ||
                            b.services.include?(service)
                        end
      end

      def service_review_json(r)
        {
          id:            r.id,
          service_id:    r.service_id,
          service_name:  r.service&.name || r.service_name,
          customer_id:   r.customer_id,
          customer_name: r.customer_name,
          worker_id:     r.worker_id,
          worker_name:   r.worker_name,
          rating:        r.rating,
          comment:       r.comment,
          created_at:    r.created_at
        }
      end
    end
  end
end
