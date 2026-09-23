# frozen_string_literal: true

require "test_helper"

class SettingTest < ActiveSupport::TestCase
  test "defaults site_name to BeautyNest" do
    Setting.where(key: "site_name").destroy_all
    assert_equal "BeautyNest", Setting.site_name
  end

  test "can set and get site_name" do
    Setting.site_name = "GlamourHQ"
    assert_equal "GlamourHQ", Setting.site_name
    assert_equal "GlamourHQ", Setting.get("site_name")
  end

  test "strips leading and trailing whitespace on set" do
    Setting.site_name = "   LuxeGlow Studio   "
    assert_equal "LuxeGlow Studio", Setting.site_name
  end

  test "validates presence of key" do
    setting = Setting.new(key: nil, value: "test")
    assert_not setting.valid?
    assert_includes setting.errors[:key], "can't be blank"
  end

  test "validates uniqueness of key case-insensitively" do
    Setting.create!(key: "unique_key", value: "value1")
    duplicate = Setting.new(key: "UNIQUE_KEY", value: "value2")
    assert_not duplicate.valid?
    assert_includes duplicate.errors[:key], "has already been taken"
  end
end
