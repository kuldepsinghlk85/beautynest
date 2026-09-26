# frozen_string_literal: true

require "test_helper"

class Admin::BackupsControllerTest < ActionDispatch::IntegrationTest
  def setup
    @admin = User.find_by(email: "admin_test@beautynest.test") || User.create!(
      name: "BeautyNest Admin",
      email: "admin_test@beautynest.test",
      phone: "+919999999991",
      password: "Admin@1234",
      role: "admin",
      status: "active"
    )

    @customer = User.find_by(email: "customer_test@beautynest.test") || User.create!(
      name: "Customer User",
      email: "customer_test@beautynest.test",
      phone: "+919999999992",
      password: "Password@123",
      role: "customer",
      status: "active"
    )
  end

  def sign_in_as(user)
    post login_path, params: { email: user.email, password: user.role == "admin" ? "Admin@1234" : "Password@123" }
    follow_redirect!
  end

  test "unauthenticated user cannot export or import backup" do
    get admin_backup_export_path(format: :json)
    assert_redirected_to login_path

    post admin_backup_import_path
    assert_redirected_to login_path
  end

  test "admin can export full JSON database backup" do
    sign_in_as(@admin)
    get admin_backup_export_path(format: :json)

    assert_response :success
    assert_equal "application/json; charset=utf-8", response.content_type

    parsed = JSON.parse(response.body)
    assert parsed.key?("backup_metadata")
    assert parsed.key?("bookings")
    assert parsed.key?("workers")
    assert parsed.key?("customers")
  end

  test "admin can import JSON backup file safely without overwriting existing data" do
    sign_in_as(@admin)

    backup_json = JSON.generate(CsvExportService.full_backup_json)
    file = Rack::Test::UploadedFile.new(
      StringIO.new(backup_json),
      "application/json",
      original_filename: "test_backup.json"
    )

    post admin_backup_import_path, params: { backup_file: file }
    assert_response :redirect
    follow_redirect!

    assert_match(/0 missing records added/i, flash[:notice])
    assert_match(/existing records kept completely untouched/i, flash[:notice])
  end

  test "import redirects with alert when no file uploaded" do
    sign_in_as(@admin)

    post admin_backup_import_path
    assert_response :redirect
    assert_equal "Please select a valid JSON backup file to import.", flash[:alert]
  end
end
