# frozen_string_literal: true

require "test_helper"

class Api::V1::AuthControllerTest < ActionDispatch::IntegrationTest
  def setup
    @customer = User.create!(
      name: "API Customer",
      email: "api_customer@example.com",
      phone: "+919876543230",
      password: "Customer@123",
      role: "customer",
      status: "active"
    )

    @inactive_user = User.create!(
      name: "Inactive API User",
      email: "api_inactive@example.com",
      phone: "+919876543231",
      password: "Password@123",
      role: "customer",
      status: "inactive"
    )
  end

  test "POST /api/v1/auth/register creates customer and returns JWT" do
    assert_difference("User.count", 1) do
      assert_difference("Session.count", 1) do
        post "/api/v1/auth/register", params: {
          user: {
            name: "New Registered Customer",
            email: "new_reg@example.com",
            phone: "+919876543232",
            password: "SecurePassword123",
            password_confirmation: "SecurePassword123"
          }
        }, as: :json
      end
    end

    assert_response :created
    json = JSON.parse(response.body)
    token = json.dig("data", "token")
    user_data = json.dig("data", "user")
    assert token.present?
    assert_equal "New Registered Customer", user_data["name"]
    assert_equal "new_reg@example.com", user_data["email"]
    assert_equal "customer", user_data["role"]
    assert_nil user_data["password_digest"]

    # Verify JWT payload structure
    decoded = JwtService.decode(token)
    assert_not_nil decoded[:sub]
    assert_not_nil decoded[:jti]
    assert_not_nil decoded[:exp]
    assert_equal "New Registered Customer", decoded[:name]
    assert_equal "new_reg@example.com", decoded[:email]
    assert_equal "customer", decoded[:role]
    assert_equal "active", decoded[:status]

    # Verify session in DB
    session = Session.find(decoded[:jti])
    assert_equal decoded[:sub], session.user_id
    assert_equal Session.digest(token), session.token_digest
  end

  test "POST /api/v1/auth/register ignores client role tampering and forces customer role" do
    post "/api/v1/auth/register", params: {
      user: {
        name: "Hacker Attempt",
        email: "hacker@example.com",
        phone: "+919876543233",
        password: "SecurePassword123",
        role: "admin" # Attempt to register as admin
      }
    }, as: :json

    assert_response :created
    json = JSON.parse(response.body)
    user_data = json.dig("data", "user")
    assert_equal "customer", user_data["role"]

    created_user = User.find(user_data["id"])
    assert_equal "customer", created_user.role
  end

  test "POST /api/v1/auth/register returns 422 for invalid inputs" do
    post "/api/v1/auth/register", params: {
      user: {
        name: "",
        email: "invalid_email",
        phone: "",
        password: "123" # too short
      }
    }, as: :json

    assert_response :unprocessable_entity
    json = JSON.parse(response.body)
    assert_equal "VALIDATION_ERROR", json["code"]
    assert json["message"].present?
  end

  test "POST /api/v1/auth/login succeeds with valid credentials" do
    post "/api/v1/auth/login", params: {
      email: @customer.email,
      password: "Customer@123"
    }, as: :json

    assert_response :ok
    json = JSON.parse(response.body)
    token = json.dig("data", "token")
    user_data = json.dig("data", "user")
    assert token.present?
    assert_equal @customer.id, user_data["id"]
    assert_nil user_data["password_digest"]

    decoded = JwtService.decode(token)
    assert_equal @customer.id, decoded[:sub]
    session = Session.find(decoded[:jti])
    assert_equal Session.digest(token), session.token_digest
  end

  test "POST /api/v1/auth/login fails with 401 for wrong password" do
    post "/api/v1/auth/login", params: {
      email: @customer.email,
      password: "WrongPassword"
    }, as: :json

    assert_response :unauthorized
    json = JSON.parse(response.body)
    assert_equal "UNAUTHORIZED", json["code"]
    assert_match(/invalid email or password/i, json["message"])
  end

  test "POST /api/v1/auth/login fails for inactive user" do
    post "/api/v1/auth/login", params: {
      email: @inactive_user.email,
      password: "Password@123"
    }, as: :json

    assert_response :forbidden
    json = JSON.parse(response.body)
    assert_equal "FORBIDDEN", json["code"]
    assert_match(/inactive/i, json["message"])
  end

  test "GET /api/v1/auth/me with valid Bearer token returns sanitized user" do
    _session, token = generate_token_for(@customer)

    get "/api/v1/auth/me", headers: { "Authorization" => "Bearer #{token}" }
    assert_response :ok

    json = JSON.parse(response.body)
    user_data = json.dig("data", "user")
    assert_equal @customer.id, user_data["id"]
    assert_equal @customer.email, user_data["email"]
    assert_equal "customer", user_data["role"]
    assert_nil user_data["password_digest"]
  end

  test "GET /api/v1/auth/me without token returns 401" do
    get "/api/v1/auth/me"
    assert_response :unauthorized
    json = JSON.parse(response.body)
    assert_equal "UNAUTHORIZED", json["code"]
  end

  test "GET /api/v1/auth/me with expired token returns 401" do
    _session, token = generate_token_for(@customer, 1.hour.ago)

    get "/api/v1/auth/me", headers: { "Authorization" => "Bearer #{token}" }
    assert_response :unauthorized
    json = JSON.parse(response.body)
    assert_equal "UNAUTHORIZED", json["code"]
    assert_match(/expired/i, json["message"])
  end

  test "DELETE /api/v1/auth/logout revokes session and invalidates token" do
    session, token = generate_token_for(@customer)

    # 1. Verify token works before logout
    get "/api/v1/auth/me", headers: { "Authorization" => "Bearer #{token}" }
    assert_response :ok

    # 2. Logout
    delete "/api/v1/auth/logout", headers: { "Authorization" => "Bearer #{token}" }
    assert_response :ok
    assert session.reload.revoked?

    # 3. Subsequent request with same token fails with 401
    get "/api/v1/auth/me", headers: { "Authorization" => "Bearer #{token}" }
    assert_response :unauthorized
    json = JSON.parse(response.body)
    assert_equal "UNAUTHORIZED", json["code"]
    assert_match(/revoked/i, json["message"])
  end
end
