# frozen_string_literal: true

module Api
  module V1
    class CouponsController < BaseController
      before_action :require_customer!
      before_action :set_coupon, only: :show

      # GET /api/v1/coupons
      # Optional query param: ?amount=1200 or ?subtotal=1200
      def index
        amount = extract_amount
        coupons = Coupon.valid_now.order(min_order_amount: :asc, discount_value: :desc)

        data = coupons.map { |coupon| coupon_json(coupon, amount: amount) }

        payload = {
          coupons: data
        }
        if amount.positive?
          payload[:order_amount] = amount
          payload[:applicable_count] = data.count { |c| c[:is_applicable] }
        end

        render_success(payload, "Available coupons retrieved successfully.")
      end

      # GET /api/v1/coupons/:id (can be UUID or code like 'WELCOME20')
      def show
        amount = extract_amount
        render_success(coupon_json(@coupon, amount: amount))
      end

      # POST /api/v1/coupons/validate or POST /api/v1/coupons/apply
      # Body: { "code": "WELCOME20", "amount": 1200 }
      def validate
        code_input = params[:code].presence || params.dig(:coupon, :code)
        if code_input.blank?
          return render_unprocessable(["Coupon code is required."])
        end

        coupon = Coupon.find_by("LOWER(code) = ?", code_input.to_s.strip.downcase)
        unless coupon
          return render_unprocessable(["Coupon code '#{code_input}' is invalid."])
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

        amount = extract_amount
        if amount.positive? && amount < coupon.min_order_amount.to_f
          return render_unprocessable([
            "Minimum booking amount of ₹#{coupon.min_order_amount.to_i} is required to use coupon '#{coupon.code}'."
          ])
        end

        discount = amount.positive? ? coupon.apply_to(amount).to_f : coupon.apply_to(coupon.min_order_amount.to_f).to_f
        final_amount = amount.positive? ? [amount - discount, 0.0].max.to_f : nil

        response_data = {
          valid: true,
          code: coupon.code,
          discount_type: coupon.discount_type,
          discount_value: coupon.discount_value.to_f,
          discount_amount: discount,
          subtotal: amount.positive? ? amount : nil,
          final_amount: final_amount,
          savings: discount,
          display_discount: coupon.display_discount,
          description: "#{coupon.display_discount} on your booking",
          coupon: coupon_json(coupon, amount: amount)
        }

        render_success(response_data, "Coupon '#{coupon.code}' applied successfully!")
      end
      alias apply validate

      private

      def set_coupon
        @coupon = Coupon.find_by(id: params[:id]) ||
                  Coupon.find_by("LOWER(code) = ?", params[:id].to_s.strip.downcase)
        render_not_found("Coupon not found.") unless @coupon
      end

      def extract_amount
        raw = params[:amount] || params[:subtotal] || params[:total_amount] ||
              params.dig(:coupon, :amount) || params.dig(:coupon, :subtotal)
        raw.present? ? raw.to_f : 0.0
      end

      def coupon_json(c, amount: 0.0)
        is_applicable = amount.positive? ? (amount >= c.min_order_amount.to_f) : true
        discount = (amount.positive? && is_applicable) ? c.apply_to(amount).to_f : nil

        {
          id: c.id,
          code: c.code,
          discount_type: c.discount_type,
          discount_value: c.discount_value.to_f,
          display_discount: c.display_discount,
          min_order_amount: c.min_order_amount.to_f,
          display_min_order: c.display_min_order,
          max_discount: c.max_discount&.to_f,
          display_max_discount: c.display_max_discount,
          usage_count: c.usage_count,
          usage_limit: c.usage_limit,
          valid_from: c.valid_from,
          valid_until: c.valid_until,
          display_valid_until: c.display_valid_until,
          status: c.status,
          is_applicable: is_applicable,
          discount_amount: discount,
          terms: [
            c.discount_type == "percentage" ? "#{c.discount_value.to_i}% discount on total order" : "Flat ₹#{c.discount_value.to_i} off",
            c.min_order_amount.to_f > 0 ? "Valid on minimum booking value of ₹#{c.min_order_amount.to_i}" : "No minimum booking value",
            c.max_discount.present? ? "Maximum discount capped at ₹#{c.max_discount.to_i}" : nil,
            c.valid_until.present? ? "Expires on #{c.display_valid_until}" : "No expiration date"
          ].compact
        }
      end
    end
  end
end
