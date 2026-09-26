# frozen_string_literal: true

require "test_helper"

class AdminSettingsTest < ActionDispatch::IntegrationTest
  setup do
    @admin = User.find_or_create_by!(email: "admin_settings_test@BeautyNest.test") do |u|
      u.name = "Settings Admin"
      u.phone = "+919999000888"
      u.password = "Admin@1234"
      u.password_confirmation = "Admin@1234"
      u.role = "admin"
      u.status = "active"
    end

    @worker = User.find_or_create_by!(email: "worker_settings_test@BeautyNest.test") do |u|
      u.name = "Settings Worker"
      u.phone = "+919999000777"
      u.password = "Worker@1234"
      u.password_confirmation = "Worker@1234"
      u.role = "worker"
      u.status = "active"
    end

    Setting.site_name = "BeautyNest"
  end

  test "admin can view settings page" do
    post login_path, params: { email: @admin.email, password: "Admin@1234" }

    get admin_settings_path
    assert_response :success
    assert_select "input[name='site_name']"
    assert_includes response.body, "Platform / Site Name"
  end

  test "admin can change site name" do
    post login_path, params: { email: @admin.email, password: "Admin@1234" }

    patch admin_settings_path, params: { site_name: "GlowCraft Studio" }
    assert_redirected_to admin_settings_path
    follow_redirect!
    assert_equal "Platform settings updated successfully.", flash[:notice]
    assert_equal "GlowCraft Studio", Setting.site_name
    assert_includes response.body, "GlowCraft Studio"
  end

  test "admin cannot set blank site name" do
    post login_path, params: { email: @admin.email, password: "Admin@1234" }

    patch admin_settings_path, params: { site_name: "   " }
    assert_redirected_to admin_settings_path
    assert_equal "Site name cannot be blank.", flash[:alert]
    assert_equal "BeautyNest", Setting.site_name
  end

  test "admin cannot set site name exceeding 100 characters" do
    post login_path, params: { email: @admin.email, password: "Admin@1234" }

    patch admin_settings_path, params: { site_name: "X" * 101 }
    assert_redirected_to admin_settings_path
    assert_equal "Site name cannot exceed 100 characters.", flash[:alert]
    assert_equal "BeautyNest", Setting.site_name
  end

  test "worker cannot view settings page" do
    post login_path, params: { email: @worker.email, password: "Worker@1234" }

    get admin_settings_path
    assert_redirected_to admin_dashboard_path
    assert_equal "You are not authorized to perform this action.", flash[:alert]
  end

  test "worker cannot update site name" do
    post login_path, params: { email: @worker.email, password: "Worker@1234" }

    patch admin_settings_path, params: { site_name: "Malicious Rename" }
    assert_redirected_to admin_dashboard_path
    assert_equal "You are not authorized to perform this action.", flash[:alert]
    assert_equal "BeautyNest", Setting.site_name
  end

  test "unauthenticated visitor is redirected to login" do
    patch admin_settings_path, params: { site_name: "Unauthorized Rename" }
    assert_redirected_to login_path
    assert_equal "BeautyNest", Setting.site_name
  end
end
