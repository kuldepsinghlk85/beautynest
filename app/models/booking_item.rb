# frozen_string_literal: true

class BookingItem < ApplicationRecord
  belongs_to :booking
  belongs_to :service, optional: true   # nullable — service may be deleted later
  belongs_to :worker, class_name: "User", optional: true
  belongs_to :city, optional: true

  validates :service_name_snapshot,   presence: true, length: { maximum: 150 }
  validates :price_snapshot,          numericality: { greater_than_or_equal_to: 0 }
  validates :duration_minutes_snapshot, numericality: { greater_than: 0, only_integer: true }
  validates :quantity,                numericality: { greater_than: 0, only_integer: true }

  # Populate snapshot fields from the live Service record before validation on create.
  # Snapshots preserve pricing even if the service is later renamed/repriced.
  before_validation :snapshot_service, on: :create

  def unit_price
    price_snapshot
  end

  def unit_price=(val)
    self.price_snapshot = val
  end

  def line_total
    snapshot_service if price_snapshot.nil? && service.present?
    (price_snapshot || 0.0) * (quantity || 1)
  end

  def display_price
    "₹#{(price_snapshot || 0.0).to_i}"
  end

  def effective_date
    booking_date || scheduled_at&.to_date
  end

  def scheduled?
    effective_date.present? && (time_slot.present? || scheduled_at.present?)
  end

  def formatted_date
    effective_date ? effective_date.strftime("%a, %d %b") : nil
  end

  def formatted_schedule
    d = effective_date
    return nil unless d
    slot_label = time_slot.presence || scheduled_at&.strftime("%I:%M %p")
    "#{d.strftime('%a, %d %b')} at #{slot_label}"
  end

  def display_worker_name
    worker&.name || booking&.worker&.name || "Assigned Specialist"
  end

  def display_city_name
    city&.name || worker&.serving_city || booking&.city&.name || "Serviceable City"
  end

  def snapshot_service
    return unless service
    self.service_name_snapshot     ||= service.name
    self.price_snapshot            ||= service.effective_price
    self.duration_minutes_snapshot ||= service.duration_minutes
  end
end
