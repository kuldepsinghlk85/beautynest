# frozen_string_literal: true

class Cart < ApplicationRecord
  belongs_to :user, optional: true
  belongs_to :worker, class_name: "User", optional: true
  belongs_to :city, optional: true
  belongs_to :coupon, optional: true

  has_many :cart_items, dependent: :destroy
  has_many :services, through: :cart_items

  def subtotal
    cart_items.sum(&:line_total)
  end

  def discount_amount
    return 0.0 unless coupon.present?
    coupon.apply_to(subtotal).to_f.round(2)
  end

  def grand_total
    [subtotal - discount_amount, 0.0].max.round(2)
  end

  def display_subtotal
    "₹#{subtotal.to_i}"
  end

  def display_discount_amount
    "₹#{discount_amount.to_i}"
  end

  def display_grand_total
    "₹#{grand_total.to_i}"
  end

  def display_total
    display_grand_total
  end

  def item_count
    cart_items.sum(:quantity)
  end

  def empty?
    cart_items.empty?
  end

  def primary_item
    cart_items.sort_by { |ci| [ci.effective_date || Date.new(9999), ci.time_slot || ""] }.first
  end

  def scheduled?
    (booking_date.present? && time_slot.present?) || cart_items.any?(&:scheduled?)
  end

  def effective_booking_date
    primary_item&.effective_date || booking_date
  end

  def effective_time_slot
    primary_item&.time_slot || time_slot
  end

  def effective_worker
    primary_item&.worker || worker
  end

  def effective_city
    primary_item&.city || city
  end

  def formatted_date
    d = effective_booking_date
    d ? d.strftime("%a, %d %b %Y") : nil
  end

  def formatted_schedule
    if booking_date.present? && time_slot.present?
      "#{booking_date.strftime('%a, %d %b')} at #{time_slot}"
    elsif primary_item&.formatted_schedule.present?
      primary_item.formatted_schedule
    else
      nil
    end
  end

  def display_worker_name
    effective_worker&.name || "Assigned Specialist"
  end

  def display_city_name
    effective_city&.name || effective_worker&.serving_city || "Serviceable City"
  end

  def as_json_api
    items = cart_items.includes(:service).order(created_at: :asc)
    {
      id: id,
      user_id: user_id,
      worker_id: worker_id,
      worker: worker ? {
        id: worker.id,
        name: worker.name,
        avatar_url: worker.display_avatar_url,
        experience_display: worker.experience_display,
        rating_display: worker.rating_display
      } : nil,
      city_id: city_id,
      city_name: display_city_name,
      booking_date: booking_date,
      time_slot: time_slot,
      coupon_code: coupon&.code,
      item_count: item_count,
      subtotal: subtotal.to_f,
      discount_amount: discount_amount,
      total: grand_total,
      items: items.map(&:as_json_api),
      created_at: created_at,
      updated_at: updated_at
    }
  end
end

