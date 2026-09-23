# frozen_string_literal: true

module Api
  module V1
    class CartItemsController < BaseController
      before_action :require_customer!
      before_action :set_cart_item, only: %i[update destroy]

      # DELETE /api/v1/cart/items  — clear all items
      def destroy_all
        current_api_user.active_cart.cart_items.destroy_all
        render_success(nil, "Cart cleared successfully.")
      end

      # POST /api/v1/cart/items
      def create
        service_lookup = item_params[:service_id]
        service = Service.friendly.find_by(id: service_lookup) ||
                  Service.friendly.find_by(slug: service_lookup)

        unless service.present?
          return render_not_found("Service not found.")
        end

        cart = current_api_user.active_cart
        item = cart.cart_items.find_or_initialize_by(service: service)

        qty = (item_params[:quantity].presence || 1).to_i
        qty = 1 if qty < 1

        if item.persisted?
          item.quantity += qty
        else
          item.quantity = qty
        end

        item.scheduled_at = item_params[:scheduled_at] if item_params[:scheduled_at].present?

        if item.save
          render_success(item.as_json_api, "Item added to cart.", :created)
        else
          render_unprocessable(item.errors.full_messages)
        end
      end

      # PATCH/PUT /api/v1/cart/items/:id
      def update
        qty = item_params[:quantity].to_i
        if qty <= 0
          @cart_item.destroy
          return render_success(nil, "Item removed from cart.")
        end

        if @cart_item.update(item_params)
          render_success(@cart_item.as_json_api, "Cart item updated successfully.")
        else
          render_unprocessable(@cart_item.errors.full_messages)
        end
      end

      # DELETE /api/v1/cart/items/:id
      def destroy
        @cart_item.destroy
        render_success(nil, "Cart item removed successfully.")
      end

      private

      def set_cart_item
        @cart_item = current_api_user.active_cart.cart_items.find(params[:id])
      end

      def item_params
        params.require(:cart_item).permit(:service_id, :quantity, :scheduled_at)
      rescue ActionController::ParameterMissing
        params.permit(:service_id, :quantity, :scheduled_at)
      end
    end
  end
end
