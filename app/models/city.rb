# frozen_string_literal: true

class City < ApplicationRecord
  extend FriendlyId
  friendly_id :name, use: :slugged

  has_many :service_city_prices, dependent: :destroy
  has_many :services, through: :service_city_prices
  has_many :addresses, dependent: :nullify
  has_many :worker_profiles, dependent: :nullify

  accepts_nested_attributes_for :service_city_prices,
                                allow_destroy: true,
                                reject_if: ->(attrs) { attrs["service_id"].blank? && attrs["base_price"].blank? }

  STATUSES = %w[active inactive].freeze

  validates :name,   presence: true, length: { maximum: 100 }
  validates :status, inclusion: { in: STATUSES }
  validates :state,  length: { maximum: 100 }, allow_blank: true
  validate  :unique_service_city_prices

  scope :active,  -> { where(status: "active") }
  scope :ordered, -> { order(:name) }

  def active?
    status == "active"
  end

  def custom_price_count
    service_city_prices.count
  end

  def self.ransackable_attributes(_auth_object = nil)
    %w[name state status created_at]
  end

  private

  def unique_service_city_prices
    active_overrides = service_city_prices.reject(&:marked_for_destruction?)
    service_ids = active_overrides.map(&:service_id).compact
    return if service_ids.length == service_ids.uniq.length

    errors.add(:base, "Each service can only have one price override per city.")
  end
end
