# frozen_string_literal: true

require "open-uri"

module AttachableImage
  extend ActiveSupport::Concern

  included do
    attr_accessor :image_url_input, :remove_image

    before_save :sync_image_url_from_attachment
    after_destroy_commit :cleanup_cloudinary_image
  end

  # Cleans up Cloudinary asset and ActiveStorage attachment when record is destroyed
  def cleanup_cloudinary_image
    url_to_destroy = read_attribute(:image_url)
    CloudinaryService.destroy_by_url(url_to_destroy) if url_to_destroy.present?
    image.purge if image.attached?
  rescue StandardError => e
    Rails.logger.error("[AttachableImage] Error during cleanup_cloudinary_image: #{e.message}")
  end

  # Handles uploaded file from form: uploads to Cloudinary, destroys old image,
  # purges old ActiveStorage blob, and attaches new file.
  def handle_image_upload(uploaded_file, folder: nil, remove: false)
    folder ||= "beauty_connect/#{self.class.name.underscore.pluralize}"

    if remove.to_s == "1" || remove == true
      old_url = read_attribute(:image_url)
      CloudinaryService.destroy_by_url(old_url) if old_url.present?
      image.purge if image.attached?
      self.image_url = nil
      update_columns(image_url: nil) if persisted? && has_attribute?(:image_url)
      return
    end

    return if uploaded_file.blank?

    old_url = read_attribute(:image_url)
    CloudinaryService.destroy_by_url(old_url) if old_url.present?
    image.purge if image.attached?

    if CloudinaryService.enabled?
      c_res = CloudinaryService.upload(uploaded_file, folder: folder)
      if c_res && c_res[:url].present?
        self.image_url = c_res[:url]
        update_columns(image_url: c_res[:url]) if persisted? && has_attribute?(:image_url)
      end
    end

    image.attach(uploaded_file)
  end

  # Legacy sync method for backwards compatibility
  def sync_attached_image(uploaded_file: nil, remote_url: nil, remove: false)
    if remove.to_s == "1" || remove == true
      handle_image_upload(nil, remove: true)
    elsif uploaded_file.present?
      handle_image_upload(uploaded_file)
    elsif remote_url.present?
      attach_image_from_url(remote_url)
    end
  end

  # Attaches an image from a remote URL and updates the database image_url column.
  # Automatically purges previous attachment so no duplicate/orphaned data is stored.
  def attach_image_from_url(url)
    return if url.blank?

    uri = URI.parse(url.to_s.strip)
    unless uri.is_a?(URI::HTTP) || uri.is_a?(URI::HTTPS)
      errors.add(:image, "must be a valid web URL starting with http:// or https://")
      return false
    end

    old_url = read_attribute(:image_url)
    CloudinaryService.destroy_by_url(old_url) if old_url.present? && old_url != url
    image.purge if image.attached?

    downloaded = uri.open(
      "User-Agent" => "#{Setting.site_name}/1.0",
      read_timeout: 15,
      open_timeout: 8
    )

    clean_basename = File.basename(uri.path).to_s.split("?").first.presence || "image_#{SecureRandom.hex(4)}"
    filename = clean_basename.include?(".") ? clean_basename : "#{clean_basename}.jpg"
    content_type = downloaded.content_type.presence || "image/jpeg"

    image.attach(
      io: downloaded,
      filename: filename,
      content_type: content_type
    )

    if has_attribute?(:image_url)
      stored_url = (image.url rescue nil) || url
      self.image_url = stored_url
      update_columns(image_url: stored_url) if persisted?
    end

    true
  rescue StandardError => e
    Rails.logger.error("[AttachableImage] Failed to attach from URL '#{url}': #{e.message}")
    errors.add(:image, "could not be downloaded from URL (#{e.message})")
    false
  end

  private

  def sync_image_url_from_attachment
    return unless has_attribute?(:image_url)

    if image.attached? && self[:image_url].blank?
      url = (image.url rescue nil)
      self.image_url = url if url.present?
    end
  end
end


