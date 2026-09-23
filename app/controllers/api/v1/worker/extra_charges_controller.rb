# frozen_string_literal: true

module Api
  module V1
    module Worker
      # POST   /api/v1/worker/bookings/:booking_id/extra_charges
      # GET    /api/v1/worker/bookings/:booking_id/extra_charges
      class ExtraChargesController < BaseController
        before_action :require_worker!
        before_action :set_booking

        # GET /api/v1/worker/bookings/:booking_id/extra_charges
        def index
          charges = @booking.booking_extra_charges.order(created_at: :desc)
          render_success(charges.map { |c| charge_json(c) }, "Extra charges retrieved.")
        end

        # POST /api/v1/worker/bookings/:booking_id/extra_charges
        def create
          charge_type = params.require(:charge_type).to_s.strip.downcase
          quantity    = (params[:quantity] || 1).to_i.clamp(1, 99)

          unless %w[service product custom].include?(charge_type)
            return render_unprocessable(["Invalid charge_type. Must be: service, product, or custom."])
          end

          # Booking must be in_progress for worker to add charges
          unless %w[in_progress completed].include?(@booking.service_status)
            return render_unprocessable(["Extra charges can only be added while the booking is in progress or completed."])
          end

          description, amount = resolve_description_and_amount(charge_type, quantity)
          return if performed?  # resolve already rendered an error

          charge = @booking.booking_extra_charges.create!(
            added_by_worker: current_api_user,
            charge_type:     charge_type,
            description:     description,
            amount:          amount,
            quantity:        quantity,
            status:          "approved",
            approved_at:     Time.current
          )

          # Recalculate complete booking totals cleanly
          @booking.recalculate_amounts!

          extra_discount = @booking.coupon&.apply_to_extra(charge.line_total.to_f) || 0.0
          net_extra      = (charge.line_total.to_f - extra_discount).round(2)

          render_success(
            charge_json(charge).merge(
              extra_discount_applied: extra_discount.round(2),
              net_extra_added:        net_extra.round(2),
              updated_booking_total:  @booking.total_amount.to_f,
              display_amount:         @booking.display_amount
            ),
            "Extra charge added and booking total updated.",:created
          )
        end

        private

        def set_booking
          @booking = current_api_user.worker_bookings.find(params[:booking_id])
        rescue ActiveRecord::RecordNotFound
          render_not_found("Booking not found or not assigned to you.")
        end

        # Returns [description, amount] — price is always server-side, never from client
        def resolve_description_and_amount(charge_type, quantity)
          case charge_type
          when "service"
            service = Service.active.find_by(id: params[:service_id])
            unless service
              render_unprocessable(["service_id is required and must be a valid active service."])
              return
            end
            [service.name, service.base_price]

          when "product"
            product = Product.active.find_by(id: params[:product_id])
            unless product
              render_unprocessable(["product_id is required and must be a valid active product."])
              return
            end
            [product.name, product.selling_price]

          when "custom"
            desc   = params[:description].to_s.strip
            amount = params[:amount].to_f
            if desc.blank?
              render_unprocessable(["description is required for custom charges."])
              return
            end
            if amount <= 0
              render_unprocessable(["amount must be greater than 0 for custom charges."])
              return
            end
            [desc, amount]
          end
        end

        def notify_admins(charge)
          User.admins.active.each do |admin|
            Notification.create!(
              user:           admin,
              creator:        current_api_user,
              subject:        "Extra Charge Added: Booking ##{@booking.display_id}",
              body:           "#{current_api_user.name} added an extra charge: #{charge.description} (₹#{charge.line_total.to_i}). Pending approval.",
              channel:        "push",
              status:         "sent",
              recipient_type: "admin",
              sent_at:        Time.current
            )
          end
        end

        def charge_json(charge)
          {
            id:           charge.id,
            charge_type:  charge.charge_type,
            description:  charge.description,
            amount:       charge.amount,
            quantity:     charge.quantity,
            line_total:   charge.line_total,
            status:       charge.status,
            created_at:   charge.created_at
          }
        end
      end
    end
  end
end
