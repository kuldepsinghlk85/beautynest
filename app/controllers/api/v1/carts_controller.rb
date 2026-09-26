# frozen_string_literal: true

module Api
  module V1
    class CartsController < BaseController
      before_action :require_customer!

      # GET /api/v1/cart
      def show
        cart = current_api_user.active_cart
        render_success(cart.as_json_api, "Cart retrieved successfully.")
      end

      # POST /api/v1/cart/checkout
      def checkout
        cart = current_api_user.active_cart

        if cart.cart_items.empty?
          return render_unprocessable(["Cart is empty. Please add items before checking out."])
        end

        address = if checkout_params[:address_id].present?
                    current_api_user.addresses.find_by(id: checkout_params[:address_id])
                  else
                    current_api_user.default_address
                  end

        city_param = checkout_params[:city_id].presence || checkout_params[:city].presence || address&.city_id || address&.city
        city = if city_param.blank? && (checkout_params[:worker_id].present? || checkout_params[:therapist_id].present?)
                 w = BookingAvailabilityService.resolve_worker(checkout_params[:worker_id] || checkout_params[:therapist_id])
                 w&.worker_profile&.city || BookingAvailabilityService.resolve_city(w&.serving_city)
               else
                 BookingAvailabilityService.resolve_city(city_param)
               end

        unless city
          return render_unprocessable([
            "Please provide a valid serviceable city. You can view currently served cities via GET /api/v1/booking_flow/locations."
          ])
        end

        unless city.active?
          return render_unprocessable([
            "City '#{city.name}' is currently not serviceable. You can view currently served cities via GET /api/v1/booking_flow/locations."
          ])
        end

        # Resolve scheduled date & time slot
        date_str = checkout_params[:date].presence
        time_slot = checkout_params[:time_slot].presence || "10:30 AM"

        earliest_scheduled = cart.cart_items.map(&:scheduled_at).compact.min
        if checkout_params[:scheduled_at].present?
          scheduled_time = (Time.zone.parse(checkout_params[:scheduled_at].to_s) rescue nil)
        elsif date_str.present?
          slot_info = BookingAvailabilityService::STANDARD_TIME_SLOTS.find { |s| s[:slot].casecmp?(time_slot.strip) }
          time_str = slot_info ? slot_info[:time] : (Time.zone.parse(time_slot).strftime("%H:%M") rescue "10:30")
          scheduled_time = (Time.zone.parse("#{date_str} #{time_str}:00") rescue nil)
        elsif earliest_scheduled.present?
          scheduled_time = earliest_scheduled
        else
          scheduled_time = 1.day.from_now.change(hour: 10, min: 30)
        end

        scheduled_time ||= 1.day.from_now.change(hour: 10, min: 30)
        date_val = scheduled_time.to_date
        time_slot ||= scheduled_time.strftime("%I:%M %p")
        day_name = scheduled_time.strftime("%A")

        # Worker Availability Check
        city_workers = BookingAvailabilityService.workers_for_city(city).includes(:worker_profile).to_a
        scheduled_workers = city_workers.select { |w| w.worker_profile&.available_on_day?(day_name) }

        if scheduled_workers.empty?
          return render_unprocessable([
            "No beauty professional is available in #{city.name} on #{day_name}. Please choose another day or city."
          ])
        end

        assigned_worker = nil
        if checkout_params[:worker_id].present? || checkout_params[:therapist_id].present?
          req_id = checkout_params[:worker_id] || checkout_params[:therapist_id]
          req_worker = BookingAvailabilityService.resolve_worker(req_id)
          if req_worker.nil?
            return render_unprocessable(["Requested beauty professional not found."])
          end

          avail_check = BookingAvailabilityService.worker_available?(req_worker, date_val, time_slot)
          unless avail_check[:available]
            return render_unprocessable([avail_check[:error]])
          end

          assigned_worker = req_worker
        else
          assigned_worker = BookingAvailabilityService.auto_assign_worker(city, date_val, time_slot)
        end

        if assigned_worker.nil?
          return render_unprocessable([
            "All beauty professionals in #{city.name} are fully booked on #{day_name} at #{time_slot}. Please select another time slot."
          ])
        end

        payment_method = (checkout_params[:payment_method].presence || "cod").to_s.downcase

        booking = nil
        payment = nil

        ActiveRecord::Base.transaction do
          booking = current_api_user.customer_bookings.build(
            city: city,
            address: address,
            worker: assigned_worker,
            status: "pending",
            booking_status: "pending",
            service_status: "pending",
            scheduled_at: scheduled_time,
            time_slot: time_slot,
            notes: checkout_params[:notes]
          )

          cart.cart_items.includes(:service).each do |cart_item|
            booking_item = booking.booking_items.build(
              service: cart_item.service,
              quantity: cart_item.quantity
            )
            booking_item.snapshot_service
            booking_item.price_snapshot = cart_item.service.effective_price_for_city(city).to_f if cart_item.service
          end

          booking.subtotal_amount = booking.booking_items.sum(&:line_total)
          discount = 0.0
          if checkout_params[:coupon_code].present?
            coupon = Coupon.find_by("LOWER(code) = ?", checkout_params[:coupon_code].to_s.strip.downcase)
            if coupon&.valid_for?(booking.subtotal_amount)
              coupon.lock!
              discount = coupon.apply_to(booking.subtotal_amount)
              coupon.increment!(:usage_count)
              booking.coupon = coupon
            end
          end
          booking.discount_amount = discount
          booking.total_amount = [booking.subtotal_amount - discount, 0.0].max
          booking.save!

          payment_status = payment_method == "cod" ? "pending" : "completed"
          payment = booking.payments.create!(
            amount: booking.total_amount,
            method: payment_method,
            status: payment_status,
            transaction_ref: "TXN_#{SecureRandom.hex(6).upcase}",
            paid_at: (payment_status == "completed" ? Time.current : nil)
          )

          cart.cart_items.destroy_all
        end

        booking_data = booking_json(booking, payment)
        response_payload = {
          id: booking.id,
          booking: booking_data,
          bookings: [booking_data],
          payment: {
            id: payment.id,
            amount: payment.amount.to_f,
            method: payment.method,
            status: payment.status
          }
        }

        render_success(response_payload, "Checkout completed successfully via #{payment_method.upcase}.", :created)
      rescue ActiveRecord::RecordInvalid => e
        render_unprocessable(e.record.errors.full_messages)
      end

      private

      def checkout_params
        params.permit(:address_id, :city_id, :city, :date, :time_slot, :scheduled_at, :payment_method, :notes, :worker_id, :therapist_id, :coupon_code)
      end

      def booking_json(booking, payment = nil)
        payment ||= booking.payments.order(created_at: :desc).first
        {
          id: booking.id,
          booking_number: booking.display_id,
          service_name: booking.display_service,
          booking_status: booking.booking_status,
          service_status: booking.service_status,
          status: booking.booking_status,
          scheduled_at: booking.scheduled_at,
          time_slot: booking.display_time_slot,
          city: booking.city ? { id: booking.city.id, name: booking.city.name, slug: booking.city.slug } : nil,
          total_amount: booking.total_amount.to_f,
          display_amount: booking.display_amount,
          display_date: booking.display_date,
          display_time: booking.display_time,
          notes: booking.notes,
          worker: booking.worker ? {
            id: booking.worker.id,
            name: booking.worker.name,
            phone: booking.worker.phone,
            rating: (booking.worker.worker_profile&.rating_avg || 5.0).to_f
          } : nil,
          payment: payment ? {
            id: payment.id,
            method: payment.method,
            status: payment.status,
            amount: payment.amount.to_f
          } : nil,
          created_at: booking.created_at
        }
      end
    end
  end
end
