# frozen_string_literal: true

class CartItem < ApplicationRecord
  belongs_to :cart
  belongs_to :service
  belongs_to :worker, class_name: "User", optional: true
  belongs_to :city, optional: true

  validates :quantity, presence: true, numericality: { only_integer: true, greater_than_or_equal_to: 1 }

  def unit_price
    (service.discount_price.presence || service.base_price).to_f
  end

  def line_total
    unit_price * quantity
  end

  def display_price
    "₹#{unit_price.to_i}"
  end

  def display_line_total
    "₹#{line_total.to_i}"
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
    worker&.name || cart.worker&.name || "Assigned Specialist"
  end

  def display_city_name
    city&.name || worker&.serving_city || cart.display_city_name
  end

  def as_json_api
    {
      id: id,
      cart_id: cart_id,
      service_id: service_id,
      service_name: service.name,
      unit_price: unit_price,
      quantity: quantity,
      line_total: line_total,
      booking_date: booking_date,
      time_slot: time_slot,
      scheduled_at: scheduled_at,
      formatted_schedule: formatted_schedule,
      worker_id: worker_id,
      worker_name: display_worker_name,
      city_id: city_id,
      city_name: display_city_name,
      service: {
        id: service.id,
        name: service.name,
        price: unit_price,
        duration_minutes: service.duration_minutes,
        image_url: service.image_url
      },
      created_at: created_at,
      updated_at: updated_at
    }
  end
end
