# frozen_string_literal: true

class WorkerInvitation < ApplicationRecord
  STATUSES = %w[pending accepted expired revoked].freeze
  DEFAULT_VALIDITY = 7.days

  belongs_to :invited_by, class_name: "User"
  belongs_to :city, optional: true

  validates :email, presence: true,
                    format: { with: URI::MailTo::EMAIL_REGEXP, message: "is not a valid email format" },
                    length: { maximum: 255 }
  validates :token, presence: true, uniqueness: true
  validates :status, inclusion: { in: STATUSES }
  validates :expires_at, presence: true

  validate :validate_not_already_active_worker, on: :create
  validate :validate_no_pending_invitation, on: :create

  before_validation :set_defaults, on: :create
  before_save :normalize_fields

  scope :pending,  -> { where(status: "pending").where("expires_at > ?", Time.current) }
  scope :accepted, -> { where(status: "accepted") }
  scope :revoked,  -> { where(status: "revoked") }
  scope :expired,  -> { where("status = 'expired' OR (status = 'pending' AND expires_at <= ?)", Time.current) }
  scope :recent,   -> { order(created_at: :desc) }

  def pending?
    status == "pending" && !expired?
  end

  def expired?
    status == "expired" || (status == "pending" && expires_at.present? && expires_at <= Time.current)
  end

  def accepted?
    status == "accepted"
  end

  def revoked?
    status == "revoked"
  end

  def revoke!
    return false if accepted?

    update!(status: "revoked")
  end

  def resend!
    return false if accepted?

    update!(
      status: "pending",
      expires_at: DEFAULT_VALIDITY.from_now
    )
    begin
      WorkerInvitationMailer.invite(self).deliver_now
    rescue StandardError => e
      Rails.logger.error("[WorkerInvitationMailer] Resend mail dispatch failed: #{e.message}")
    end
  end

  def accept!(user_params, profile_params = {})
    return false unless pending?

    clean_email = email.to_s.strip.downcase

    ActiveRecord::Base.transaction do
      user = User.new(
        name: user_params[:name].presence || name.presence || "Beauty Professional",
        email: clean_email,
        phone: user_params[:phone].presence || phone.presence,
        password: user_params[:password],
        password_confirmation: user_params[:password_confirmation],
        role: "worker",
        status: "active"
      )

      unless user.save
        user.errors.full_messages.each { |msg| errors.add(:base, "User: #{msg}") }
        raise ActiveRecord::Rollback
      end

      bronze_tier = WorkerTier.find_by(slug: "bronze") || WorkerTier.order(:position).first
      city_record = (profile_params[:city_id].present? ? City.find_by(id: profile_params[:city_id]) : nil) ||
                    (user_params[:city_id].present? ? City.find_by(id: user_params[:city_id]) : nil) ||
                    city

      profile = user.build_worker_profile(
        bio: profile_params[:bio].presence || speciality.presence || "Certified Beauty Professional",
        experience_years: [profile_params[:experience_years].to_i, 1].max,
        time_slot: profile_params[:time_slot].presence || WorkerProfile::DEFAULT_TIME_SLOT,
        available_days: profile_params[:available_days].presence || WorkerProfile::DEFAULT_DAYS,
        is_available: true,
        aadhaar_number: profile_params[:aadhaar_number].to_s.strip,
        upi_id: profile_params[:upi_id].to_s.strip.presence,
        kyc_status: "pending",
        skills: Array(profile_params[:skills]).reject(&:blank?),
        worker_tier: bronze_tier,
        city: city_record
      )

      unless profile.save
        profile.errors.full_messages.each { |msg| errors.add(:base, "Profile: #{msg}") }
        raise ActiveRecord::Rollback
      end

      city_name = city_record&.name || user_params[:city].presence
      if city_name.present?
        addr = user.addresses.build(
          label: "Primary Operating Area",
          city: city_name,
          city_id: city_record&.id,
          line1: "Operational Area",
          is_default: true
        )
        unless addr.save
          addr.errors.full_messages.each { |msg| errors.add(:base, "Address: #{msg}") }
          raise ActiveRecord::Rollback
        end
      end

      update!(
        status: "accepted",
        accepted_at: Time.current
      )

      user
    end
  end

  def status_badge_class
    case status
    when "accepted" then "bg-success-lt"
    when "revoked"  then "bg-danger-lt"
    when "expired"  then "bg-secondary-lt"
    else
      expired? ? "bg-secondary-lt" : "bg-warning-lt"
    end
  end

  def display_status
    return "Expired" if expired?

    status.titleize
  end

  private

  def set_defaults
    self.token ||= SecureRandom.hex(32)
    self.expires_at ||= DEFAULT_VALIDITY.from_now
    self.status ||= "pending"
  end

  def normalize_fields
    self.email = email.to_s.strip.downcase
    self.name = name.to_s.strip if name.present?
    self.phone = phone.to_s.strip if phone.present?
  end

  def validate_not_already_active_worker
    return if email.blank?

    if User.workers.where(email: email.to_s.strip.downcase).exists?
      errors.add(:email, "is already registered as an active worker")
    end
  end

  def validate_no_pending_invitation
    return if email.blank?

    if self.class.where(email: email.to_s.strip.downcase, status: "pending")
                 .where("expires_at > ?", Time.current)
                 .where.not(id: id)
                 .exists?
      errors.add(:email, "already has a pending invitation. You can resend the existing invitation instead.")
    end
  end
end
