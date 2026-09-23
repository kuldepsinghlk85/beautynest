# frozen_string_literal: true

class Product < ApplicationRecord
  STATUSES = %w[active inactive].freeze

  has_many :service_products, dependent: :destroy
  has_many :services, through: :service_products
  has_many :booking_products, dependent: :nullify
  has_many :booking_extra_charges, dependent: :nullify

  validates :name, presence: true, length: { maximum: 150 }
  validates :cost_price, presence: true, numericality: { greater_than_or_equal_to: 0 }
  validates :selling_price, presence: true, numericality: { greater_than_or_equal_to: 0 }
  validates :unit, presence: true, length: { maximum: 20 }
  validates :status, inclusion: { in: STATUSES }

  scope :active, -> { where(status: "active") }
  scope :ordered, -> { order(:name) }
end
