# frozen_string_literal: true

class Favorite < ApplicationRecord
  belongs_to :user
  belongs_to :service

  validates :user_id,    presence: true
  validates :service_id, presence: true, uniqueness: { scope: :user_id }

  def as_json_api(city: nil)
    svc = service
    svc_json = svc&.as_json_api(city: city) || {}

    {
      id:               service_id,
      service_id:       service_id,
      favorite_id:      id,
      name:             svc&.name,
      slug:             svc&.slug,
      image_url:        svc&.image_url,
      price:            svc_json[:effective_price] || svc&.effective_price&.to_s,
      base_price:       svc_json[:base_price] || svc&.base_price&.to_s,
      discount_price:   svc_json[:discount_price] || svc&.discount_price&.to_s,
      rating:           svc_json[:average_rating] || svc&.average_rating,
      duration_minutes: svc&.duration_minutes,
      category_name:    svc&.category&.name,
      subcategory_name: svc&.subcategory&.name,
      created_at:       created_at,
      service:          svc_json
    }
  end
end
