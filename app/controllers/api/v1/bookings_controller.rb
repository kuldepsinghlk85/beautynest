# frozen_string_literal: true

module Api
  module V1
    # Customer-facing bookings: list, show, create, cancel.
    # All lookups are scoped through current_api_user to prevent IDOR.
    class BookingsController < BaseController
      before_action :require_customer!
      before_action :set_booking, only: %i[show cancel review cost_summary]

      # GET /api/v1/bookings
      def index
        bookings = current_api_user.customer_bookings
                                   .includes(:worker, :booking_items)
                                   .order(created_at: :desc)
        render_success(bookings.map { |b| booking_json(b) }, "Bookings retrieved successfully.")
      end

      # GET /api/v1/bookings/:id
      def show
        render_success(booking_json(@booking), "Booking details retrieved successfully.")
      end

      # GET /api/v1/bookings/:id/cost_summary
      # Full cost breakdown: original + approved extra charges = final total
      def cost_summary
        approved_extras     = @booking.booking_extra_charges.approved
        extra_charges_gross = approved_extras.sum(&:line_total).to_f.round(2)
        original_gross      = @booking.subtotal_amount.to_f.round(2)
        total_gross         = (original_gross + extra_charges_gross).round(2)
        total_discount      = @booking.discount_amount.to_f.round(2)
        final_total         = @booking.total_amount.to_f.round(2)

        orig_disc = (@booking.coupon ? @booking.coupon.apply_to(original_gross) : 0.0).to_f.round(2)
        orig_net  = (original_gross - orig_disc).to_f.round(2)

        extras_disc = (total_discount - orig_disc).clamp(0.0, Float::INFINITY).to_f.round(2)
        extras_net  = (extra_charges_gross - extras_disc).to_f.round(2)

        render_success({
          booking_id:                @booking.id,
          booking_number:            @booking.display_id,
          service_name:              @booking.display_service,
          original_amount:           original_gross,
          original_discount:         orig_disc,
          original_net_amount:       orig_net,
          extra_charges_total:       extra_charges_gross,
          extra_charges_discount:    extras_disc,
          extra_charges_net_total:   extras_net,
          subtotal_amount:           original_gross,
          gross_amount:              total_gross,
          total_gross_amount:        total_gross,
          discount_amount:           total_discount,
          final_total:               final_total,
          total_amount:              final_total,
          display_amount:            @booking.display_amount,
          coupon_code:               @booking.coupon&.code,
          coupon_discount_text:      @booking.coupon&.display_discount,
          extra_charges:             approved_extras.map { |c|
            item_disc = (@booking.coupon ? @booking.coupon.apply_to_extra(c.line_total.to_f) : 0.0).to_f.round(2)
            item_net  = (c.line_total.to_f - item_disc).to_f.round(2)
            {
              id:              c.id,
              charge_type:     c.charge_type,
              description:     c.description,
              amount:          c.amount.to_f,
              quantity:        c.quantity,
              line_total:      c.line_total.to_f,
              discount_amount: item_disc,
              net_total:       item_net
            }
          }
        }, "Cost summary retrieved.")
      end

      # POST /api/v1/bookings
      def create
        p = booking_params

        # 0. Consent Form Agreement Check
        if Setting.consent_form_required? || p.key?(:consent_accepted) || p.key?(:terms_accepted)
          consent_given = ActiveRecord::Type::Boolean.new.cast(p[:consent_accepted]) ||
                          ActiveRecord::Type::Boolean.new.cast(p[:terms_accepted])
          unless consent_given
            return render_unprocessable([
              "You must review and agree to the service consent form before completing this booking."
            ])
          end
        end

        # 1. Resolve & Validate City
        city = nil
        if p[:city_id].blank? && p[:city].blank?
          if p[:worker_id].present? || p[:therapist_id].present?
            worker = BookingAvailabilityService.resolve_worker(p[:worker_id] || p[:therapist_id])
            city = worker&.worker_profile&.city || BookingAvailabilityService.resolve_city(worker&.serving_city)
          end
          unless city
            return render_unprocessable([
              "Please provide a valid serviceable city (city_id). You can view the list of currently serving cities via GET /api/v1/booking_flow/locations."
            ])
          end
        else
          city = BookingAvailabilityService.resolve_city(p[:city_id].presence || p[:city].presence)
          unless city
            return render_unprocessable([
              "Please provide a valid serviceable city (city_id). You can view the list of currently serving cities via GET /api/v1/booking_flow/locations."
            ])
          end
        end

        unless city.active?
          return render_unprocessable([
            "City '#{city.name}' is currently not serviceable. You can view the list of currently serving cities via GET /api/v1/booking_flow/locations."
          ])
        end

        # 2. Resolve & Validate Service(s)
        items_to_create = []

        if p[:service_id].present?
          service = Service.friendly.find_by(id: p[:service_id]) || Service.friendly.find_by(slug: p[:service_id])
          if service.nil?
            return render_unprocessable(["Service not found. Please provide a valid service_id."])
          end
          unless service.active?
            return render_unprocessable(["Service '#{service.name}' is currently unavailable."])
          end
          items_to_create << { service: service, quantity: 1 }
        elsif p[:items].present? && p[:items].is_a?(Array)
          if p[:items].empty?
            return render_unprocessable(["Items cannot be empty. Please provide at least one valid service."])
          end
          p[:items].each do |item_data|
            s_id = item_data[:service_id]
            if s_id.blank?
              return render_unprocessable(["Each item must include a valid service_id."])
            end
            service = Service.friendly.find_by(id: s_id) || Service.friendly.find_by(slug: s_id)
            if service.nil?
              return render_unprocessable(["Service '#{s_id}' not found. Please provide a valid service_id."])
            end
            unless service.active?
              return render_unprocessable(["Service '#{service.name}' is currently unavailable."])
            end
            qty = [item_data[:quantity].to_i, 1].max
            items_to_create << { service: service, quantity: qty }
          end
        elsif p[:service_name].present?
          service = Service.find_by("name ILIKE ?", p[:service_name].to_s.strip)
          if service.nil?
            return render_unprocessable(["Service '#{p[:service_name]}' not found. Please provide a valid service_id."])
          end
          unless service.active?
            return render_unprocessable(["Service '#{service.name}' is currently unavailable."])
          end
          items_to_create << { service: service, quantity: 1 }
        else
          return render_unprocessable(["service_id is required. Please provide a valid service_id."])
        end

        # 3. Resolve & Validate Scheduled Date & Time Slot
        scheduled_time = nil
        date_val = nil
        time_slot = nil

        if p[:date].present?
          date_val = (Date.parse(p[:date].to_s) rescue nil)
          if date_val.nil?
            return render_unprocessable(["Invalid date format for 'date'. Please use YYYY-MM-DD."])
          end
          time_slot = p[:time_slot].presence
          if time_slot.blank?
            return render_unprocessable(["time_slot is required when date is provided."])
          end
          slot_info = BookingAvailabilityService::STANDARD_TIME_SLOTS.find { |s| s[:slot].casecmp?(time_slot.strip) }
          time_str = slot_info ? slot_info[:time] : (Time.zone.parse(time_slot).strftime("%H:%M") rescue nil)
          if time_str.nil?
            return render_unprocessable(["Invalid time slot '#{time_slot}'. Please choose a valid standard time slot."])
          end
          scheduled_time = (Time.zone.parse("#{date_val.strftime('%Y-%m-%d')} #{time_str}:00") rescue nil)
        elsif p[:scheduled_at].present?
          scheduled_time = (Time.zone.parse(p[:scheduled_at].to_s) rescue nil)
          date_val = scheduled_time&.to_date
          time_slot = p[:time_slot].presence || scheduled_time&.strftime("%I:%M %p")
        else
          return render_unprocessable(["date and time_slot are required to schedule a booking."])
        end

        if scheduled_time.nil? || date_val.nil?
          return render_unprocessable(["Please provide a valid scheduled date and time slot."])
        end

        if scheduled_time < Time.current
          return render_unprocessable(["Scheduled time cannot be in the past. Please select a future date and time."])
        end

        if date_val > Date.current + 7
          return render_unprocessable(["Booking date must be within the next 7 days."])
        end

        # 4. Resolve & Validate Address
        address = if p[:address_id].present?
                    current_api_user.addresses.find_by(id: p[:address_id])
                  elsif p[:street].present? || p[:address].present?
                    addr_str = p[:street].presence || p[:address].presence
                    current_api_user.addresses.create!(
                      line1: addr_str,
                      city: city.name,
                      city_id: city.id,
                      pincode: p[:postal_code].presence || "110001",
                      is_default: current_api_user.addresses.empty?
                    )
                  else
                    current_api_user.default_address || current_api_user.addresses.first
                  end

        if p[:address_id].present? && address.nil?
          return render_unprocessable(["Address not found or does not belong to your account. Please provide a valid address_id."])
        end

        if address.nil?
          return render_unprocessable(["Please provide a delivery address (address or address_id)."])
        end

        # 5. Validate Payment Method
        payment_method = (p[:payment_method].presence || "cod").to_s.strip.downcase
        supported_methods = BookingAvailabilityService::PAYMENT_OPTIONS.map { |o| o[:id] }
        unless supported_methods.include?(payment_method)
          return render_unprocessable([
            "Invalid payment_method '#{p[:payment_method]}'. Supported methods: #{supported_methods.join(', ')}."
          ])
        end

        # 6. Check Worker Availability and Assign
        assigned_worker = nil
        if p[:worker_id].present? || p[:therapist_id].present?
          req_id = p[:worker_id] || p[:therapist_id]
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
          day_name = scheduled_time.strftime("%A")
          city_workers = BookingAvailabilityService.workers_for_city(city).includes(:worker_profile).to_a
          scheduled_workers = city_workers.select { |w| w.worker_profile&.available_on_day?(day_name) }

          if scheduled_workers.empty?
            return render_unprocessable([
              "No beauty professional is available in #{city.name} on #{day_name}. Please choose another day or city."
            ])
          end

          assigned_worker = BookingAvailabilityService.auto_assign_worker(city, date_val, time_slot)
        end

        if assigned_worker.nil?
          day_label = scheduled_time ? scheduled_time.strftime("%A") : "this day"
          return render_unprocessable([
            "All beauty professionals in #{city.name} are fully booked on #{day_label} at #{time_slot}. Please select another time slot."
          ])
        end

        # 7. Validate Coupon (if provided) before database transaction
        coupon = nil
        if p[:coupon_code].present?
          coupon = Coupon.find_by("LOWER(code) = ?", p[:coupon_code].to_s.strip.downcase)
          unless coupon
            return render_unprocessable(["Coupon code '#{p[:coupon_code]}' is invalid."])
          end
          unless coupon.status == "active"
            return render_unprocessable(["Coupon '#{coupon.code}' is inactive."])
          end
          if coupon.valid_from.present? && Time.current < coupon.valid_from
            return render_unprocessable(["Coupon '#{coupon.code}' is not valid yet."])
          end
          if coupon.valid_until.present? && Time.current > coupon.valid_until
            return render_unprocessable(["Coupon '#{coupon.code}' has expired on #{coupon.display_valid_until}."])
          end
          if coupon.usage_limit.present? && coupon.usage_count >= coupon.usage_limit
            return render_unprocessable(["Coupon '#{coupon.code}' has reached its maximum usage limit."])
          end
        end

        # 7b. Worker Tier & Product Sourcing Calculations
        worker_tier = assigned_worker&.worker_profile&.worker_tier
        product_source = p[:product_source].present? ? p[:product_source].to_s.strip.downcase : "customer"
        product_source = "customer" unless %w[platform customer].include?(product_source)

        platform_product_fee = if product_source == "platform" && Setting.product_choice_enabled?
                                 Setting.platform_product_fee
                               else
                                 0.0
                               end

        # Helper method for computing item price with tier
        compute_item_price = lambda do |service|
          base_price = service.effective_price_for_city(city).to_f
          tier_override = ServiceTierPrice.find_by(service: service, worker_tier: worker_tier) if worker_tier
          if tier_override
            tier_override.price.to_f
          elsif worker_tier && worker_tier.price_multiplier.to_f > 0
            (base_price * worker_tier.price_multiplier.to_f).round(2)
          else
            base_price
          end
        end

        # Pre-compute subtotal (with worker tier and platform product fee) to validate coupon min_order_amount
        preliminary_items_total = items_to_create.sum do |it|
          compute_item_price.call(it[:service]) * it[:quantity]
        end
        preliminary_subtotal = (preliminary_items_total + platform_product_fee).round(2)

        if coupon && preliminary_subtotal < coupon.min_order_amount.to_f
          return render_unprocessable([
            "Minimum booking amount of ₹#{coupon.min_order_amount.to_i} is required to use coupon '#{coupon.code}'."
          ])
        end

        # 8. Build Booking Record & Persist within Transaction
        booking = current_api_user.customer_bookings.build(
          city: city,
          address: address,
          worker: assigned_worker,
          worker_tier: worker_tier,
          scheduled_at: scheduled_time,
          time_slot: time_slot,
          notes: p[:notes],
          booking_status: "completed",
          service_status: "completed"
        )

        # Optional GPS capture
        if p[:customer_latitude].present? && p[:customer_longitude].present?
          booking.customer_latitude = p[:customer_latitude].to_f
          booking.customer_longitude = p[:customer_longitude].to_f
          booking.location_captured_at = Time.current
        end

        payment = nil

        ActiveRecord::Base.transaction do
          # Attach validated items with tier-adjusted pricing
          items_to_create.each do |it|
            service = it[:service]
            item = booking.booking_items.build(
              service: service,
              quantity: it[:quantity]
            )
            item.service_name_snapshot     = service.name
            item.price_snapshot            = compute_item_price.call(service)
            item.duration_minutes_snapshot = service.duration_minutes
          end

          # Snapshot platform product fee if platform products were chosen
          if platform_product_fee > 0
            booking.booking_products.build(
              product_name_snapshot: "Platform Sanitized Professional Kit",
              price_snapshot: platform_product_fee,
              quantity: 1
            )
          end

          # Attach service consent record
          booking.build_service_consent(
            product_source: product_source,
            terms_accepted: true,
            terms_version: Setting.consent_form_version,
            consented_at: Time.current,
            recorded_by_worker: assigned_worker
          )

          # Set amounts and coupon atomically
          items_sum = booking.booking_items.sum(&:line_total)
          booking.subtotal_amount = (items_sum + platform_product_fee).round(2)
          discount = 0.0
          if coupon
            coupon.lock!
            discount = coupon.apply_to(booking.subtotal_amount)
            coupon.increment!(:usage_count)
            booking.coupon = coupon
          end
          booking.discount_amount = discount
          booking.total_amount = [booking.subtotal_amount - discount, 0.0].max

          booking.save!

          # Payment Record
          payment_status = payment_method == "cod" ? "pending" : "completed"

          payment = booking.payments.create!(
            amount: booking.total_amount,
            method: payment_method,
            status: payment_status,
            transaction_ref: "TXN_#{SecureRandom.hex(6).upcase}",
            paid_at: (payment_status == "completed" ? Time.current : nil)
          )

          # In-app Notifications
          Notification.create!(
            user:           current_api_user,
            subject:        "Booking Confirmed! (##{booking.display_id})",
            body:           "Your beauty service is scheduled for #{booking.display_date} at #{booking.display_time_slot} in #{city.name}. Worker: #{assigned_worker.name}.",
            channel:        "push",
            status:         "sent",
            recipient_type: "customer",
            sent_at:        Time.current
          ) rescue nil

          Notification.create!(
            user:           assigned_worker,
            subject:        "New Job Assigned! (##{booking.display_id})",
            body:           "You have a new appointment in #{city.name} on #{booking.display_date} at #{booking.display_time_slot}. Customer: #{current_api_user.name}.",
            channel:        "push",
            status:         "sent",
            recipient_type: "worker",
            sent_at:        Time.current
          ) rescue nil
        end

        b_data = booking_json(booking, payment)
        render_success(b_data.merge(booking: b_data), "Booking created successfully.", :created)
      rescue ActiveRecord::RecordInvalid => e
        render_unprocessable(e.record ? e.record.errors.full_messages : [e.message])
      end

      # PATCH /api/v1/bookings/:id/cancel
      def cancel
        unless %w[pending confirmed].include?(@booking.status)
          return render_unprocessable(["Booking cannot be cancelled in '#{@booking.status}' status."])
        end

        @booking.update!(status: "cancelled")
        render_success(booking_json(@booking), "Booking cancelled successfully.")
      end

      # POST /api/v1/bookings/:id/review
      def review
        # 1. Check service status: must be completed
        unless @booking.completed?
          return render_unprocessable(
            ["Reviews can only be submitted once the service status is completed. Current service status: '#{@booking.service_status}'."]
          )
        end

        # 2. Check if already reviewed (reviews can only be given once)
        if @booking.reviewed? || Review.where(booking_id: @booking.id).exists?
          return render_unprocessable(
            ["Review has already been submitted for this booking. Only one review per booking is permitted."]
          )
        end

        # 3. Rating validation
        rating_val = (review_params[:rating].presence || params[:rating]).to_i
        if rating_val < 1 || rating_val > 5
          return render_unprocessable(["Rating must be an integer between 1 and 5."])
        end

        comment_val = (review_params[:comment].presence || params[:comment]).to_s.strip

        # 4. Build single booking review
        review = @booking.build_review(
          customer_id: current_api_user.id,
          worker:      @booking.worker,
          service_id:  nil,
          rating:      rating_val,
          comment:     comment_val
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

      def set_booking
        # Allow lookup by UUID or 6-digit booking_number
        @booking = current_api_user.customer_bookings.find_by(id: params[:id]) ||
                   current_api_user.customer_bookings.find_by(booking_number: params[:id])
        return if @booking

        # Check if booking exists under another user to return 403 Forbidden with clear error
        other_booking = Booking.find_by(id: params[:id]) || Booking.find_by(booking_number: params[:id])
        if other_booking
          render_forbidden("You are not authorized to access or review this booking as it belongs to another customer.")
        else
          render_not_found("Booking not found.")
        end
      end

      def review_params
        params.require(:review).permit(:rating, :comment)
      rescue ActionController::ParameterMissing
        params.permit(:rating, :comment)
      end

      def booking_params
        params.require(:booking).permit(
          :service_name, :service_id, :scheduled_at, :date, :time_slot, :total_amount,
          :notes, :address_id, :address, :street, :postal_code, :city_id, :city, :payment_method, :worker_id, :therapist_id,
          :coupon_code,
          :consent_accepted, :terms_accepted,
          :product_source,
          :customer_latitude, :customer_longitude,
          items: %i[service_id quantity]
        )
      rescue ActionController::ParameterMissing
        params.permit(
          :service_name, :service_id, :scheduled_at, :date, :time_slot, :total_amount,
          :notes, :address_id, :address, :street, :postal_code, :city_id, :city, :payment_method, :worker_id, :therapist_id,
          :coupon_code,
          :consent_accepted, :terms_accepted,
          :product_source,
          :customer_latitude, :customer_longitude,
          items: %i[service_id quantity]
        )
      end

      def booking_json(booking, payment = nil)
        payment ||= booking.payments.order(created_at: :desc).first
        tier = booking.worker_tier || booking.worker&.worker_profile&.worker_tier
        {
          id: booking.id,
          booking_number: booking.display_id,
          service_name: booking.display_service,
          booking_status: booking.booking_status,
          service_status: booking.service_status,
          status: booking.booking_status,
          scheduled_at: booking.scheduled_at,
          date: booking.display_date,
          time_slot: booking.display_time_slot,
          city: booking.city ? { id: booking.city.id, name: booking.city.name, slug: booking.city.slug } : nil,
          address: booking.address ? {
            id: booking.address.id,
            label: booking.address.label,
            line1: booking.address.line1,
            line2: booking.address.line2,
            city: booking.address.city,
            state: booking.address.state,
            pincode: booking.address.pincode,
            full_address: booking.address.full_address
          } : nil,
          items: booking.booking_items.map do |item|
            {
              id: item.id,
              service_id: item.service_id,
              service_name: item.service_name_snapshot,
              price: item.price_snapshot.to_f,
              quantity: item.quantity,
              line_total: item.line_total.to_f
            }
          end,
          subtotal_amount: booking.subtotal_amount.to_f,
          discount_amount: booking.discount_amount.to_f,
          total_amount: booking.total_amount.to_f,
          display_amount: booking.display_amount,
          display_date: booking.display_date,
          display_time: booking.display_time,
          coupon_code: booking.coupon&.code,
          notes: booking.notes,
          worker: booking.worker ? {
            id: booking.worker.id,
            name: booking.worker.name,
            phone: booking.worker.phone,
            rating: (booking.worker.worker_profile&.rating_avg || 5.0).to_f
          } : nil,
          worker_tier: tier ? {
            id: tier.id,
            name: tier.name,
            slug: tier.slug,
            price_multiplier: tier.price_multiplier.to_f
          } : nil,
          product_source: booking.service_consent&.product_source || "platform",
          platform_product_fee: booking.booking_products.sum { |bp| bp.price_snapshot.to_f * bp.quantity }.round(2),
          consent: booking.service_consent ? {
            id: booking.service_consent.id,
            product_source: booking.service_consent.product_source,
            terms_accepted: booking.service_consent.terms_accepted,
            terms_version: booking.service_consent.terms_version,
            consented_at: booking.service_consent.consented_at
          } : nil,
          customer_latitude: booking.customer_latitude&.to_f,
          customer_longitude: booking.customer_longitude&.to_f,
          payment: payment ? {
            id: payment.id,
            method: payment.method,
            status: payment.status,
            amount: payment.amount.to_f,
            transaction_ref: payment.transaction_ref
          } : nil,
          extra_charges: booking.booking_extra_charges.approved.map { |c|
            item_disc = booking.coupon ? booking.coupon.apply_to_extra(c.line_total.to_f).round(2) : 0.0
            item_net  = (c.line_total.to_f - item_disc).round(2)
            {
              id:              c.id,
              charge_type:     c.charge_type,
              description:     c.description,
              amount:          c.amount.to_f,
              quantity:        c.quantity,
              line_total:      c.line_total.to_f,
              discount_amount: item_disc,
              net_total:       item_net
            }
          },
          created_at: booking.created_at
        }
      end

      def review_json(r)
        {
          id: r.id,
          booking_id: r.booking_id,
          booking_number: r.booking&.booking_number,
          customer_id: r.customer_id,
          customer_name: r.customer_name,
          worker_id: r.worker_id,
          worker_name: r.worker_name,
          service_name: r.service_name,
          rating: r.rating,
          comment: r.comment,
          created_at: r.created_at
        }
      end
    end
  end
end
