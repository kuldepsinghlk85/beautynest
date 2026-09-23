# frozen_string_literal: true

require "securerandom"

module ApiResponseHelper
  extend ActiveSupport::Concern

  def render_item(item, message: nil, status: :ok, extra: {})
    payload = {
      status: "success",
      data: item,
      request_id: current_request_id
    }
    payload[:message] = message if message.present?
    payload.merge!(extra) if extra.present?
    render json: payload, status: status
  end

  def render_success(item, message = nil, status = :ok, **options)
    status_code = options.key?(:status) ? options.delete(:status) : status
    render_item(item, message: message, status: status_code, extra: options)
  end

  def render_unauthorized(message = "Authentication required.", code: "UNAUTHORIZED")
    render json: {
      status: "error",
      code: code,
      message: message,
      request_id: current_request_id
    }, status: :unauthorized
  end

  def render_forbidden(message = "You do not have permission to perform this action.", code: "FORBIDDEN")
    render json: {
      status: "error",
      code: code,
      message: message,
      request_id: current_request_id
    }, status: :forbidden
  end

  def render_unprocessable(errors, message = nil)
    messages = errors.is_a?(Array) ? errors : Array(errors)
    primary_message = message.presence || messages.first || "One or more fields failed validation."

    render json: {
      status: "error",
      code: "VALIDATION_ERROR",
      message: primary_message,
      errors: messages,
      request_id: current_request_id
    }, status: :unprocessable_entity
  end

  def render_not_found(message = "Resource not found.", code: "NOT_FOUND")
    render json: {
      status: "error",
      code: code,
      message: message,
      request_id: current_request_id
    }, status: :not_found
  end

  def render_error(message = "An error occurred.", status = :internal_server_error, code: "SERVER_ERROR")
    render json: {
      status: "error",
      code: code,
      message: message,
      request_id: current_request_id
    }, status: status
  end

  private

  def current_request_id
    @current_request_id ||= SecureRandom.uuid
  end
end
