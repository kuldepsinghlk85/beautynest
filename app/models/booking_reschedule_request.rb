# frozen_string_literal: true

class BookingRescheduleRequest < ApplicationRecord
  STATUSES = %w[pending approved rejected].freeze
  REQUEST_TYPES = %w[cannot_reach slot_change].freeze

  belongs_to :booking
  belongs_to :worker,       class_name: "User", foreign_key: :worker_id
  belongs_to :requested_by, class_name: "User", foreign_key: :requested_by_id
  belongs_to :resolved_by,  class_name: "User", foreign_key: :resolved_by_id, optional: true

  validates :reason, presence: true
  validates :status, inclusion: { in: STATUSES }
  validates :request_type, inclusion: { in: REQUEST_TYPES }

  scope :pending,  -> { where(status: "pending") }
  scope :approved, -> { where(status: "approved") }
  scope :rejected, -> { where(status: "rejected") }
  scope :resolved, -> { where(status: %w[approved rejected]) }
  scope :recent,   -> { order(created_at: :desc) }

  def pending?
    status == "pending"
  end

  def approved?
    status == "approved"
  end

  def rejected?
    status == "rejected"
  end
end
