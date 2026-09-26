# frozen_string_literal: true

require_relative "concerns/attachable_image"

class Category < ApplicationRecord
  extend FriendlyId
  friendly_id :name, use: :slugged

  has_many :subcategories, -> { ordered }, dependent: :destroy, inverse_of: :category
  has_many :sub_categories, -> { ordered }, class_name: "Subcategory", foreign_key: :category_id, dependent: :destroy
  has_many :services, through: :subcategories

  has_one_attached :image
  include AttachableImage

  STATUSES = %w[active inactive].freeze

  validates :name,   presence: true, length: { maximum: 120 }
  validates :status, inclusion: { in: STATUSES }
  validate  :image_content_type
  validate  :image_file_size
  validate  :validate_image_url_format

  scope :active,    -> { where(status: "active") }
  scope :featured,  -> { where(featured: true) }
  scope :top_level, -> { all }
  scope :ordered,   -> { order(:position, :name) }

  # -------------------------------------------------------------------------
  # Public API helpers
  # -------------------------------------------------------------------------

  def active?
    status == "active"
  end

  CATEGORY_FALLBACK_IMAGES = {
    "facial-cleanup"  => "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=800&q=80",
    "bleach-de-tan"   => "https://images.unsplash.com/photo-1576426863848-c21f53c60b19?auto=format&fit=crop&w=800&q=80",
    "salon-for-women" => "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=800&q=80",
    "salon-for-men"   => "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=800&q=80",
    "threading"       => "https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?auto=format&fit=crop&w=800&q=80",
    "spa-wellness"    => "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80",
    "waxing"          => "https://images.unsplash.com/photo-1519699047748-de8e457a634e?auto=format&fit=crop&w=800&q=80",
    "home-cleaning"   => "https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=800&q=80",
    "manicure"        => "https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&w=800&q=80",
    "pedicure"        => "https://images.unsplash.com/photo-1519014816548-bf5fe059798b?auto=format&fit=crop&w=800&q=80",
    "body-care"       => "https://images.unsplash.com/photo-1515377905703-c4788e51af15?auto=format&fit=crop&w=800&q=80",
    "hair"            => "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80",
    "massage-spa"     => "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=800&q=80"
  }.freeze

  # -------------------------------------------------------------------------
  # Public Directory & SSR Helpers (Fat Model)
  # -------------------------------------------------------------------------

  def self.for_directory
    active.ordered.includes(subcategories: :services)
  end

  def self.featured_for_directory(limit = 3)
    cats = for_directory
    cats.select(&:featured?).presence || cats.first(limit)
  end

  def active_services_count
    subcategories.sum { |s| s.services.select(&:active?).size }
  end

  def subcategory_pills
    subcategories.active.ordered.includes(:services)
  end

  def services_for_sub(sub_id = nil)
    if sub_id.present?
      active_sub = subcategories.find { |s| s.id.to_s == sub_id.to_s }
      target = active_sub ? active_sub.services : services
    else
      target = services
    end
    target.active.ordered.includes(:subcategory, subcategory: :category)
  end

  # Returns the public URL for the image (Cloudinary CDN or ActiveStorage blob URL).
  # Reads from the database image_url column directly, or falls back to ActiveStorage or curated fallback.
  def image_url(variant: :banner)
    raw = read_attribute(:image_url).presence
    raw = nil if raw && (raw.include?("1f419b48b598") || raw.include?("1f48643807a0"))

    candidate = raw ||
      (image.attached? ? (image.url rescue nil) : nil).presence ||
      CATEGORY_FALLBACK_IMAGES[slug] ||
      CATEGORY_FALLBACK_IMAGES[name.to_s.parameterize]

    ImageUrlResolver.resolve(candidate, type: :category, record: self)
  end

  def service_count
    services.active.count
  end

  def self.ransackable_attributes(_auth_object = nil)
    %w[name status featured created_at]
  end

  private

  def image_content_type
    return unless image.attached?
    unless image.content_type.in?(%w[image/jpeg image/png image/webp image/gif])
      errors.add(:image, "must be a JPEG, PNG, WebP, or GIF")
    end
  end

  def image_file_size
    return unless image.attached?
    if image.byte_size > 5.megabytes
      errors.add(:image, "must be smaller than 5 MB")
    end
  end

  def validate_image_url_format
    raw = read_attribute(:image_url)
    return if raw.blank?

    if ImageUrlResolver.known_invalid?(raw) || !ImageUrlResolver.valid_url?(raw)
      errors.add(:image_url, "must be a valid, active web URL and not a broken external link")
    end
  end
end
