# frozen_string_literal: true

class PublicPagesController < ApplicationController
  layout "public"

  # GET /categories — Server-Side Rendered
  def categories
    @categories          = Category.for_directory
    @featured_categories = Category.featured_for_directory
    @customer_token      = customer_jwt
    @selected_worker     = User.workers.includes(worker_profile: :city).find_by(id: params[:worker_id]) if params[:worker_id].present?
  end

  # GET /categories/:slug — Server-Side Rendered
  def category_detail
    @category        = Category.active.friendly.find(params[:slug])
    @subcategories   = @category.subcategory_pills
    @active_sub      = @subcategories.find { |s| s.id.to_s == params[:sub_id].to_s } if params[:sub_id].present?
    @services        = @category.services_for_sub(params[:sub_id])
    @cities          = City.active.ordered
    @customer_token  = customer_jwt
    @selected_worker = User.workers.includes(worker_profile: :city).find_by(id: params[:worker_id]) if params[:worker_id].present?
    @worker_dates    = BookingAvailabilityService.worker_schedule_for_dates(@selected_worker.id, 7) if @selected_worker
  rescue ActiveRecord::RecordNotFound
    redirect_to public_categories_path, alert: "Category not found"
  end

  # Legacy redirect
  def services
    redirect_to public_categories_path
  end

  # GET /beauticians — Server-Side Rendered
  def beauticians
    @cities         = City.active.ordered
    @workers        = User.search_workers(
      city:  params[:city],
      query: params[:q].presence || params[:search].presence,
      sort:  params[:sort]
    )
    @customer_token = customer_jwt
  end

  def offers
    @coupons = Coupon.valid_now.order(discount_value: :desc)
    @percentage_coupons = @coupons.select { |c| c.discount_type == "percentage" }
    @flat_coupons       = @coupons.select { |c| c.discount_type == "flat" }
  end
  def about; end
  def contact; end
  def privacy; end

  private

  def customer_jwt
    JwtService.encode({ sub: current_user.id, role: current_user.role, name: current_user.name }) if customer_logged_in?
  end
end
