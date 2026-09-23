# frozen_string_literal: true

module JwtAuthenticatable
  extend ActiveSupport::Concern

  included do
    attr_reader :current_api_user, :current_session
  end

  def authenticate_api_user!
    token = extract_bearer_token
    if token.blank? && respond_to?(:session) && session[:user_id].present?
      user = User.find_by(id: session[:user_id])
      if user&.active?
        @current_api_user = user
        return
      end
    end

    unless token.present?
      render_unauthorized("Bearer token is missing.")
      return
    end

    begin
      payload = JwtService.decode(token)
    rescue JWT::ExpiredSignature
      render_unauthorized("Access token has expired.")
      return
    rescue JWT::DecodeError
      render_unauthorized("Access token is invalid or malformed.")
      return
    end

    user_id = payload[:sub]
    unless user_id.present?
      render_unauthorized("Access token payload is invalid.")
      return
    end

    user = User.find_by(id: user_id)
    unless user.present?
      render_unauthorized("User account not found.")
      return
    end

    unless user.active?
      render_forbidden("Account is inactive.")
      return
    end

    # Optional: if token contains legacy session identifier (jti), verify revocation if session exists
    session_id = payload[:jti]
    if session_id.present?
      session = Session.find_by(id: session_id, user_id: user_id)
      if session.present?
        if session.revoked?
          render_unauthorized("Session has been revoked.")
          return
        end

        if session.expired?
          render_unauthorized("Session has expired.")
          return
        end

        @current_session = session
      end
    end

    @current_api_user = user
  end

  # Role-based authorization guards
  def require_customer!
    unless current_api_user&.customer? && current_api_user&.active?
      render_forbidden("Access restricted to customers.")
    end
  end

  def require_worker!
    unless current_api_user&.worker? && current_api_user&.active?
      render_forbidden("Access restricted to workers.")
    end
  end

  def require_admin!
    unless current_api_user&.admin? && current_api_user&.active?
      render_forbidden("Access restricted to administrators.")
    end
  end

  private

  def extract_bearer_token
    header = request.headers["Authorization"]
    return nil unless header.present?

    parts = header.split(" ")
    return parts[1] if parts.length == 2 && parts[0].casecmp("bearer").zero?

    nil
  end
end
