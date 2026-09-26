# frozen_string_literal: true

class Address < ApplicationRecord
  belongs_to :user
  belongs_to :city_record, class_name: "City", foreign_key: :city_id, optional: true

  validates :line1,  presence: true, length: { maximum: 200 }
  validates :city,   presence: true, length: { maximum: 100 }
  validates :pincode, length: { maximum: 12 }, allow_blank: true

  alias_attribute :street, :line1
  alias_attribute :postal_code, :pincode

  scope :default_first, -> { order(is_default: :desc, created_at: :desc) }

  before_save :ensure_single_default

  def clean_pincode
    return nil if pincode.blank?
    str = pincode.to_s.strip
    return nil if str.include?(".") || str =~ /\A-?\d+\.\d+\z/ || str.length > 8
    str
  end

  def full_address
    [line1, line2, city, state, clean_pincode].compact_blank.join(", ")
  end

  def display_label
    label.presence || city
  end

  def as_json_api
    {
      id: id,
      user_id: user_id,
      label: label,
      display_label: display_label,
      line1: line1,
      line2: line2,
      city: city,
      state: state,
      pincode: pincode,
      latitude: latitude&.to_f,
      longitude: longitude&.to_f,
      is_default: is_default,
      full_address: full_address,
      created_at: created_at,
      updated_at: updated_at
    }
  end

  private

  # If this address is being marked as default, unmark all others for same user.
  def ensure_single_default
    return unless is_default? && is_default_changed?
    user.addresses.where.not(id: id).update_all(is_default: false)
  end
end
