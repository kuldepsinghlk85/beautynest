# frozen_string_literal: true

class Booking < ApplicationRecord
  BOOKING_STATUSES = %w[pending assigned confirmed accepted rejected cancelled completed].freeze
  SERVICE_STATUSES = %w[pending in_progress completed cancelled].freeze
  STATUSES         = (BOOKING_STATUSES + SERVICE_STATUSES).uniq.freeze

  def booking_number
    has_attribute?(:booking_number) ? read_attribute(:booking_number) : nil
  end

  def booking_status
    has_attribute?(:booking_status) ? read_attribute(:booking_status) : (read_attribute(:status) || "pending")
  end

  def service_status
    has_attribute?(:service_status) ? read_attribute(:service_status) : (read_attribute(:status) || "pending")
  end

  def status
    booking_status
  end

  def status=(val)
    val_str = val.to_s.downcase
    if has_attribute?(:booking_status)
      if SERVICE_STATUSES.include?(val_str) && !BOOKING_STATUSES.include?(val_str)
        write_attribute(:service_status, val_str)
        write_attribute(:booking_status, "confirmed") if read_attribute(:booking_status).blank? || read_attribute(:booking_status) == "pending"
      else
        write_attribute(:booking_status, val_str)
        write_attribute(:service_status, val_str) if SERVICE_STATUSES.include?(val_str)
      end
    else
      write_attribute(:status, val)
    end
  end

  def city=(val)
    if has_attribute?(:city_id)
      super
    else
      @city_record = val
    end
  end

  def city
    if has_attribute?(:city_id)
      super
    else
      @city_record || address&.city_record
    end
  end

  def city_id
    if has_attribute?(:city_id)
      read_attribute(:city_id)
    else
      @city_record&.id
    end
  end

  def city_id=(val)
    if has_attribute?(:city_id)
      write_attribute(:city_id, val)
    elsif val.present?
      @city_record = City.find_by(id: val)
    else
      @city_record = nil
    end
  end

  def time_slot
    has_attribute?(:time_slot) ? read_attribute(:time_slot) : @temp_time_slot
  end

  def time_slot=(val)
    if has_attribute?(:time_slot)
      write_attribute(:time_slot, val)
    else
      @temp_time_slot = val
    end
  end

  def date
    has_attribute?(:date) ? read_attribute(:date) : (scheduled_at&.to_date&.to_s || @temp_date)
  end

  def date=(val)
    if has_attribute?(:date)
      write_attribute(:date, val)
    else
      @temp_date = val
    end
  end

  def payment_method
    has_attribute?(:payment_method) ? read_attribute(:payment_method) : (@payment_method || payments.first&.method)
  end

  def payment_method=(val)
    if has_attribute?(:payment_method)
      write_attribute(:payment_method, val)
    else
      @payment_method = val
    end
  end

  # ── Associations ──────────────────────────────────────────────────────────────
  belongs_to :customer, class_name: "User", foreign_key: :customer_id
  belongs_to :worker,   class_name: "User", foreign_key: :worker_id, optional: true
  belongs_to :address,     optional: true
  belongs_to :city,        optional: true
  belongs_to :coupon,      optional: true
  belongs_to :worker_tier, optional: true
  has_many   :booking_items,         dependent: :destroy
  has_many   :services,              through: :booking_items
  has_many   :payments,              dependent: :destroy
  has_one    :review,                dependent: :destroy
  has_one    :service_consent,       dependent: :destroy
  has_many   :booking_products,      dependent: :destroy
  has_many   :products,              through: :booking_products
  has_many   :booking_extra_charges, dependent: :destroy
  has_many   :live_locations,        dependent: :destroy
  has_many   :booking_reschedule_requests, dependent: :destroy
  has_one    :latest_reschedule_request, -> { order(created_at: :desc) }, class_name: "BookingRescheduleRequest"

  def total_duration_minutes
    mins = booking_items.sum do |bi|
      bi.duration_minutes_snapshot.to_i > 0 ? bi.duration_minutes_snapshot.to_i : (bi.service&.duration_minutes.to_i > 0 ? bi.service.duration_minutes.to_i : 60)
    end
    mins > 0 ? mins : 60
  end

  def travel_buffer_minutes
    30
  end

  def expected_finish_time
    return nil unless scheduled_at
    scheduled_at + total_duration_minutes.minutes
  end

  def earliest_next_available_time
    return nil unless scheduled_at
    expected_finish_time + travel_buffer_minutes.minutes
  end

  def has_pending_reschedule_request?
    booking_reschedule_requests.pending.exists?
  end

  def pending_reschedule_request
    booking_reschedule_requests.pending.order(created_at: :desc).first
  end

  # ── Callbacks ──────────────────────────────────────────────────────────────────
  before_validation :generate_booking_number, on: :create

  # ── Validations ────────────────────────────────────────────────────────────────
  validates :customer_id,    presence: true
  validates :booking_status, presence: true, inclusion: { in: BOOKING_STATUSES }, if: -> { has_attribute?(:booking_status) }
  validates :service_status, presence: true, inclusion: { in: SERVICE_STATUSES }, if: -> { has_attribute?(:service_status) }
  validates :status,         presence: true, inclusion: { in: STATUSES },         if: -> { has_attribute?(:status) && !has_attribute?(:booking_status) }
  validates :total_amount,   numericality: { greater_than_or_equal_to: 0 }
  validates :subtotal_amount, numericality: { greater_than_or_equal_to: 0 }
  validates :discount_amount, numericality: { greater_than_or_equal_to: 0 }

  # ── Scopes ─────────────────────────────────────────────────────────────────────
  scope :for_worker,       ->(worker_id)   { where(worker_id: worker_id) }
  scope :for_customer,     ->(customer_id) { where(customer_id: customer_id) }
  scope :for_city,         ->(city_id)     { Booking.column_names.include?("city_id") ? where(city_id: city_id) : all }
  scope :active_scheduled, -> { where.not(booking_status: %w[cancelled rejected]) }
  scope :recent,           -> { order(created_at: :desc) }

  def completed?
    booking_status.to_s.downcase == "completed" || service_status.to_s.downcase == "completed"
  end

  def reviewed?
    review.present?
  end

  def payment_status
    if payments.loaded?
      return "completed" if payments.any? { |p| p.status == "completed" }
      payments.first&.status || "pending"
    else
      return "completed" if payments.completed.any?
      payments.order(created_at: :desc).first&.status || "pending"
    end
  end

  def payment_completed?
    payment_status.to_s.downcase == "completed"
  end

  # ── Presentation helpers ───────────────────────────────────────────────────────
  def customer_name
    customer&.name || "Customer ##{customer_id.to_s[0..7]}"
  end

  def worker_name
    worker&.name || "Unassigned"
  end

  # Primary service name — from the first booking item's snapshot
  def display_service
    booking_items.first&.service_name_snapshot.presence || "General Service"
  end

  def display_amount
    return "₹0" if total_amount.nil?
    (total_amount.to_f % 1).zero? ? "₹#{total_amount.to_i}" : "₹#{sprintf('%.2f', total_amount.to_f)}"
  end

  def display_date
    (scheduled_at || created_at)&.strftime("%d %b %Y")
  end

  def display_time
    (scheduled_at || created_at)&.strftime("%I:%M %p")
  end

  def display_time_slot
    time_slot.presence || display_time
  end

  def display_booked_at
    created_at&.strftime("%d %b %Y, %I:%M %p")
  end

  def display_booked_on
    return "Just now" if created_at && created_at > 5.minutes.ago
    return created_at.strftime("Today, %I:%M %p") if created_at && created_at.to_date == Date.current
    return created_at.strftime("Yesterday, %I:%M %p") if created_at && created_at.to_date == Date.yesterday
    created_at&.strftime("%d %b %Y, %I:%M %p")
  end

  # Total duration across all booking items (respecting quantity)
  def total_duration_minutes
    booking_items.sum { |item| item.duration_minutes_snapshot * item.quantity }
  end

  # Recalculate subtotal/discount/total from items + approved extras + coupon
  def recalculate_amounts!
    items_gross  = booking_items.sum(&:line_total).to_f
    extras_gross = booking_extra_charges.approved.sum(&:line_total).to_f
    self.subtotal_amount = items_gross.round(2)

    total_gross = (items_gross + extras_gross).round(2)
    if coupon
      items_disc  = coupon.apply_to(items_gross)
      extras_disc = booking_extra_charges.approved.sum { |c| coupon.apply_to_extra(c.line_total.to_f) }
      self.discount_amount = (items_disc + extras_disc).round(2)
    else
      self.discount_amount = 0.0
    end
    self.total_amount = [total_gross - discount_amount, 0.0].max.round(2)
    save!
  end

  def generate_booking_number
    return unless has_attribute?(:booking_number)
    return if booking_number.present?
    loop do
      self.booking_number = rand(100_000..999_999).to_s
      break unless Booking.exists?(booking_number: booking_number)
    end
  end

  def display_id
    booking_number.presence || id.to_s[0..7].upcase
  end

  # Hash accessor for backward-compatible admin views
  def [](key)
    case key.to_sym
    when :id             then id
    when :booking_number then display_id
    when :customer       then customer_name
    when :worker         then worker_name
    when :service        then display_service
    when :date           then display_date
    when :time           then display_time
    when :booked_on      then display_booked_on
    when :booked_at      then display_booked_at
    when :created_at     then display_booked_at
    when :amount         then display_amount
    when :payment_status then payments.completed.any? ? "Completed" : "Pending"
    when :booking_status then booking_status
    when :service_status then service_status
    when :status         then booking_status
    else super(key.to_s)
    end
  end

  def effective_latitude
    customer_latitude&.to_f || address&.latitude&.to_f
  end

  def effective_longitude
    customer_longitude&.to_f || address&.longitude&.to_f
  end
end
