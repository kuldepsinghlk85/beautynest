# frozen_string_literal: true

# Polymorphic media record. owner_type: "User" | "Category" | "Service"
class Medium < ApplicationRecord
  self.table_name = "media"

  belongs_to :owner, polymorphic: true

  ALLOWED_TYPES = %w[image/jpeg image/png image/webp image/gif].freeze

  validates :url,          presence: true
  validates :owner_type,   presence: true
  validates :owner_id,     presence: true
  validates :position,     numericality: { greater_than_or_equal_to: 0 }

  scope :ordered, -> { order(:position) }
  scope :images,  -> { where(content_type: ALLOWED_TYPES) }
end
