# frozen_string_literal: true

class Notification < ApplicationRecord
  CHANNELS        = %w[push email sms].freeze
  STATUSES        = %w[pending sent failed].freeze
  RECIPIENT_TYPES = %w[specific_user customer worker admin all_customers all_workers all_admins].freeze

  belongs_to :user
  belongs_to :creator, class_name: "User", foreign_key: :created_by_id, optional: true

  validates :subject,        presence: true, length: { maximum: 255 }
  validates :body,           presence: true
  validates :channel,        presence: true, inclusion: { in: CHANNELS }
  validates :status,         presence: true, inclusion: { in: STATUSES }
  validates :recipient_type, presence: true, inclusion: { in: RECIPIENT_TYPES }

  scope :recent,      -> { order(created_at: :desc) }
  scope :unread,      -> { where(read_at: nil) }
  scope :read,        -> { where.not(read_at: nil) }
  scope :for_channel, ->(ch) { where(channel: ch) if ch.present? }
  scope :for_status,  ->(st) { where(status: st) if st.present? }

  def read? = read_at.present?

  def mark_as_read!
    update!(read_at: Time.current) unless read?
  end

  def related_booking
    hex_id = subject[/#([0-9a-fA-F]{8})/, 1] || body[/#([0-9a-fA-F]{8})/, 1]
    return nil unless hex_id

    Booking.includes(:customer, :worker, :booking_items, :services).where("id::text LIKE ?", "#{hex_id.downcase}%").first
  end

  def display_subject
    subject.sub(/:\s*#[0-9a-fA-F]{6,8}/, "").strip
  end

  def display_body
    body.gsub(/booking\s+#[0-9a-fA-F]{6,8}/i, "the booking")
        .gsub(/\s*#[0-9a-fA-F]{6,8}/, "")
        .strip
  end

  def as_json_api
    {
      id:             id,
      subject:        subject,
      body:           body,
      channel:        channel,
      recipient_type: recipient_type,
      status:         status,
      read:           read?,
      read_at:        read_at,
      sent_at:        sent_at,
      created_at:     created_at
    }
  end
end
