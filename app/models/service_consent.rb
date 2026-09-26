# frozen_string_literal: true

class ServiceConsent < ApplicationRecord
  PRODUCT_SOURCES = %w[platform customer].freeze

  belongs_to :booking
  belongs_to :recorded_by_worker, class_name: "User", foreign_key: :recorded_by_worker_id, optional: true

  validates :booking_id, presence: true, uniqueness: true
  validates :product_source, presence: true, inclusion: { in: PRODUCT_SOURCES }
end
