# frozen_string_literal: true

module Admin
  class ReviewsController < BaseController
    before_action :set_review, only: %i[show destroy]

    def index
      authorize Review
      scope = policy_scope(Review)
                .includes(:customer, :worker, booking: :booking_items)
                .then { |s| apply_filters(s) }
                .order(created_at: :desc)
      @reviews = paginate(scope, per_page: 10)
    end

    def show; end

    def destroy
      authorize @review
      @review.destroy
      redirect_to admin_reviews_path, status: :see_other, notice: "Review was deleted successfully."
    end

    private

    def set_review
      @review = Review.includes(:customer, :worker, :booking).find(params[:id])
      authorize @review
    end

    def apply_filters(scope)
      scope = scope.where(rating: params[:rating].to_i) if params[:rating].present?
      scope = scope.where(worker_id: params[:worker_id]) if params[:worker_id].present? && current_user&.admin?
      scope
    end
  end
end
