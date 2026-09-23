# frozen_string_literal: true

class Coupon < ApplicationRecord
  DISCOUNT_TYPES = %w[percentage flat].freeze
  STATUSES       = %w[active inactive expired].freeze

  has_many :bookings, dependent: :nullify

  validates :code,           presence: true, uniqueness: { case_sensitive: false },
                             length: { maximum: 30 }
  validates :discount_type,  presence: true, inclusion: { in: DISCOUNT_TYPES }
  validates :discount_value, presence: true, numericality: { greater_than: 0 }
  validates :min_order_amount, numericality: { greater_than_or_equal_to: 0 }
  validates :status,         presence: true, inclusion: { in: STATUSES }
  validates :usage_count,    numericality: { greater_than_or_equal_to: 0, only_integer: true }

  scope :active,   -> { where(status: "active") }
  scope :valid_now, -> {
    active
      .where("valid_from IS NULL OR valid_from <= ?", Time.current)
      .where("valid_until IS NULL OR valid_until >= ?", Time.current)
  }

  before_validation { self.code = code.to_s.strip.upcase }

  # Server-side discount calculation — never trust client amounts.
  def apply_to(order_total)
    return 0.0 if order_total < min_order_amount
    raw = discount_type == "percentage" ? order_total * discount_value / 100 : discount_value
    max_discount ? [raw, max_discount].min : raw
  end

  # Discount on on-site extra charges — same rate, no min_order guard.
  def apply_to_extra(amount, _discount_amount = nil)
    return 0.0 if amount.to_f <= 0
    discount_type == "percentage" ? (amount.to_f * discount_value / 100).round(2) : [discount_value.to_f, amount.to_f].min
  end

  def redeemable?
    return false unless status == "active"
    return false if valid_from  && Time.current < valid_from
    return false if valid_until && Time.current > valid_until
    return false if usage_limit && usage_count >= usage_limit
    true
  end

  def valid_for?(order_total)
    redeemable? && order_total.to_f >= min_order_amount.to_f
  end

  def active?
    status == "active"
  end

  def expired?
    status == "expired" || (valid_until.present? && Time.current > valid_until)
  end

  def display_discount
    discount_type == "percentage" ? "#{discount_value.to_i}% OFF" : "₹#{discount_value.to_i} OFF"
  end

  def display_type
    discount_type == "percentage" ? "Percentage" : "Flat Amount"
  end

  def display_min_order
    min_order_amount.to_f > 0 ? "₹#{min_order_amount.to_i}" : "No Min Spend"
  end

  def display_max_discount
    max_discount.present? ? "₹#{max_discount.to_i}" : "No Cap"
  end

  def display_usage
    if usage_limit.present?
      "#{usage_count} / #{usage_limit}"
    else
      "#{usage_count} / ∞"
    end
  end

  def display_valid_until
    valid_until ? valid_until.strftime("%d %b %Y") : "No Expiry"
  end

  def display_valid_from
    valid_from ? valid_from.strftime("%d %b %Y") : "Immediate"
  end

  def display_tag
    if code.include?("WELCOME")
      "NEW USER"
    elsif discount_type == "percentage" && discount_value >= 30
      "MEGA DEAL"
    elsif discount_type == "percentage"
      "PERCENTAGE"
    elsif discount_value >= 250
      "FESTIVE"
    elsif code.include?("SPA") || code.include?("BRIDAL")
      "PACKAGE"
    else
      "SPECIAL"
    end
  end

  def badge_color
    case display_tag
    when "NEW USER"   then "#db2777" # Pink
    when "MEGA DEAL"  then "#7c3aed" # Purple
    when "FESTIVE"    then "#ea580c" # Amber/Orange
    when "PERCENTAGE" then "#0369a1" # Blue
    when "PACKAGE"    then "#15803d" # Forest Green
    else "#059669"                   # Emerald
    end
  end

  # Backward-compatible hash accessor
  def [](key)
    case key.to_sym
    when :code         then code
    when :type         then display_type
    when :value        then display_discount
    when :min_order    then display_min_order
    when :uses         then usage_count
    when :max_uses     then usage_limit || "∞"
    when :valid_until  then display_valid_until
    when :status       then status
    when :id           then id
    else super
    end
  end
end
