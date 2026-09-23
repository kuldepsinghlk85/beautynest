# frozen_string_literal: true

class AuditLogger
  SENSITIVE_FIELDS = %w[
    password
    password_digest
    token
    token_digest
    secret
    api_key
    api_secret
    refresh_token
  ].freeze

  class << self
    def log(actor: nil, action:, record:, record_name: nil, auditable_type: nil, changes: nil, metadata: nil, request: nil)
      user = actor.is_a?(User) ? actor : nil
      user_name = actor&.name.presence || (actor.is_a?(String) ? actor : "System")
      user_role = actor.respond_to?(:role) ? actor.role : "system"

      auditable_type ||= if record.is_a?(User) && record.role.present?
                           record.role.titleize
                         else
                           record.is_a?(Class) ? record.name : record.class.name
                         end
      auditable_id   = record.respond_to?(:id) ? record.id.to_s : record.to_s
      auditable_name = record_name.presence ||
                       (record.respond_to?(:name) ? record.name : nil) ||
                       (record.respond_to?(:booking_number) ? "Booking ##{record.booking_number}" : nil) ||
                       "#{auditable_type} ##{auditable_id.to_s.first(8)}"

      payload_to_sanitize = if changes.present? && metadata.present?
                              changes.to_h.merge("_metadata" => metadata)
                            else
                              changes.presence || metadata.presence || {}
                            end
      sanitized_payload = filter_changes(payload_to_sanitize)

      ip_address = request&.remote_ip
      user_agent = request&.user_agent

      AuditLog.create!(
        user:            user,
        user_name:       user_name,
        user_role:       user_role,
        action:          action.to_s,
        auditable_type:  auditable_type,
        auditable_id:    auditable_id,
        auditable_name:  auditable_name,
        changes_payload: sanitized_payload,
        ip_address:      ip_address,
        user_agent:      user_agent,
        created_at:      Time.current
      )
    rescue StandardError => e
      Rails.logger.error("[AuditLogger] Failed to write audit log: #{e.message}")
      nil
    end

    private

    def filter_changes(changes)
      return {} unless changes.is_a?(Hash)

      filtered = {}
      changes.each do |k, v|
        key_str = k.to_s
        next if SENSITIVE_FIELDS.any? { |s| key_str.include?(s) }
        next if key_str.in?(%w[updated_at created_at])

        filtered[key_str] = v
      end
      filtered
    end
  end
end
