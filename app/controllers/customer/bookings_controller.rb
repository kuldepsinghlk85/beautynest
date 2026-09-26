# frozen_string_literal: true

module Customer
  class BookingsController < BaseController
    before_action :set_metrics, only: %i[index show]

    # GET /my-bookings
    def index
      @status_filter = params[:status].to_s.downcase.presence || "all"

      scope = current_customer_user.customer_bookings
                                   .includes(:address, :worker, :payments, :review, booking_items: :service)

      @bookings = case @status_filter
                  when "upcoming"
                    scope.where(booking_status: %w[pending assigned confirmed accepted])
                         .order(scheduled_at: :asc, created_at: :desc)
                  when "in_progress"
                    scope.where(booking_status: "in_progress")
                         .order(scheduled_at: :desc)
                  when "completed"
                    scope.where("booking_status = 'completed' OR service_status = 'completed'")
                         .order(scheduled_at: :desc, created_at: :desc)
                  when "cancelled"
                    scope.where(booking_status: %w[cancelled rejected])
                         .order(created_at: :desc)
                  else # "all"
                    scope.order(scheduled_at: :desc, created_at: :desc)
                  end
    end

    # GET /my-bookings/:id
    def show
      @booking = current_customer_user.customer_bookings
                                      .includes(:address, :worker, :payments, :review, :coupon, booking_items: :service)
                                      .find_by(id: params[:id])

      unless @booking
        flash[:alert] = "Booking not found."
        return redirect_to customer_bookings_path
      end

      @review = @booking.review || Review.new
    end

    # PATCH /my-bookings/:id/cancel
    def cancel
      @booking = current_customer_user.customer_bookings.find_by(id: params[:id])

      unless @booking
        flash[:alert] = "Booking not found."
        return redirect_to customer_bookings_path
      end

      cancellable_statuses = %w[pending assigned confirmed accepted]
      unless cancellable_statuses.include?(@booking.booking_status)
        flash[:alert] = "This appointment can no longer be cancelled online as it is already #{@booking.booking_status.humanize.downcase}."
        return redirect_to customer_booking_path(@booking)
      end

      reason = params[:cancellation_reason].to_s.strip.presence || "Cancelled by customer via customer portal."

      @booking.booking_status = "cancelled"
      @booking.service_status = "cancelled"
      @booking.notes = [@booking.notes, "[Cancellation] #{reason}"].compact_blank.join("\n")

      if @booking.save
        flash[:notice] = "Booking ##{@booking.display_id} has been cancelled successfully."
      else
        flash[:alert] = @booking.errors.full_messages.to_sentence
      end

      redirect_to customer_booking_path(@booking)
    end

    # POST /my-bookings/:id/review
    def review
      @booking = current_customer_user.customer_bookings.find_by(id: params[:id])

      unless @booking
        flash[:alert] = "Booking not found."
        return redirect_to customer_bookings_path
      end

      unless @booking.completed?
        flash[:alert] = "You can only review bookings that have been completed."
        return redirect_to customer_booking_path(@booking)
      end

      if @booking.reviewed?
        flash[:alert] = "You have already submitted a review for this booking. Reviews can only be given once."
        return redirect_to customer_booking_path(@booking)
      end

      rating = params[:rating].to_i
      comment = params[:comment].to_s.strip

      if rating < 1 || rating > 5
        flash[:alert] = "Please select a star rating between 1 and 5."
        return redirect_to customer_booking_path(@booking)
      end

      review = @booking.build_review(
        rating: rating,
        comment: comment,
        customer_id: current_customer_user.id,
        worker_id: @booking.worker_id,
        service_id: @booking.booking_items.first&.service_id
      )

      if review.save
        flash[:notice] = "Thank you for your review! Your feedback helps our beauticians maintain high standards."
      else
        flash[:alert] = review.errors.full_messages.to_sentence
      end

      target_path = params[:return_to] == "index" ? customer_bookings_path : customer_booking_path(@booking)
      redirect_to target_path
    end

    private

    def set_metrics
      all = current_customer_user.customer_bookings
      @total_count       = all.count
      @upcoming_count    = all.where(booking_status: %w[pending assigned confirmed accepted]).count
      @in_progress_count = all.where(booking_status: "in_progress").count
      @completed_count   = all.where("booking_status = 'completed' OR service_status = 'completed'").count
      @cancelled_count   = all.where(booking_status: %w[cancelled rejected]).count
    end
  end
end
