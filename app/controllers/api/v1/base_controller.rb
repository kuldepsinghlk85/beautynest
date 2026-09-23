# frozen_string_literal: true

module Api
  module V1
    class BaseController < ActionController::API
      include ActionController::Cookies
      include ::ApiResponseHelper
      include ::JwtAuthenticatable

      before_action :set_cors_headers
      before_action :authenticate_api_user!

      rescue_from ActiveRecord::RecordNotFound, with: :handle_record_not_found
      rescue_from ActionController::ParameterMissing, with: :handle_parameter_missing

      private

      def set_cors_headers
        response.headers["Access-Control-Allow-Origin"] = "*"
        response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, PATCH, DELETE, OPTIONS, HEAD"
        response.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization, X-Requested-With, Accept, Origin"
      end

      def handle_record_not_found(exception)
        render_not_found("Resource not found.")
      end

      def handle_parameter_missing(exception)
        render_unprocessable([exception.message], "Required parameter is missing.")
      end
    end
  end
end
