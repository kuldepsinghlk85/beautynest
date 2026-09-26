# frozen_string_literal: true

require "test_helper"

class UserPasswordResetTest < ActiveSupport::TestCase
  def sample_user
    @sample_user ||= User.create!(
      name: "Reset Tester",
      email: "reset_tester_#{SecureRandom.hex(4)}@example.com",
      phone: "+9195555#{rand(10000..99999)}",
      role: "admin",
      status: "active",
      password: "OldPassword123!"
    )
  end

  test "generate_password_reset_token! generates valid token and timestamp" do
    user = sample_user
    token = user.generate_password_reset_token!

    assert_not_nil token
    user.reload
    assert_equal token, user.reset_password_token
    assert_not_nil user.reset_password_sent_at
    assert user.password_reset_token_valid?
  end

  test "password_reset_token_valid? returns false after 2 hours" do
    user = sample_user
    user.generate_password_reset_token!
    user.update_columns(reset_password_sent_at: 3.hours.ago)

    assert_not user.password_reset_token_valid?
  end

  test "clear_password_reset_token! clears token and sent_at" do
    user = sample_user
    user.generate_password_reset_token!
    user.clear_password_reset_token!

    user.reload
    assert_nil user.reset_password_token
    assert_nil user.reset_password_sent_at
    assert_not user.password_reset_token_valid?
  end
end
