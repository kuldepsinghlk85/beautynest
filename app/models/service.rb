# frozen_string_literal: true

require_relative "concerns/attachable_image"

class Service < ApplicationRecord
  extend FriendlyId
  friendly_id :full_slug_candidate, use: :slugged

  belongs_to :subcategory
  has_one    :category, through: :subcategory
  has_many   :service_city_prices, dependent: :destroy
  has_many   :cities,              through: :service_city_prices
  has_many   :service_tier_prices, dependent: :destroy
  has_many   :worker_tiers,        through: :service_tier_prices
  has_many   :service_products,    dependent: :destroy
  has_many   :products,            through: :service_products

  has_many   :booking_items, dependent: :nullify
  has_many   :bookings, through: :booking_items
  has_many   :favorites, dependent: :destroy
  has_many   :reviews, dependent: :nullify

  has_one_attached :image
  include AttachableImage

  STATUSES = %w[active inactive].freeze
  TAGS     = %w[facial korean-glow mani-padi].freeze

  before_validation :normalize_tag

  validates :name,             presence: true, length: { maximum: 150 }
  validates :tag,              presence: true, inclusion: { in: TAGS }
  validates :base_price,       presence: true, numericality: { greater_than_or_equal_to: 0 }
  validates :duration_minutes, presence: true, numericality: { greater_than: 0 }
  validates :status,           inclusion: { in: STATUSES }
  validates :subcategory_id,   presence: true
  validate  :image_content_type
  validate  :image_file_size
  validate  :validate_image_url_format

  scope :active,         -> { where(status: "active") }
  scope :featured,       -> { where(featured: true) }
  scope :by_tag,         ->(t) { where(tag: t.to_s.strip.downcase) if t.present? }
  scope :ordered,        -> { order(:position, :name) }
  scope :by_price_asc,   -> { order(:base_price) }
  scope :by_price_desc,  -> { order(base_price: :desc) }
  scope :by_duration,    -> { order(:duration_minutes) }
  scope :by_newest,      -> { order(created_at: :desc) }

  # -------------------------------------------------------------------------
  # Backwards compatibility helpers for Category & resilient accessors
  # -------------------------------------------------------------------------

  def subcategory_id
    if has_attribute?(:subcategory_id)
      read_attribute(:subcategory_id)
    else
      subcategory&.id
    end
  end

  def subcategory_id=(val)
    if has_attribute?(:subcategory_id)
      write_attribute(:subcategory_id, val)
    else
      self.subcategory = Subcategory.find_by(id: val)
    end
  end

  def category_id
    subcategory&.category_id
  end

  def category_id=(cid)
    return if cid.blank?
    if subcategory.nil? || subcategory.category_id != cid
      sub = Subcategory.where(category_id: cid).order(:position, :name).first
      if sub.nil?
        cat = Category.find_by(id: cid)
        sub = cat.subcategories.create!(name: "General", slug: "#{cat.slug}-general-#{SecureRandom.hex(3)}", status: "active") if cat
      end
      self.subcategory = sub if sub
    end
  end

  def category=(cat)
    return if cat.nil?
    sub = cat.subcategories.order(:position, :name).first
    if sub.nil?
      sub = cat.subcategories.create!(name: "General", slug: "#{cat.slug}-general-#{SecureRandom.hex(3)}", status: "active")
    end
    self.subcategory = sub
  end

  def tag_label
    case tag
    when "facial"      then "Facial"
    when "korean-glow" then "Korean Glow"
    when "mani-padi"   then "Mani-Pedi"
    else tag.to_s.titleize
    end
  end

  def active?
    status == "active"
  end

  def benefits_text
    Array(benefits).join("\n")
  end

  def benefits_text=(text)
    self.benefits = text.to_s.lines.map(&:strip).reject(&:blank?)
  end

  def process_text
    Array(process).join("\n")
  end

  def process_text=(text)
    self.process = text.to_s.lines.map(&:strip).reject(&:blank?)
  end

  # -------------------------------------------------------------------------
  # Pricing helpers (Default & City-wise)
  # -------------------------------------------------------------------------

  # Default price customer pays when no city override applies
  def effective_price
    discount_price.presence || base_price
  end

  def price
    effective_price
  end

  def duration
    duration_minutes
  end

  def [](key)
    case key.to_sym
    when :price    then effective_price
    when :duration then duration_minutes
    when :name     then name
    when :id       then id
    else super(key.to_s)
    end
  end

  def on_sale?
    discount_price.present? && discount_price < base_price
  end

  def display_price
    "₹#{effective_price.to_i}"
  end

  def display_base_price
    "₹#{base_price.to_i}"
  end

  def service_city_price_for(city_or_id)
    c_id = city_or_id.is_a?(City) ? city_or_id.id : city_or_id
    return nil if c_id.blank?
    if service_city_prices.loaded?
      service_city_prices.find { |p| p.city_id == c_id && p.status == "active" }
    else
      service_city_prices.active.find_by(city_id: c_id)
    end
  end

  def base_price_for_city(city_or_id)
    scp = service_city_price_for(city_or_id)
    scp&.active? ? scp.base_price : base_price
  end

  def discount_price_for_city(city_or_id)
    scp = service_city_price_for(city_or_id)
    scp&.active? ? scp.discount_price : discount_price
  end

  def effective_price_for_city(city_or_id)
    scp = service_city_price_for(city_or_id)
    scp&.active? ? scp.effective_price : effective_price
  end

  def display_price_for_city(city_or_id)
    "₹#{effective_price_for_city(city_or_id).to_i}"
  end

  # Returns the public URL for the service image (Cloudinary CDN, ActiveStorage, or application fallback).
  def image_url(variant: :card)
    raw = has_attribute?(:image_url) ? read_attribute(:image_url) : nil
    ImageUrlResolver.resolve(raw, type: :service, record: self)
  end

  # -------------------------------------------------------------------------
  # API serialisation
  # -------------------------------------------------------------------------

  def average_rating
    avg = reviews.average(:rating)
    avg ? avg.to_f.round(1) : 0.0
  end

  def reviews_count
    reviews.count
  end

  def about
    has_attribute?(:about) ? read_attribute(:about) : nil
  end

  def benefits
    has_attribute?(:benefits) ? (read_attribute(:benefits) || []) : []
  end

  def process
    has_attribute?(:process) ? (read_attribute(:process) || []) : []
  end

  def about=(val)
    write_attribute(:about, val) if has_attribute?(:about)
  end

  def benefits=(val)
    write_attribute(:benefits, val) if has_attribute?(:benefits)
  end

  def process=(val)
    write_attribute(:process, val) if has_attribute?(:process)
  end

  def display_about
    (has_attribute?(:about) ? read_attribute(:about).presence : nil) || description.presence || "Indulge in a premium #{name.downcase} delivered at your doorstep by certified specialists using hygienic, sanitized products."
  end

  def display_benefits
    if benefits.present? && benefits.is_a?(Array) && benefits.any?
      benefits
    else
      [
        "Instant natural radiance and deep skin nourishment",
        "Professional single-use sealed hygiene kit",
        "Customized care tailored by certified beauty experts",
        "Stress-relieving facial acupressure and gentle massage"
      ]
    end
  end

  def display_process
    if process.present? && process.is_a?(Array) && process.any?
      process
    else
      [
        "1. Consultation & Skin / Hair Analysis",
        "2. Pre-service preparation & sanitisation",
        "3. Core treatment application & gentle massage",
        "4. Soothing finishing serum & post-care guidance"
      ]
    end
  end

  def as_json_api(city: nil, include_details: false)
    c_override = city.present? ? service_city_price_for(city) : nil
    cur_base   = c_override&.active? ? c_override.base_price : base_price
    cur_disc   = c_override&.active? ? c_override.discount_price : discount_price
    cur_eff    = cur_disc.presence || cur_base

    cur_avg_rating = average_rating
    cur_rev_count  = reviews_count

    data = {
      id:                id,
      name:              name,
      slug:              slug,
      description:       description,
      subcategory:       { id: subcategory_id, name: subcategory&.name, slug: subcategory&.slug },
      category:          { id: category_id, name: category&.name, slug: category&.slug },
      base_price:        cur_base.to_s,
      discount_price:    cur_disc&.to_s,
      effective_price:   cur_eff.to_s,
      display_price:     "₹#{cur_eff.to_i}",
      on_sale:           cur_disc.present? && cur_disc < cur_base,
      has_city_override: c_override&.active? || false,
      duration_minutes:  duration_minutes,
      tag:               tag,
      tag_label:         tag_label,
      featured:          featured,
      status:            status,
      image_url:         image_url,
      rating:            { average: cur_avg_rating, count: cur_rev_count },
      average_rating:    cur_avg_rating,
      reviews_count:     cur_rev_count,
      created_at:        created_at
    }

    if include_details
      data[:about]    = display_about
      data[:benefits] = display_benefits
      data[:process]  = display_process
      data[:reviews]  = reviews.includes(:customer).recent.limit(50).map do |r|
        {
          id:            r.id,
          customer_name: r.customer_name,
          rating:        r.rating,
          comment:       r.comment,
          created_at:    r.created_at
        }
      end
    end

    data
  end

  private

  def normalize_tag
    self.tag = tag.presence || "facial"
    t = tag.to_s.strip.downcase.tr("_", "-")
    t = "mani-padi" if t == "mani-pedi"
    self.tag = t
  end

  def full_slug_candidate
    [subcategory&.category&.name, subcategory&.name, name].compact.join(" ")
  end

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
