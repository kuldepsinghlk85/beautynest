# frozen_string_literal: true

ENV["RAILS_ENV"] ||= "test"
ENV["SECRET_KEY_BASE"] ||= "test_secret_key_base_1234567890abcdef1234567890abcdef1234567890abcdef"
ENV["DB_HOST"] ||= "localhost"
if ENV["DATABASE_URL"] && ENV["DB_HOST"] == "localhost"
  ENV["DATABASE_URL"] = ENV["DATABASE_URL"].gsub("@db:", "@localhost:").gsub("@db/", "@localhost/").sub("beauty_connect_development", "beauty_connect_test")
end
require_relative "../config/environment"
require "rails/test_help"

module ActiveSupport
  class TestCase
    self.use_transactional_tests = true

    # Helper to generate JWT token for a user in tests
    def generate_token_for(user, exp = 24.hours.from_now)
      session = user.sessions.create!(
        token_digest: "temp_#{SecureRandom.hex(16)}",
        expires_at: exp
      )
      payload = {
        sub: user.id,
        jti: session.id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status
      }
      token = JwtService.encode(payload, exp)
      session.update!(token_digest: Session.digest(token))
      [session, token]
    end
  end
end

class ActionDispatch::IntegrationTest
  # Helper to sign in as admin in integration tests
  def sign_in_admin(admin)
    post login_path, params: { email: admin.email, password: "Admin@1234" }
  end

  def sign_in_user(user, password = nil)
    pwd = password || (user.admin? ? "Admin@1234" : (user.worker? ? "Worker@1234" : "Password@123"))
    post login_path, params: { email: user.email, password: pwd }
  end
end
