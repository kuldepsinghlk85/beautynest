# frozen_string_literal: true

module Api
  module V1
    class ReviewsController < BaseController
      before_action :require_customer!

      # GET /api/v1/reviews — List reviews submitted by the authenticated customer
      def index
        reviews = current_api_user.given_reviews
                                 .includes(:worker, booking: :booking_items)
                                 .order(created_at: :desc)
        render_success(
          reviews.map { |r| review_json(r) },
          "Customer reviews retrieved successfully."
        )
      end

      # GET /api/v1/reviews/:id — View specific review submitted by the customer
      def show
        review = current_api_user.given_reviews.find_by(id: params[:id])
        if review
          render_success(review_json(review), "Review details retrieved successfully.")
        else
          render_not_found("Review not found or does not belong to you.")
        end
      end

      # POST /api/v1/reviews — Submit review for a completed booking
      def create
        target_booking_id = params.dig(:review, :booking_id) || params[:booking_id]
        if target_booking_id.blank?
          return render_unprocessable(["booking_id is required."])
        end

        # 1. Customer ownership check (IDOR guard)
        booking = current_api_user.customer_bookings.find_by(id: target_booking_id) ||
                  current_api_user.customer_bookings.find_by(booking_number: target_booking_id)

        unless booking
          if Booking.find_by(id: target_booking_id) || Booking.find_by(booking_number: target_booking_id)
            return render_forbidden("You are not authorized to submit a review for this booking as it belongs to another customer.")
          else
            return render_not_found("Booking not found.")
          end
        end

        # 2. Service status check (must be completed)
        unless booking.completed?
          return render_unprocessable(
            ["Reviews can only be submitted once the service status is completed. Current service status: '#{booking.service_status}'."]
          )
        end

        # 3. Single review check
        if booking.reviewed? || Review.where(booking_id: booking.id).exists?
          return render_unprocessable(
            ["Review has already been submitted for this booking. Only one review per booking is permitted."]
          )
        end

        # 4. Rating validation
        rating_val = (params.dig(:review, :rating) || params[:rating]).to_i
        if rating_val < 1 || rating_val > 5
          return render_unprocessable(["Rating must be an integer between 1 and 5."])
        end

        comment_val = (params.dig(:review, :comment) || params[:comment]).to_s.strip

        review = booking.build_review(
          customer: current_api_user,
          worker: booking.worker,
          rating: rating_val,
          comment: comment_val
        )

        if review.save
          render_success(
            review_json(review),
            "Review submitted successfully.",
            :created
          )
        else
          render_unprocessable(review.errors.full_messages)
        end
      end

      private

      def review_json(r)
        {
          id: r.id,
          booking_id: r.booking_id,
          booking_number: r.booking&.booking_number,
          customer_id: r.customer_id,
          customer_name: r.customer_name,
          worker_id: r.worker_id,
          worker_name: r.worker_name,
          service_id: r.service_id || r.booking&.services&.first&.id || r.booking&.booking_items&.first&.service_id,
          service_name: r.service_name,
          rating: r.rating,
          comment: r.comment,
          created_at: r.created_at
        }
      end
    end
  end
end
