# frozen_string_literal: true

module Admin
  module Bookings
    class ExtraChargesController < Admin::BaseController
      before_action :set_booking
      before_action :set_charge, only: %i[approve reject]

      # GET /admin/bookings/:booking_id/extra_charges/search_services?q=facial
      def search_services
        authorize @booking, :show?
        q = params[:q].to_s.strip
        services = Service.active.ordered
        services = services.where("name ILIKE ?", "%#{q}%") if q.present?
        render json: services.limit(15).map { |s|
          unit_disc = @booking.coupon&.apply_to_extra(s.effective_price.to_f) || 0.0
          {
            id:               s.id,
            name:             s.name,
            duration_minutes: s.duration_minutes,
            price:            s.effective_price.to_f,
            discounted_price: (s.effective_price.to_f - unit_disc).round(2),
            discount_amount:  unit_disc.round(2),
            image_url:        s.image_url
          }
        }
      end

      # GET /admin/bookings/:booking_id/extra_charges/search_products?q=gel
      def search_products
        authorize @booking, :show?
        q = params[:q].to_s.strip
        products = Product.active.ordered
        products = products.where("name ILIKE ?", "%#{q}%") if q.present?
        render json: products.limit(15).map { |p|
          unit_disc = @booking.coupon&.apply_to_extra(p.selling_price.to_f) || 0.0
          {
            id:               p.id,
            name:             p.name,
            unit:             p.unit,
            price:            p.selling_price.to_f,
            discounted_price: (p.selling_price.to_f - unit_disc).round(2),
            discount_amount:  unit_disc.round(2)
          }
        }
      end

      # POST /admin/bookings/:booking_id/extra_charges
      def create
        authorize @booking, :update?

        charge_type = params[:charge_type].presence || params.dig(:booking_extra_charge, :charge_type)
        quantity    = (params[:quantity] || params.dig(:booking_extra_charge, :quantity) || 1).to_i.clamp(1, 99)

        description = nil
        amount      = nil
        service_id  = nil
        product_id  = nil

        case charge_type
        when "service"
          s_id = params[:service_id].presence || params.dig(:booking_extra_charge, :service_id)
          service = Service.active.find_by(id: s_id)
          if service
            description = service.name
            amount      = service.effective_price.to_f
            service_id  = service.id
          else
            description = params[:description].presence || params.dig(:booking_extra_charge, :description).to_s.strip
            amount      = (params[:amount] || params.dig(:booking_extra_charge, :amount)).to_f
          end
        when "product"
          p_id = params[:product_id].presence || params.dig(:booking_extra_charge, :product_id)
          product = Product.active.find_by(id: p_id)
          if product
            description = "#{product.name} (#{product.unit})"
            amount      = product.selling_price.to_f
            product_id  = product.id
          else
            description = params[:description].presence || params.dig(:booking_extra_charge, :description).to_s.strip
            amount      = (params[:amount] || params.dig(:booking_extra_charge, :amount)).to_f
          end
        else # custom
          charge_type = "custom"
          description = params[:description].presence || params.dig(:booking_extra_charge, :description).to_s.strip
          amount      = (params[:amount] || params.dig(:booking_extra_charge, :amount)).to_f
        end

        if description.blank? || amount.to_f <= 0
          flash[:alert] = "Please provide a valid description and price."
          redirect_to admin_booking_path(@booking) and return
        end

        charge = @booking.booking_extra_charges.build(
          charge_type:        charge_type,
          description:        description,
          amount:             amount,
          quantity:           quantity,
          service_id:         service_id,
          product_id:         product_id,
          added_by_worker_id: current_user.id,
          status:             "approved",
          approved_at:        Time.current
        )

        if charge.save
          @booking.recalculate_amounts!
          flash[:notice] = "Added extra #{charge_type}. Booking total updated to #{@booking.display_amount}."
        else
          flash[:alert] = charge.errors.full_messages.to_sentence
        end

        redirect_to admin_booking_path(@booking)
      end

      # PATCH /admin/bookings/:booking_id/extra_charges/:id/approve
      def approve
        authorize @booking, :update?

        if @charge.pending?
          @charge.approve!
          @booking.recalculate_amounts!
          flash[:notice] = "Extra charge approved. Booking total updated to #{@booking.display_amount}."
        else
          flash[:alert] = "Charge is already #{@charge.status}."
        end

        redirect_to admin_booking_path(@booking)
      end

      # PATCH /admin/bookings/:booking_id/extra_charges/:id/reject
      def reject
        authorize @booking, :update?

        if @charge.pending?
          @charge.reject!
          @booking.recalculate_amounts!
          flash[:notice] = "Extra charge rejected. Booking total updated to #{@booking.display_amount}."
        else
          flash[:alert] = "Charge is already #{@charge.status}."
        end

        redirect_to admin_booking_path(@booking)
      end

      private

      def set_booking
        @booking = Booking.find(params[:booking_id])
      end

      def set_charge
        @charge = @booking.booking_extra_charges.find(params[:id])
      end
    end
  end
end
