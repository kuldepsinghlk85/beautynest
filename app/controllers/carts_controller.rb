# frozen_string_literal: true

class CartsController < ApplicationController
  layout "public"
  before_action :set_cart
  skip_before_action :verify_authenticity_token, only: %i[add_item], if: -> { request.format.json? }

  # GET /cart — Server-Side Rendered Cart Page
  def show
    @cart_items = @cart.cart_items.includes(:worker, :city, service: :category).order(created_at: :asc)
    @worker = @cart.effective_worker
    @city = @cart.effective_city
    @available_coupons = Coupon.valid_now.limit(6)
  end

  # POST /cart/items — Add Service to Cart with Availability Check
  def add_item
    service_lookup = params[:service_id]
    service = Service.friendly.find_by(id: service_lookup) ||
              Service.friendly.find_by(slug: service_lookup)

    unless service
      return respond_with_error("Service not found.", :not_found)
    end

    worker_id  = params[:worker_id].presence
    city_param = params[:city_id].presence || params[:city].presence
    date_param = params[:date].presence
    time_param = params[:time_slot].presence

    city   = BookingAvailabilityService.resolve_city(city_param) if city_param.present?
    worker = BookingAvailabilityService.resolve_worker(worker_id) if worker_id.present?

    # Infer city from worker if worker provided, else fallback to cart's city or default
    city ||= worker&.worker_profile&.city || BookingAvailabilityService.resolve_city(worker&.serving_city) || @cart.city || City.active.ordered.first

    # 1. Mandatory Date & Time Slot Verification for each added service
    unless date_param.present? && time_param.present?
      return respond_with_error("Please select an appointment date and time slot to verify availability before adding to cart.", :unprocessable_entity)
    end

    parsed_date = (Date.parse(date_param) rescue nil)
    unless parsed_date
      return respond_with_error("Invalid appointment date format. Please select a valid date.", :unprocessable_entity)
    end

    if parsed_date < Date.current
      return respond_with_error("Booking date cannot be in the past.", :unprocessable_entity)
    end

    if parsed_date > Date.current + 14.days
      return respond_with_error("Booking date must be within the next 14 days.", :unprocessable_entity)
    end

    day_name = parsed_date.strftime("%A")

    if worker.present?
      check = BookingAvailabilityService.worker_available?(worker, date_param, time_param, city: city)
      unless check[:available]
        return respond_with_error(check[:error], :unprocessable_entity)
      end
    else
      # Customer did not select a specific specialist — verify city schedule and auto-assign
      eligible_workers = BookingAvailabilityService.eligible_workers(city, date_param, time_param)
      if eligible_workers.empty?
        city_workers = BookingAvailabilityService.workers_for_city(city).includes(:worker_profile).to_a
        if city_workers.empty?
          return respond_with_error("No beauty professionals are currently active in #{city.name}. Please select another serviceable city.", :unprocessable_entity)
        end

        day_workers = city_workers.select { |w| w.worker_profile&.available_on_day?(day_name) }
        if day_workers.empty?
          return respond_with_error("No beauty professionals are scheduled to work in #{city.name} on #{day_name}s. Please choose another day.", :unprocessable_entity)
        end

        return respond_with_error("All beauty professionals in #{city.name} are fully booked on #{parsed_date.strftime('%a, %d %b')} at #{time_param}. Please select another time slot or date.", :unprocessable_entity)
      end

      worker = BookingAvailabilityService.auto_assign_worker(city, date_param, time_param)
    end

    # 2. Store independent appointment schedule & worker on each CartItem
    item = @cart.cart_items.find_or_initialize_by(
      service: service,
      booking_date: parsed_date,
      time_slot: time_param.strip
    )

    add_qty = (params[:quantity].presence || 1).to_i
    add_qty = 1 if add_qty < 1
    item.quantity = item.persisted? ? (item.quantity + add_qty) : add_qty

    slot_info = BookingAvailabilityService::STANDARD_TIME_SLOTS.find { |s| s[:slot].casecmp?(time_param.strip) }
    time_str = slot_info ? slot_info[:time] : "10:30"
    item.scheduled_at = (Time.zone.parse("#{date_param} #{time_str}:00") rescue nil)
    item.worker = worker if worker.present?
    item.city   = city if city.present?

    if item.save
      # Update cart-level primary defaults to match the latest verified booking
      @cart.update(
        worker_id: worker&.id,
        city_id: city&.id,
        booking_date: parsed_date,
        time_slot: time_param.strip
      )

      respond_to do |format|
        format.html do
          flash[:notice] = "#{service.name} added to your cart!"
          redirect_to cart_path
        end
        format.json do
          render json: {
            success: true,
            message: "#{service.name} verified and added to cart!",
            item_count: @cart.item_count,
            cart: @cart.as_json_api
          }, status: :created
        end
      end
    else
      respond_with_error(item.errors.full_messages.join(", "), :unprocessable_entity)
    end
  end

  # PATCH /cart/items/:id — Update Quantity
  def update_item
    item = @cart.cart_items.find_by(id: params[:id])
    unless item
      flash[:alert] = "Cart item not found."
      return redirect_to cart_path
    end

    qty = params[:quantity].to_i
    if qty <= 0
      item.destroy
      flash[:notice] = "Item removed from cart."
    else
      item.update(quantity: qty)
      flash[:notice] = "Cart updated."
    end

    redirect_to cart_path
  end

  # DELETE /cart/items/:id — Remove Item
  def remove_item
    item = @cart.cart_items.find_by(id: params[:id])
    if item
      service_name = item.service.name
      item.destroy
      flash[:notice] = "#{service_name} removed from your cart."
    end
    redirect_to cart_path
  end

  # DELETE /cart — Clear Cart
  def clear
    @cart.cart_items.destroy_all
    @cart.update(coupon: nil, notes: nil, worker_id: nil, city_id: nil, booking_date: nil, time_slot: nil)
    flash[:notice] = "Your cart has been cleared."
    redirect_to cart_path
  end

  # POST /cart/coupon — Apply Promo Code
  def apply_coupon
    code = params[:code].to_s.strip.upcase
    if code.blank?
      flash[:alert] = "Please enter a coupon code."
      return redirect_to cart_path
    end

    coupon = Coupon.valid_now.where("UPPER(code) = ?", code).first
    if coupon.nil?
      flash[:alert] = "Coupon '#{code}' is invalid or expired."
    elsif !coupon.valid_for?(@cart.subtotal)
      min_spend = coupon.min_order_amount.to_i
      flash[:alert] = "Coupon '#{code}' requires a minimum order of ₹#{min_spend}. Your subtotal is ₹#{@cart.subtotal.to_i}."
    else
      @cart.update(coupon: coupon)
      flash[:notice] = "Coupon '#{coupon.code}' applied successfully! You saved #{coupon.display_discount}."
    end

    redirect_to cart_path
  end

  # DELETE /cart/coupon — Remove Promo Code
  def remove_coupon
    @cart.update(coupon: nil)
    flash[:notice] = "Coupon removed."
    redirect_to cart_path
  end

  private

  def set_cart
    @cart = current_cart
  end

  def respond_with_error(message, status)
    respond_to do |format|
      format.html do
        flash[:alert] = message
        redirect_back fallback_location: public_categories_path
      end
      format.json do
        render json: { success: false, error: message }, status: status
      end
    end
  end
end
