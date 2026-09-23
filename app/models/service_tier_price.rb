# frozen_string_literal: true

class ServiceTierPrice < ApplicationRecord
  belongs_to :service
  belongs_to :worker_tier

  validates :price, presence: true, numericality: { greater_than_or_equal_to: 0 }
  validates :service_id, uniqueness: { scope: :worker_tier_id }
end
