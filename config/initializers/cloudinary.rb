# frozen_string_literal: true

require "cloudinary"

Cloudinary.config do |config|
  if ENV["CLOUDINARY_URL"].present?
    config.cloudinary_url = ENV["CLOUDINARY_URL"]
  else
    config.cloud_name = ENV["CLOUDINARY_CLOUD_NAME"].presence
    config.api_key    = ENV["CLOUDINARY_API_KEY"].presence
    config.api_secret = ENV["CLOUDINARY_API_SECRET"].presence
  end
  config.secure = true
end
