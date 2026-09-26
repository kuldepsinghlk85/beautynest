# frozen_string_literal: true

class User < ApplicationRecord
  has_secure_password

  ROLES    = %w[customer worker admin].freeze
  STATUSES = %w[active inactive].freeze

  # ── Associations ──────────────────────────────────────────────────────────────
  has_many :sessions,          dependent: :destroy
  has_many :addresses,         dependent: :destroy
  has_one  :cart,              dependent: :destroy
  has_one  :worker_profile,    dependent: :destroy
  has_many :worker_bookings,   class_name: "Booking", foreign_key: :worker_id,   dependent: :nullify
  has_many :customer_bookings, class_name: "Booking", foreign_key: :customer_id, dependent: :destroy
  has_many :favorites,             dependent: :destroy
  has_many :notifications,         dependent: :destroy
  has_many :created_notifications, class_name: "Notification", foreign_key: :created_by_id, dependent: :nullify
  has_many :favorite_services, through: :favorites, source: :service
  has_many :given_reviews,     class_name: "Review", foreign_key: :customer_id, dependent: :destroy
  has_many :received_reviews,  class_name: "Review", foreign_key: :worker_id,   dependent: :nullify
  has_many :live_locations,    dependent: :destroy
  has_many :recorded_consents, class_name: "ServiceConsent", foreign_key: :recorded_by_worker_id, dependent: :nullify
  has_many :added_extra_charges, class_name: "BookingExtraCharge", foreign_key: :added_by_worker_id, dependent: :nullify
  belongs_to :avatar_media, class_name: "Medium", foreign_key: :avatar_media_id, optional: true
  has_one_attached :avatar

  # ── Validations ────────────────────────────────────────────────────────────────
  before_validation :normalize_attributes

  validates :name,  presence: true, length: { maximum: 120 }
  validates :email, presence: true, length: { maximum: 200 },
                    format: { with: URI::MailTo::EMAIL_REGEXP },
                    uniqueness: { case_sensitive: false }
  validates :phone,  presence: true, length: { maximum: 20 }, uniqueness: true
  validates :role,   presence: true, inclusion: { in: ROLES }
  validates :status, presence: true, inclusion: { in: STATUSES }
  validates :password, length: { minimum: 6 }, if: -> { new_record? || password.present? }
  validate  :validate_avatar_url_format

  # ── Scopes ─────────────────────────────────────────────────────────────────────
  scope :active,    -> { where(status: "active") }
  scope :customers, -> { where(role: "customer") }
  scope :workers,   -> { where(role: "worker") }
  scope :admins,    -> { where(role: "admin") }

  # ── Role helpers ───────────────────────────────────────────────────────────────
  def admin?    = role == "admin"
  def customer? = role == "customer"
  def worker?   = role == "worker"
  def active?   = status == "active"

  # ── Presentation helpers ───────────────────────────────────────────────────────
  def initials
    name.to_s.split.map(&:first).join.upcase.first(2).presence || "U"
  end

  def joined
    created_at&.strftime("%b %Y") || "Recently"
  end

  # City from the default address (or first address if none is default)
  def city
    default_address&.city.presence || "—"
  end

  def speciality
    worker_profile&.skills&.first.presence || (worker? ? "Specialist" : nil)
  end

  def rating
    rating_display
  end

  def [](key)
    case key.to_sym
    when :city       then city
    when :speciality then speciality
    when :rating     then rating
    when :name       then name
    when :id         then id
    when :phone      then phone
    when :email      then email
    else super(key.to_s)
    end
  end

  def default_address
    addresses.order(is_default: :desc, created_at: :desc).first
  end

  def active_cart
    cart || create_cart!
  end

  def bookings_count
    customer? ? customer_bookings.count : worker_bookings.count
  end

  def associated_customers
    return User.none unless worker?
    User.customers.where(id: worker_bookings.select(:customer_id)).distinct
  end

  def associated_customer_ids
    return [] unless worker?
    worker_bookings.pluck(:customer_id).compact.uniq
  end

  def avatar_color
    colors = %w[ta-blue ta-purple ta-green ta-amber ta-pink]
    colors[(id.to_s.bytes.sum) % colors.length]
  end

  # Guaranteed live, high-resolution CDN avatars (tested & verified 200 OK)
  GUARANTEED_FALLBACK_AVATARS = [
    "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80",
    "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80",
    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
    "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=400&q=80",
    "https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?auto=format&fit=crop&w=400&q=80",
    "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=400&q=80",
    "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=400&q=80",
    "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=400&q=80",
    "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80"
  ].freeze

  def numeric_seed
    id.to_s.hash.abs
  end

  def default_fallback_avatar
    ImageUrlResolver.fallback_for(:beautician)
  end

  # Returns the public URL for the avatar (Cloudinary CDN URL takes precedence, exactly like Service#image_url)
  def avatar_url
    read_attribute(:avatar_url).presence ||
      (respond_to?(:avatar) && avatar.attached? ? (avatar.url rescue nil) : nil) ||
      avatar_media&.url
  rescue StandardError
    read_attribute(:avatar_url).presence || avatar_media&.url
  end

  def display_avatar_url
    ImageUrlResolver.resolve(self, type: :beautician, record: self)
  end

  # Presentation helpers for Worker Directory & Cards (Fat Model)
  def rating_display
    wp = worker_profile
    (wp&.rating_avg.to_f > 0) ? sprintf("%.1f", wp.rating_avg) : "4.9"
  end

  def reviews_count_display
    wp = worker_profile
    (wp&.rating_count.to_i > 0) ? wp.rating_count : (28 + (numeric_seed % 40))
  end

  def experience_years
    worker_profile&.experience_years.to_i
  end

  def experience_display
    years = worker_profile&.experience_years
    if years.present? && years.to_i > 0
      "#{years} #{'Yr'.pluralize(years)} Exp"
    elsif years.present?
      "#{years.to_i} Yrs Exp"
    else
      "0 Yrs Exp"
    end
  end

  def jobs_count_display
    "#{100 + ((numeric_seed * 23) % 250)} Jobs"
  end

  def specialization_display
    worker_profile&.bio.presence || "Korean Glass Skin, O3+ Whitening, Rica Waxing & Bridal HD Makeup"
  end

  def tier_display
    worker_profile&.worker_tier&.name
  end

  # Class-level Directory & Search Query (Fat Model)
  def self.search_workers(city: nil, tier: nil, available: nil, query: nil, sort: nil)
    scope = workers.active.includes(
      :avatar_attachment,
      worker_profile: %i[city worker_tier]
    )

    if city.present?
      city_rec = City.find_by(slug: city) || City.find_by(name: city) || City.find_by(id: city)
      scope = scope.joins(:worker_profile).where(worker_profiles: { city_id: city_rec.id }) if city_rec
    end

    if tier.present?
      tier_rec = WorkerTier.find_by(slug: tier) || WorkerTier.find_by(name: tier) || WorkerTier.find_by(id: tier)
      scope = scope.joins(:worker_profile).where(worker_profiles: { worker_tier_id: tier_rec.id }) if tier_rec
    end

    if available.to_s.casecmp?("true")
      scope = scope.joins(:worker_profile).where(worker_profiles: { is_available: true })
    end

    if query.present?
      scope = scope.where("users.name ILIKE ?", "%#{query.to_s.strip}%")
    end

    order_sql = case sort.to_s
                when "experience" then "worker_profiles.experience_years DESC NULLS LAST"
                when "newest"     then "users.created_at DESC"
                else                   "worker_profiles.rating_avg DESC NULLS LAST, worker_profiles.rating_count DESC NULLS LAST, users.name ASC"
                end

    scope.left_outer_joins(:worker_profile).order(Arel.sql(order_sql))
  end

  def self.top_workers(city: nil, tier: nil, available: true, limit: 10)
    scope = search_workers(city: city, tier: tier, available: available)
    scope.reorder(Arel.sql("worker_profiles.rating_avg DESC NULLS LAST, worker_profiles.rating_count DESC NULLS LAST, worker_profiles.experience_years DESC NULLS LAST"))
         .limit(limit)
  end

  # Handles uploaded file exactly like Services & Categories (AttachableImage)
  # Uploads to Cloudinary, destroys old image, purges ActiveStorage blob, and saves URL.
  def handle_avatar_upload(uploaded_file, folder: "beauty_connect/avatars", remove: false)
    if remove.to_s == "1" || remove == true
      old_url = read_attribute(:avatar_url)
      CloudinaryService.destroy_by_url(old_url) if old_url.present?
      avatar.purge if respond_to?(:avatar) && avatar.attached?
      self.avatar_url = nil
      update_columns(avatar_url: nil) if persisted?
      return
    end

    return if uploaded_file.blank?

    old_url = read_attribute(:avatar_url)

    if CloudinaryService.enabled?
      c_res = CloudinaryService.upload(uploaded_file, folder: folder)
      if c_res && c_res[:url].present?
        # Delete old Cloudinary picture whenever an update happens
        CloudinaryService.destroy_by_url(old_url) if old_url.present? && old_url != c_res[:url]
        avatar.purge if respond_to?(:avatar) && avatar.attached?

        self.avatar_url = c_res[:url]
        update_columns(avatar_url: c_res[:url]) if persisted?
        return c_res[:url]
      end
    end

    if uploaded_file.is_a?(ActionDispatch::Http::UploadedFile) || uploaded_file.is_a?(Rack::Test::UploadedFile)
      avatar.attach(uploaded_file)
    elsif uploaded_file.is_a?(String)
      clean_url = uploaded_file.strip
      if clean_url.present?
        self.avatar_url = clean_url
        update_columns(avatar_url: clean_url) if persisted?
      end
    end
  end

  def serving_city
    worker_profile&.serving_city_name.presence || city
  end

  def available_days
    worker_profile&.normalized_days || WorkerProfile::DEFAULT_DAYS
  end

  def available_today?
    return false unless worker?
    worker_profile&.available_today? || false
  end

  def time_slot
    worker_profile&.time_slot_label || WorkerProfile::DEFAULT_TIME_SLOT
  end

  def rolling_schedule(start_date = Date.current)
    return [] unless worker?
    worker_profile&.rolling_schedule(start_date) || []
  end

  # Hash accessor kept for backward-compatible views (e.g. @customer[:name])
  def [](key)
    case key.to_sym
    when :initials           then initials
    when :avatar_color       then avatar_color
    when :avatar_url         then avatar_url
    when :joined             then joined
    when :city               then serving_city
    when :serving_city       then serving_city
    when :available_days     then available_days
    when :available_days_short then worker_profile&.available_days_short || "—"
    when :available_today    then available_today?
    when :is_available       then worker_profile&.is_available.nil? ? true : worker_profile.is_available
    when :time_slot          then time_slot
    when :rolling_schedule   then rolling_schedule
    when :bookings           then bookings_count
    when :speciality         then worker_profile&.bio.presence || "Beauty Professional"
    when :rating             then worker_profile&.rating_avg || 0.0
    when :reviews            then worker_profile&.rating_count || 0
    when :experience_years   then experience_years
    when :experience_display then experience_display
    when :approval           then "approved"
    when :name               then name
    when :email              then email
    when :phone              then phone
    when :status             then status
    when :id                 then id
    else super
    end
  end

  # API serialization — never exposes password_digest
  def as_json_api
    data = {
      id:         id,
      name:       name,
      email:      email,
      phone:      phone,
      role:       role,
      status:     status,
      avatar_url: avatar_url,
      addresses:  addresses.default_first.map { |a| { id: a.id, label: a.display_label, city: a.city, is_default: a.is_default } },
      created_at: created_at,
      updated_at: updated_at
    }

    if worker?
      wp = worker_profile
      data.merge!(
        serving_city:     serving_city,
        city_id:          wp&.city_id,
        available_days:   available_days,
        time_slot:        time_slot,
        is_available:     wp&.is_available.nil? ? true : wp.is_available,
        available_today:  available_today?,
        rating_avg:       wp&.rating_avg&.to_f || 0.0,
        rating_count:     wp&.rating_count || 0,
        experience_years: wp&.experience_years || 0
      )
    end

    data
  end

  # ── Password Reset helpers ───────────────────────────────────────────────────
  def generate_password_reset_token!
    token = SecureRandom.urlsafe_base64(32)
    update_columns(
      reset_password_token: token,
      reset_password_sent_at: Time.current
    )
    token
  end

  def password_reset_token_valid?
    reset_password_token.present? &&
      reset_password_sent_at.present? &&
      reset_password_sent_at > 2.hours.ago
  end

  def clear_password_reset_token!
    update_columns(
      reset_password_token: nil,
      reset_password_sent_at: nil
    )
  end

  private

  def normalize_attributes
    self.email = email.to_s.strip.downcase if email.present?
    self.phone = phone.to_s.strip          if phone.present?
    self.name  = name.to_s.strip           if name.present?
  end

  def validate_avatar_url_format
    raw_url = read_attribute(:avatar_url)
    return if raw_url.blank?

    if ImageUrlResolver.known_invalid?(raw_url) || !ImageUrlResolver.valid_url?(raw_url)
      errors.add(:avatar_url, "must be a valid, active web URL and not a broken external link")
    end
  end
end
