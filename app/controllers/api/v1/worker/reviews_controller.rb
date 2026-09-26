# frozen_string_literal: true

module Api
  module V1
    module Worker
      class ReviewsController < BaseController
        before_action :require_worker!

        # GET /api/v1/worker/reviews — List reviews for the authenticated worker
        def index
          reviews = current_api_user.received_reviews
                                   .includes(:customer, booking: :booking_items)
                                   .order(created_at: :desc)

          render_success(
            reviews.map { |r| review_json(r) },
            "Worker reviews retrieved successfully."
          )
        end

        # GET /api/v1/worker/reviews/:id — View a specific review belonging to the worker
        def show
          review = current_api_user.received_reviews.find(params[:id])
          render_success(review_json(review), "Review details retrieved successfully.")
        rescue ActiveRecord::RecordNotFound
          render_not_found("Review not found or does not belong to you.")
        end

        private

        def review_json(r)
          {
            id: r.id,
            booking_id: r.booking_id,
            booking_number: r.booking&.booking_number,
            customer_name: r.customer_name,
            service_name: r.service_name,
            rating: r.rating,
            comment: r.comment,
            created_at: r.created_at
          }
        end
      end
    end
  end
end
