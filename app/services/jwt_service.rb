# frozen_string_literal: true

require "jwt"

class JwtService
  ALGORITHM = "HS256"

  # Default fallbacks if not configured in ENV: Access Token = 15 minutes, Refresh Token = 15 days
  DEFAULT_ACCESS_EXPIRATION  = 15.minutes
  DEFAULT_REFRESH_EXPIRATION = 15.days

  class << self
    def access_token_expiration
      parse_duration(
        ENV["JWT_ACCESS_TOKEN_EXPIRY"].presence || ENV["JWT_EXPIRATION"].presence,
        default_unit: :minutes
      ) || DEFAULT_ACCESS_EXPIRATION
    end

    def refresh_token_expiration
      parse_duration(
        ENV["JWT_REFRESH_TOKEN_EXPIRY"].presence || ENV["REFRESH_TOKEN_EXPIRY"].presence,
        default_unit: :days
      ) || DEFAULT_REFRESH_EXPIRATION
    end

    def encode(payload, exp = access_token_expiration.from_now)
      payload_to_encode = payload.dup
      payload_to_encode[:exp] = exp.to_i
      payload_to_encode[:iat] ||= Time.current.to_i
      JWT.encode(payload_to_encode, secret_key, ALGORITHM)
    end

    def decode(token, verify_expiration: true)
      decoded = JWT.decode(token, secret_key, verify_expiration, { algorithm: ALGORITHM })
      ActiveSupport::HashWithIndifferentAccess.new(decoded.first)
    end

    private

    def parse_duration(raw, default_unit: :minutes)
      return nil if raw.blank?

      val_str = raw.to_s.tr("_", " ").strip.downcase
      case val_str
      when /\A(\d+)\s*(m|min|mins|minute|minutes)\z/
        Regexp.last_match(1).to_i.minutes
      when /\A(\d+)\s*(h|hr|hrs|hour|hours)\z/
        Regexp.last_match(1).to_i.hours
      when /\A(\d+)\s*(d|day|days)\z/
        Regexp.last_match(1).to_i.days
      when /\A(\d+)\s*(s|sec|secs|second|seconds)\z/
        Regexp.last_match(1).to_i.seconds
      when /\A\d+\z/
        val = val_str.to_i
        default_unit == :days ? val.days : val.minutes
      else
        nil
      end
    end

    def secret_key
      ENV["JWT_SECRET"].presence ||
        Rails.application.credentials.jwt_secret.presence ||
        (Rails.env.local? ? Rails.application.secret_key_base : nil) ||
        raise("JWT_SECRET is missing. Please configure ENV['JWT_SECRET'].")
    end
  end
end
