# frozen_string_literal: true

require "cloudinary"

class CloudinaryService
  class << self
    # Ensure credentials are configured even if container started with empty env vars
    def ensure_configured!
      if Cloudinary.config.cloud_name.blank? && Cloudinary.config.cloudinary_url.blank?
        if defined?(Dotenv)
          dotenv_file = Rails.root.join(".env")
          Dotenv.overload(dotenv_file) if File.exist?(dotenv_file)
        end

        cloud_name = ENV["CLOUDINARY_CLOUD_NAME"].presence || "ki5nokty"
        api_key    = ENV["CLOUDINARY_API_KEY"].presence || "335139946867126"
        api_secret = ENV["CLOUDINARY_API_SECRET"].presence || "oVXjxRyYaSzuGVBYC8tXaC2_MnA"

        Cloudinary.config do |config|
          config.cloud_name = cloud_name
          config.api_key    = api_key
          config.api_secret = api_secret
          config.secure     = true
        end
      end
    end

    # Check if Cloudinary credentials are configured and available
    def enabled?
      ensure_configured!
      return false if Rails.env.test? && !ENV["CLOUDINARY_TEST_ENABLED"]

      Cloudinary.config.cloudinary_url.present? ||
        (Cloudinary.config.cloud_name.present? &&
         Cloudinary.config.api_key.present? &&
         Cloudinary.config.api_secret.present?)
    end

    # Uploads a file, path, or IO to Cloudinary
    # Returns a Hash: { url: "https://...", public_id: "..." } or nil on failure
    def upload(file_or_path, folder: "beauty_connect")
      return nil unless enabled?
      return nil if file_or_path.blank?

      target = if file_or_path.respond_to?(:tempfile) && file_or_path.tempfile.present?
                 file_or_path.tempfile.path
               elsif file_or_path.respond_to?(:path) && file_or_path.path.present?
                 file_or_path.path
               else
                 file_or_path
               end

      result = Cloudinary::Uploader.upload(
        target,
        folder: folder,
        resource_type: "image"
      )

      {
        url: result["secure_url"].presence || result["url"],
        public_id: result["public_id"]
      }
    rescue StandardError => e
      Rails.logger.error("[CloudinaryService] Upload failed for #{file_or_path.inspect}: #{e.message}")
      nil
    end

    # Extracts public_id from any Cloudinary image URL
    # Examples:
    #   https://res.cloudinary.com/demo/image/upload/v12345/beauty_connect/services/abc.jpg -> "beauty_connect/services/abc"
    #   https://res.cloudinary.com/demo/image/upload/beauty_connect/categories/xyz.png -> "beauty_connect/categories/xyz"
    def extract_public_id(url)
      return nil if url.blank?
      return nil unless url.to_s.include?("cloudinary.com")

      match = url.to_s.match(%r{/image/upload/(?:v\d+/)?([^\.\?#]+)})
      match ? match[1] : nil
    end

    # Destroys an asset on Cloudinary using its public_id
    def destroy(public_id)
      return nil unless enabled?
      return nil if public_id.blank?

      res = Cloudinary::Uploader.destroy(public_id, invalidate: true)
      Rails.logger.info("[CloudinaryService] Destroyed asset '#{public_id}': #{res.inspect}")
      res
    rescue StandardError => e
      Rails.logger.error("[CloudinaryService] Destroy failed for '#{public_id}': #{e.message}")
      nil
    end

    # Destroys an asset on Cloudinary given its full URL
    def destroy_by_url(url)
      return nil if url.blank?

      public_id = extract_public_id(url)
      return nil if public_id.blank?

      destroy(public_id)
    end
  end
end
