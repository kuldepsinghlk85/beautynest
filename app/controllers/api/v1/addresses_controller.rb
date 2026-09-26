# frozen_string_literal: true

module Api
  module V1
    class AddressesController < BaseController
      before_action :require_customer!
      before_action :set_address, only: %i[update destroy]

      # GET /api/v1/customers/addresses
      def index
        addresses = current_api_user.addresses.default_first
        render_success(addresses.map(&:as_json_api), "Addresses retrieved successfully.")
      end

      # POST /api/v1/customers/addresses
      def create
        address = current_api_user.addresses.build(address_params)

        if address.save
          render_success(address.as_json_api, "Address created successfully.", :created)
        else
          render_unprocessable(address.errors.full_messages)
        end
      end

      # PATCH/PUT /api/v1/customers/addresses/:id
      def update
        if @address.update(address_params)
          render_success(@address.as_json_api, "Address updated successfully.")
        else
          render_unprocessable(@address.errors.full_messages)
        end
      end

      # DELETE /api/v1/customers/addresses/:id
      def destroy
        @address.destroy
        render_success(nil, "Address deleted successfully.")
      end

      private

      def set_address
        @address = current_api_user.addresses.find(params[:id])
      end

      def address_params
        params.require(:address).permit(
          :label, :line1, :line2, :city, :state, :pincode,
          :latitude, :longitude, :is_default
        )
      rescue ActionController::ParameterMissing
        params.permit(
          :label, :line1, :line2, :city, :state, :pincode,
          :latitude, :longitude, :is_default
        )
      end
    end
  end
end
