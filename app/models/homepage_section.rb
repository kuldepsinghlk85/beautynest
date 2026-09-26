# frozen_string_literal: true

class HomepageSection < ApplicationRecord
  STATUSES = %w[active inactive].freeze

  validates :section_key, presence: true, uniqueness: true, length: { maximum: 50 }
  validates :status, inclusion: { in: STATUSES }
  validates :position, numericality: { only_integer: true, greater_than_or_equal_to: 0 }

  scope :active,  -> { where(status: "active") }
  scope :ordered, -> { order(:position, :section_key) }
end
