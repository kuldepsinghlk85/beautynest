# frozen_string_literal: true

require "test_helper"

class SessionTest < ActiveSupport::TestCase
  def setup
    @user = User.create!(
      name: "Session User",
      email: "session_user@example.com",
      phone: "+919876543220",
      password: "Password@123",
      role: "customer",
      status: "active"
    )
  end

  test "active session is valid and active" do
    session = @user.sessions.create!(
      token_digest: "unique_digest_1",
      expires_at: 24.hours.from_now
    )
    assert session.active?
    assert_not session.expired?
    assert_not session.revoked?
    assert_includes Session.active, session
  end

  test "expired session is not active" do
    session = @user.sessions.create!(
      token_digest: "unique_digest_2",
      expires_at: 1.hour.ago
    )
    assert_not session.active?
    assert session.expired?
    assert_not_includes Session.active, session
  end

  test "revoked session is not active" do
    session = @user.sessions.create!(
      token_digest: "unique_digest_3",
      expires_at: 24.hours.from_now,
      revoked_at: Time.current
    )
    assert_not session.active?
    assert session.revoked?
    assert_not_includes Session.active, session
  end

  test "revoke! updates revoked_at and deactivates session" do
    session = @user.sessions.create!(
      token_digest: "unique_digest_4",
      expires_at: 24.hours.from_now
    )
    assert session.active?

    session.revoke!
    assert session.revoked?
    assert_not session.active?
    assert_not_nil session.revoked_at
  end

  test "Session.digest calculates SHA256 of raw string" do
    raw = "my_secret_token"
    expected = Digest::SHA256.hexdigest(raw)
    assert_equal expected, Session.digest(raw)
  end
end
