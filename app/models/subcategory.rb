# frozen_string_literal: true

class Subcategory < ApplicationRecord
  extend FriendlyId
  friendly_id :name, use: :slugged

  belongs_to :category
  has_many   :services, dependent: :destroy

  STATUSES = %w[active inactive].freeze

  validates :name,        presence: true, length: { maximum: 120 }
  validates :status,      inclusion: { in: STATUSES }
  validates :category_id, presence: true

  scope :active,   -> { where(status: "active") }
  scope :featured, -> { where(featured: true) }
  scope :ordered,  -> { order(:position, :name) }

  def active?
    status == "active"
  end

  def service_count
    services.active.count
  end

  def as_json_api(include_services: true, city: nil)
    h = {
      id:            id,
      category_id:   category_id,
      category_name: category&.name,
      name:          name,
      slug:          slug,
      description:   description,
      featured:      featured,
      position:      position,
      status:        status,
      service_count: service_count
    }
    if include_services
      h[:services] = services.active.ordered.map { |s| s.as_json_api(city: city) }
    end
    h
  end

  def self.ransackable_attributes(_auth_object = nil)
    %w[name status featured category_id created_at]
  end
end
