# frozen_string_literal: true

class BookingProduct < ApplicationRecord
  belongs_to :booking
  belongs_to :product, optional: true

  validates :product_name_snapshot, presence: true, length: { maximum: 150 }
  validates :price_snapshot, presence: true, numericality: { greater_than_or_equal_to: 0 }
  validates :quantity, numericality: { only_integer: true, greater_than_or_equal_to: 1 }

  def line_total
    (price_snapshot || 0) * (quantity || 1)
  end
end
