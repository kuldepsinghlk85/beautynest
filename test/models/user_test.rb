# frozen_string_literal: true

require "test_helper"

class UserTest < ActiveSupport::TestCase
  test "valid user with customer role" do
    user = User.new(
      name: "John Doe",
      email: "john@example.com",
      phone: "+919876543210",
      password: "Password@123",
      role: "customer",
      status: "active"
    )
    assert user.valid?
    assert user.save
    assert user.customer?
    assert_not user.admin?
    assert_not user.worker?
    assert user.active?
  end

  test "email is normalized to lowercase and trimmed" do
    user = User.create!(
      name: "  Jane Doe  ",
      email: "  JANE@EXAMPLE.COM  ",
      phone: "  +919876543211  ",
      password: "Password@123",
      role: "customer",
      status: "active"
    )
    assert_equal "jane@example.com", user.email
    assert_equal "+919876543211", user.phone
    assert_equal "Jane Doe", user.name
  end

  test "role must be strictly customer, worker, or admin" do
    user = User.new(
      name: "Invalid Role",
      email: "invalid@example.com",
      phone: "+919876543212",
      password: "Password@123",
      role: "super_admin",
      status: "active"
    )
    assert_not user.valid?
    assert_includes user.errors[:role], "is not included in the list"
  end

  test "status must be strictly active or inactive - suspended is rejected" do
    user = User.new(
      name: "Suspended Test",
      email: "suspended@example.com",
      phone: "+919876543213",
      password: "Password@123",
      role: "customer",
      status: "suspended"
    )
    assert_not user.valid?
    assert_includes user.errors[:status], "is not included in the list"
  end

  test "duplicate email is rejected regardless of case" do
    User.create!(
      name: "First User",
      email: "test@example.com",
      phone: "+919876543214",
      password: "Password@123",
      role: "customer",
      status: "active"
    )

    duplicate = User.new(
      name: "Second User",
      email: "TEST@example.com",
      phone: "+919876543215",
      password: "Password@123",
      role: "customer",
      status: "active"
    )
    assert_not duplicate.valid?
    assert_includes duplicate.errors[:email], "has already been taken"
  end

  test "duplicate phone is rejected" do
    User.create!(
      name: "First Phone",
      email: "phone1@example.com",
      phone: "+919876543216",
      password: "Password@123",
      role: "customer",
      status: "active"
    )

    duplicate = User.new(
      name: "Second Phone",
      email: "phone2@example.com",
      phone: "+919876543216",
      password: "Password@123",
      role: "customer",
      status: "active"
    )
    assert_not duplicate.valid?
    assert_includes duplicate.errors[:phone], "has already been taken"
  end

  test "bcrypt password authentication works" do
    user = User.create!(
      name: "Auth Test",
      email: "auth@example.com",
      phone: "+919876543217",
      password: "SecretPassword123",
      role: "customer",
      status: "active"
    )
    assert user.authenticate("SecretPassword123")
    assert_not user.authenticate("WrongPassword")
  end

  test "as_json_api never returns password_digest or password" do
    user = User.create!(
      name: "JSON Test",
      email: "json@example.com",
      phone: "+919876543218",
      password: "SecretPassword123",
      role: "customer",
      status: "active"
    )
    json = user.as_json_api
    assert_nil json[:password_digest]
    assert_nil json["password_digest"]
    assert_nil json[:password]
    assert_equal user.id, json[:id]
    assert_equal "json@example.com", json[:email]
  end

  test "destroying user destroys associated sessions" do
    user = User.create!(
      name: "Session Parent",
      email: "parent@example.com",
      phone: "+919876543219",
      password: "Password@123",
      role: "customer",
      status: "active"
    )
    user.sessions.create!(token_digest: "digest123", expires_at: 1.day.from_now)

    assert_difference("Session.count", -1) do
      user.destroy
    end
  end
end
