# frozen_string_literal: true

class AuditLog < ApplicationRecord
  belongs_to :user, optional: true
  belongs_to :auditable, polymorphic: true, optional: true

  validates :action,         presence: true
  validates :auditable_type, presence: true
  validates :auditable_id,   presence: true

  scope :ordered,            -> { order(created_at: :desc) }
  scope :by_action,          ->(a) { where(action: a) if a.present? }
  scope :by_auditable_type,  ->(t) { where(auditable_type: t) if t.present? }
  scope :by_user_id,         ->(u) { where(user_id: u) if u.present? }
  scope :search, ->(query) {
    if query.present?
      q = "%#{query.to_s.strip.downcase}%"
      where(
        "LOWER(user_name) LIKE :q OR LOWER(auditable_name) LIKE :q OR LOWER(action) LIKE :q OR LOWER(auditable_type) LIKE :q OR CAST(auditable_id AS TEXT) LIKE :q",
        q: q
      )
    end
  }

  ACTIONS = %w[
    create
    update
    destroy
    image_upload
    assign_worker
    worker_accepted
    worker_rejected
    service_started
    service_completed
    toggle_status
  ].freeze

  AUDITABLE_TYPES = %w[
    Service
    Category
    Subcategory
    Booking
    Worker
    Customer
    Coupon
    City
    ServiceCityPrice
  ].freeze

  def actor_display
    user_name.presence || user&.name || "System"
  end

  def actor_role
    user_role.presence || user&.role || "system"
  end

  def action_display_name
    case action.to_s
    when "create"            then "#{auditable_type} Create"
    when "update"            then "#{auditable_type} Update"
    when "destroy"           then "#{auditable_type} Delete"
    when "image_upload"      then "#{auditable_type} Image Upload"
    when "assign_worker"     then "Worker Assigned"
    when "worker_accepted"   then "Booking Accepted"
    when "worker_rejected"   then "Booking Rejected"
    when "service_started"   then "Service Started"
    when "service_completed" then "Service Completed"
    when "toggle_status"     then "#{auditable_type} Status Toggle"
    else "#{auditable_type} #{action.to_s.humanize}"
    end
  end

  def action_label
    action_display_name
  end

  def action_badge_color
    case action.to_s
    when "create", "worker_accepted", "service_completed"
      "success"
    when "update", "assign_worker", "image_upload"
      "azure"
    when "destroy", "worker_rejected"
      "danger"
    when "service_started", "toggle_status"
      "warning"
    else
      "secondary"
    end
  end

  def action_icon
    case action.to_s
    when "create"            then "plus"
    when "update"            then "edit"
    when "destroy"           then "trash"
    when "image_upload"      then "photo"
    when "assign_worker"     then "user-plus"
    when "worker_accepted"   then "circle-check"
    when "worker_rejected"   then "circle-x"
    when "service_started"   then "player-play"
    when "service_completed" then "award"
    when "toggle_status"     then "toggle-left"
    else "activity"
    end
  end

  def metadata
    return {} unless changes_payload.is_a?(Hash)
    changes_payload["_metadata"] || changes_payload
  end

  # Returns array of parsed change diffs: [ { field: "name", old_val: "A", new_val: "B" } ]
  def parsed_changes
    return [] unless changes_payload.is_a?(Hash)

    changes_payload.reject { |k, _| k.to_s == "_metadata" }.map do |field, vals|
      old_val, new_val = vals.is_a?(Array) ? [vals[0], vals[1]] : [nil, vals]
      {
        field:     field.to_s.humanize,
        raw_field: field.to_s,
        old_val:   format_val(old_val),
        new_val:   format_val(new_val)
      }
    end
  end

  private

  def format_val(val)
    case val
    when nil       then "—"
    when true      then "Yes"
    when false     then "No"
    when Hash      then val.to_json
    when Array     then val.join(", ")
    else val.to_s
    end
  end
end
