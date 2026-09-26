# frozen_string_literal: true

class WorkerProfile < ApplicationRecord
  belongs_to :user
  belongs_to :city, optional: true
  belongs_to :worker_tier, optional: true

  DAYS_OF_WEEK = %w[Monday Tuesday Wednesday Thursday Friday Saturday Sunday].freeze
  DEFAULT_DAYS = %w[Monday Tuesday Wednesday Thursday Friday Saturday].freeze
  DEFAULT_TIME_SLOT = "Full Day (Throughout the Day)".freeze

  KYC_STATUSES = %w[approved pending rejected].freeze
  SKILL_OPTIONS = [
    "Korean Glass Skin", "O3+ Whitening", "O3+ Bridal Glow",
    "Diamond Facial", "Bridal HD Makeup", "Aromatherapy Spa",
    "Hair Spa", "Hair Botox", "Global Highlights", "Keratin Treatment",
    "Rica Waxing", "Rica Brazilian Wax", "Waxing & Threading",
    "Body Polishing", "Nail Art", "Deluxe Mani-Pedi",
    "Saree Draping", "Massage Therapy"
  ].freeze

  DAY_CODES = {
    "Monday" => "Mo",
    "Tuesday" => "Tu",
    "Wednesday" => "We",
    "Thursday" => "Th",
    "Friday" => "Fr",
    "Saturday" => "Sa",
    "Sunday" => "Su"
  }.freeze

  validates :experience_years,  numericality: { greater_than_or_equal_to: 0, only_integer: true }
  validates :rating_avg,        numericality: { greater_than_or_equal_to: 0, less_than_or_equal_to: 5 }
  validates :rating_count,      numericality: { greater_than_or_equal_to: 0, only_integer: true }
  validates :time_slot,         presence: true
  validates :aadhaar_number,    presence: true, format: { with: /\A\d{12}\z/, message: "must be exactly 12 digits" }
  validates :kyc_status,        inclusion: { in: KYC_STATUSES }, allow_nil: false
  validate  :validate_available_days

  before_validation :normalize_availability_attributes

  scope :available, -> { where(is_available: true) }
  scope :available_today, -> {
    day = Time.current.strftime("%A")
    where(is_available: true).where("available_days ? :day", day: day)
  }

  def self.rolling_week(start_date = Date.current)
    base_date = start_date.to_date
    0.upto(6).map { |i| (base_date + i).strftime("%A") }
  end

  def rolling_schedule(start_date = Date.current)
    base_date = start_date.to_date
    today_name = Date.current.strftime("%A")
    self.class.rolling_week(base_date).each_with_index.map do |day_name, idx|
      day_date = base_date + idx
      {
        day: day_name,
        short: DAY_CODES[day_name] || day_name[0, 2],
        date: day_date,
        is_today: day_name.casecmp?(today_name),
        active: available_on_day?(day_name)
      }
    end
  end

  def normalized_days
    Array(available_days).map(&:to_s).map(&:strip).reject(&:blank?)
  end

  def available_on_day?(day_name)
    normalized_days.any? { |d| d.casecmp?(day_name.to_s.strip) }
  end

  def available_today?
    return false unless is_available?
    return false if user.present? && !user.active?

    available_on_day?(Time.current.strftime("%A"))
  end

  def serving_city_name
    city&.name.presence || user&.city.presence || "—"
  end

  def available_days_short
    days = normalized_days
    return "No days selected" if days.empty?
    return "All week (7 days)" if days.length == 7

    days.map { |d| d[0, 3] }.join(", ")
  end

  def time_slot_label
    time_slot.presence || DEFAULT_TIME_SLOT
  end

  # Recalculate rating from reviews — call after each new review is created.
  def refresh_rating!(new_rating)
    total = rating_avg * rating_count + new_rating
    new_rating_count = rating_count + 1
    new_rating_avg = (total / new_rating_count).round(2)

    update_columns(
      rating_count: new_rating_count,
      rating_avg: new_rating_avg,
      updated_at: Time.current
    )
  end

  def kyc_badge_class
    case kyc_status
    when "approved" then "bg-success-lt"
    when "rejected" then "bg-danger-lt"
    else "bg-warning-lt"
    end
  end

  def kyc_label
    case kyc_status
    when "approved" then "✓ KYC Cleared"
    when "rejected" then "✗ KYC Rejected"
    else "KYC Pending"
    end
  end

  def skills_list
    Array(skills).reject(&:blank?)
  end

  def kyc_badge_class
    case kyc_status
    when "approved" then "bg-success-lt"
    when "rejected" then "bg-danger-lt"
    else "bg-warning-lt"
    end
  end

  def kyc_label
    case kyc_status
    when "approved" then "✓ KYC Cleared"
    when "rejected" then "✗ KYC Rejected"
    else "KYC Pending"
    end
  end

  def skills_list
    Array(skills).reject(&:blank?)
  end

  private

  def normalize_availability_attributes
    self.time_slot = DEFAULT_TIME_SLOT if time_slot.blank?
    if available_days.blank?
      self.available_days = DEFAULT_DAYS
    elsif available_days.is_a?(Array)
      self.available_days = available_days.map(&:to_s).map(&:strip).reject(&:blank?).uniq
    end
    if worker_tier_id.blank?
      self.worker_tier ||= WorkerTier.find_by(slug: "bronze") || WorkerTier.order(:position).first
    end
  end

  def tier_name
    worker_tier&.name || "Bronze"
  end

  def tier_slug
    worker_tier&.slug || "bronze"
  end

  def validate_available_days
    days = normalized_days
    invalid_days = days.reject { |d| DAYS_OF_WEEK.any? { |valid| valid.casecmp?(d) } }
    if invalid_days.any?
      errors.add(:available_days, "contains invalid days: #{invalid_days.join(', ')}")
    end
  end
end

