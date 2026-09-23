# frozen_string_literal: true

class Review < ApplicationRecord
  belongs_to :booking, optional: true
  belongs_to :service, optional: true
  belongs_to :customer, class_name: "User", foreign_key: :customer_id
  belongs_to :worker,   class_name: "User", foreign_key: :worker_id, optional: true

  validates :rating,  presence: true, numericality: { only_integer: true, in: 1..5 }
  validates :booking_id, uniqueness: { message: "has already been reviewed. Each booking can only be reviewed once." }, if: -> { booking_id.present? }
  validates :service_id, uniqueness: { scope: :customer_id, message: "has already been reviewed by you" }, if: -> { service_id.present? && booking_id.blank? }

  after_create :update_worker_rating

  scope :by_rating, ->(r) { where(rating: r) }
  scope :recent,    -> { order(created_at: :desc) }

  def stars
    "*" * rating
  end

  def customer_name
    customer&.name || "Customer ##{customer_id.to_s[0..7]}"
  end

  def worker_name
    worker&.name || "Unassigned Specialist"
  end

  def service_name
    service&.name || booking&.display_service || "Beauty Service"
  end

  def display_date
    created_at&.strftime("%d %b %Y") || ""
  end

  # Hash accessor for backward-compatible admin views
  def [](key)
    case key.to_sym
    when :customer then customer_name
    when :worker   then worker_name
    when :service  then service_name
    when :date     then display_date
    when :status   then "published"
    else super(key.to_s)
    end
  end

  private

  def update_worker_rating
    return unless worker_id
    worker.worker_profile&.refresh_rating!(rating)
  end
end
