# frozen_string_literal: true

class CheckoutsController < ApplicationController
  layout "public"
  before_action :set_cart
  before_action :require_customer_login, only: %i[new create]
  before_action :ensure_cart_not_empty, only: %i[new create]

  # GET /checkout — Server-Side Rendered Checkout Page
  def new
    @cart_items = @cart.cart_items.includes(:worker, :city, service: :category).order(created_at: :asc)
    @worker = @cart.effective_worker
    @city = @cart.effective_city
    @cities = City.active.ordered
    @addresses = current_customer ? current_customer.addresses.default_first : []
    @payment_options = BookingAvailabilityService::PAYMENT_OPTIONS

    # Ensure every cart item has an assigned, available worker in its designated city and time slot
    @cart_items.each do |ci|
      item_city = ci.city || @city || City.active.ordered.first
      item_date = ci.effective_date || @cart.effective_booking_date || 1.day.from_now.to_date
      item_slot = ci.time_slot.presence || @cart.effective_time_slot.presence || "10:30 AM"

      if ci.worker.blank? || !BookingAvailabilityService.worker_available?(ci.worker, item_date.to_s, item_slot, city: item_city)[:available]
        reassigned_worker = BookingAvailabilityService.auto_assign_worker(item_city, item_date.to_s, item_slot)
        if reassigned_worker
          ci.update(worker: reassigned_worker, city: item_city)
        end
      end
    end

    @worker = @cart.effective_worker
    @city = @cart.effective_city
  end

  # POST /checkout — Complete Booking
  def create
    ActiveRecord::Base.transaction do
      # 1. Resolve Customer (authenticated customer)
      customer = current_customer
      unless customer
        flash[:alert] = "Please sign in or create an account to proceed with your booking."
        return redirect_to login_path
      end

      # 2. Resolve Address
      address = if params[:address_id].present?
                  customer.addresses.find_by(id: params[:address_id])
                else
                  line1 = params[:line1].to_s.strip
                  city_name = params[:city].presence || @cart.display_city_name
                  if line1.blank?
                    flash[:alert] = "Please enter your street / doorstep address."
                    return redirect_to new_checkout_path
                  end

                  customer.addresses.create!(
                    label: params[:label].presence || "Home",
                    line1: line1,
                    line2: params[:line2].presence,
                    city: city_name,
                    state: params[:state].presence || "Delhi",
                    pincode: params[:pincode].presence || "110001",
                    is_default: true
                  )
                end

      unless address
        flash[:alert] = "Please provide a valid delivery address."
        return redirect_to new_checkout_path
      end

      # 3. Resolve Worker, City & Schedule
      first_item = @cart.primary_item || @cart.cart_items.first
      city = first_item&.city || @cart.effective_city || address.city_record || BookingAvailabilityService.resolve_city(address.city) || City.active.ordered.first
      date_val  = first_item&.effective_date || @cart.effective_booking_date || 1.day.from_now.to_date
      time_slot = first_item&.time_slot.presence || @cart.effective_time_slot.presence || "10:30 AM"

      # Strictly verify and assign worker for each scheduled item in cart
      @cart.cart_items.each do |ci|
        c = ci.city.presence || city
        d = ci.effective_date || date_val
        s = ci.time_slot.presence || time_slot
        w = ci.worker

        # If worker is missing or unavailable, attempt auto-assignment in that city for that slot
        if w.nil? || !BookingAvailabilityService.worker_available?(w, d.to_s, s, city: c)[:available]
          w = BookingAvailabilityService.auto_assign_worker(c, d.to_s, s)
          if w.nil?
            check = BookingAvailabilityService.worker_available?(ci.worker, d.to_s, s, city: c) if ci.worker
            err = check ? check[:error] : "No beauty professional is available in #{c.name} on #{d.to_date.strftime('%a, %d %b')} at #{s}. Please select another time slot."
            flash[:alert] = "#{ci.service.name}: #{err}"
            return redirect_to cart_path
          end
          ci.update!(worker: w, city: c)
        end
      end

      # Reload verified primary worker and city
      first_item = @cart.primary_item || @cart.cart_items.first
      worker = first_item&.worker || @cart.effective_worker
      city   = first_item&.city || @cart.effective_city || city

      slot_info = BookingAvailabilityService::STANDARD_TIME_SLOTS.find { |s| s[:slot].casecmp?(time_slot.strip) }
      time_str = slot_info ? slot_info[:time] : "10:30"
      scheduled_at = (Time.zone.parse("#{date_val} #{time_str}:00") rescue 1.day.from_now.change(hour: 10, min: 30))

      # 4. Totals and Coupon
      subtotal = @cart.subtotal
      coupon = @cart.coupon
      discount = @cart.discount_amount
      total = @cart.grand_total

      # 5. Build Primary Booking Record
      booking = Booking.new(
        customer: customer,
        worker: worker,
        city: city,
        address: address,
        coupon: coupon,
        status: "pending",
        booking_status: "pending",
        service_status: "pending",
        scheduled_at: scheduled_at,
        date: date_val.to_s,
        time_slot: time_slot,
        subtotal_amount: subtotal,
        discount_amount: discount,
        total_amount: total,
        payment_method: params[:payment_method].presence || "cod",
        notes: params[:notes].presence || @cart.notes
      )

      # Booking reference code
      b_num = "BN-#{Time.current.strftime('%y%m%d')}-#{SecureRandom.hex(3).upcase}"
      booking.booking_number = b_num if booking.respond_to?(:booking_number=)

      booking.save!

      # 6. Create Booking Items with independent schedules
      @cart.cart_items.each do |ci|
        item_worker = ci.worker.presence || worker
        item_city   = ci.city.presence || city
        item_date   = ci.effective_date || date_val
        item_slot   = ci.time_slot.presence || time_slot
        item_sched  = ci.scheduled_at.presence || scheduled_at

        booking.booking_items.create!(
          service: ci.service,
          quantity: ci.quantity,
          price_snapshot: ci.unit_price,
          service_name_snapshot: ci.service.name,
          duration_minutes_snapshot: ci.service.duration_minutes,
          scheduled_at: item_sched,
          booking_date: item_date,
          time_slot: item_slot,
          worker: item_worker,
          city: item_city
        )
      end

      # 7. Create Payment Record
      pm_val = (params[:payment_method].presence || "cod").to_s.downcase
      pm_val = "cod" unless Payment::METHODS.include?(pm_val)
      booking.payments.create!(
        amount: total,
        method: pm_val,
        status: "pending"
      )

      # 8. Increment Coupon Usage
      coupon.increment!(:usage_count) if coupon

      # 9. Clear Cart and reset schedule state
      @cart.cart_items.destroy_all
      @cart.update(coupon: nil, notes: nil, worker_id: nil, city_id: nil, booking_date: nil, time_slot: nil)

      redirect_to success_checkout_path(booking.id)
    end
  rescue ActiveRecord::RecordInvalid => e
    flash[:alert] = "Booking could not be created: #{e.message}"
    redirect_to new_checkout_path
  end

  # GET /checkout/success/:id — Server-Side Rendered Booking Confirmation
  def success
    @booking = Booking.includes(:worker, :address, :city, booking_items: :service).find_by(id: params[:id])
    unless @booking
      flash[:alert] = "Booking not found."
      return redirect_to root_path
    end
  end

  private

  def set_cart
    @cart = current_cart
  end

  def ensure_cart_not_empty
    if @cart.empty?
      flash[:alert] = "Your cart is currently empty. Please add services before checkout."
      redirect_to cart_path
    end
  end
end
