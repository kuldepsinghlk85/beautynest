# frozen_string_literal: true

class ServiceProduct < ApplicationRecord
  belongs_to :service
  belongs_to :product

  validates :service_id, uniqueness: { scope: :product_id }
end
