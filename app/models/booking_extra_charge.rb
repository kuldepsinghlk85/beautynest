# frozen_string_literal: true

class BookingExtraCharge < ApplicationRecord
  CHARGE_TYPES = %w[service product custom].freeze
  STATUSES     = %w[pending approved rejected].freeze

  belongs_to :booking
  belongs_to :added_by_worker, class_name: "User", foreign_key: :added_by_worker_id
  belongs_to :service, optional: true
  belongs_to :product, optional: true

  validates :charge_type, presence: true, inclusion: { in: CHARGE_TYPES }
  validates :description, presence: true, length: { maximum: 255 }
  validates :amount, presence: true, numericality: { greater_than_or_equal_to: 0 }
  validates :quantity, numericality: { only_integer: true, greater_than_or_equal_to: 1 }
  validates :status, presence: true, inclusion: { in: STATUSES }

  scope :pending,  -> { where(status: "pending") }
  scope :approved, -> { where(status: "approved") }
  scope :rejected, -> { where(status: "rejected") }

  def pending?  = status == "pending"
  def approved? = status == "approved"
  def rejected? = status == "rejected"

  def line_total
    (amount || 0) * (quantity || 1)
  end

  def approve!
    update!(status: "approved", approved_at: Time.current)
  end

  def reject!
    update!(status: "rejected")
  end
end
