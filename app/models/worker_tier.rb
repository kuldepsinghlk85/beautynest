# frozen_string_literal: true

class WorkerTier < ApplicationRecord
  STATUSES = %w[active inactive].freeze

  has_many :worker_profiles, dependent: :nullify
  has_many :service_tier_prices, dependent: :destroy
  has_many :services, through: :service_tier_prices
  has_many :bookings, dependent: :nullify

  validates :name, presence: true, length: { maximum: 20 }
  validates :slug, presence: true, uniqueness: true
  validates :price_multiplier, numericality: { greater_than: 0 }
  validates :status, inclusion: { in: STATUSES }
  validates :position, numericality: { only_integer: true, greater_than_or_equal_to: 0 }

  scope :active,  -> { where(status: "active") }
  scope :ordered, -> { order(:position, :name) }

  DEFAULT_TIERS = [
    { name: "Bronze", slug: "bronze", price_multiplier: 1.00, position: 1, status: "active" },
    { name: "Silver", slug: "silver", price_multiplier: 1.25, position: 2, status: "active" },
    { name: "Gold",   slug: "gold",   price_multiplier: 1.50, position: 3, status: "active" }
  ].freeze

  def self.ensure_default_tiers!
    DEFAULT_TIERS.map do |data|
      tier = find_or_initialize_by(slug: data[:slug])
      tier.name = data[:name] if tier.name.blank?
      tier.price_multiplier = data[:price_multiplier] if tier.new_record? || tier.price_multiplier == 1.0 && data[:price_multiplier] != 1.0
      tier.position = data[:position]
      tier.status = data[:status] if tier.status.blank?
      tier.save! if tier.new_record? || tier.changed?
      tier
    end
  end

  before_validation :generate_slug, on: :create

  private

  def generate_slug
    self.slug = name.to_s.parameterize if slug.blank? && name.present?
  end
end
