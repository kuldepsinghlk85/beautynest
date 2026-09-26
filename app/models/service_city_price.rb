# frozen_string_literal: true

class ServiceCityPrice < ApplicationRecord
  belongs_to :service
  belongs_to :city

  STATUSES = %w[active inactive].freeze

  validates :base_price,     presence: true, numericality: { greater_than_or_equal_to: 0 }
  validates :discount_price, numericality: { greater_than_or_equal_to: 0, less_than: :base_price }, allow_nil: true
  validates :status,         inclusion: { in: STATUSES }
  validates :city_id,        uniqueness: { scope: :service_id, message: "already has a price configured for this service" }

  scope :active,  -> { where(status: "active") }
  scope :ordered, -> { order(created_at: :desc) }

  def active?
    status == "active"
  end

  def effective_price
    discount_price.presence || base_price
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
end
