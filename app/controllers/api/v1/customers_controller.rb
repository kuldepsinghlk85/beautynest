# frozen_string_literal: true

module Api
  module V1
    class CustomersController < BaseController
      include Pundit::Authorization

      after_action :verify_authorized, except: :index
      after_action :verify_policy_scoped, only: :index

      rescue_from Pundit::NotAuthorizedError, with: :handle_pundit_not_authorized

      # GET /api/v1/customers
      def index
        authorize :customer, :index?, policy_class: CustomerPolicy
        @customers = policy_scope(User, policy_scope_class: CustomerPolicy::Scope)
        render_success(@customers.map(&:as_json_api), "Customers retrieved successfully.")
      end

      # GET /api/v1/customers/:id
      def show
        @customer = find_customer
        authorize @customer, policy_class: CustomerPolicy
        render_success(@customer.as_json_api, "Customer details retrieved successfully.")
      end

      # PATCH/PUT /api/v1/customers/:id
      def update
        @customer = find_customer
        authorize @customer, policy_class: CustomerPolicy
        if @customer.update(customer_params)
          render_success(@customer.as_json_api, "Customer updated successfully.")
        else
          render_unprocessable(@customer.errors.full_messages)
        end
      end

      # DELETE /api/v1/customers/:id
      def destroy
        @customer = find_customer
        authorize @customer, policy_class: CustomerPolicy
        @customer.destroy
        render_success(nil, "Customer deleted successfully.")
      end

      private

      def pundit_user
        current_api_user
      end

      def find_customer
        if current_api_user.customer?
          # Customers may only access their own record (prevents IDOR)
          raise ActiveRecord::RecordNotFound unless params[:id] == current_api_user.id.to_s
          current_api_user
        else
          User.customers.find(params[:id])
        end
      end

      def customer_params
        params.require(:customer).permit(:name, :phone, :avatar_url)
      rescue ActionController::ParameterMissing
        params.permit(:name, :phone, :avatar_url)
      end

      def handle_pundit_not_authorized
        render_forbidden("You are not authorized to perform this action.")
      end
    end
  end
end
