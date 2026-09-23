# frozen_string_literal: true

class CreateAuditLogs < ActiveRecord::Migration[8.1]
  def change
    create_table :audit_logs, id: :uuid, default: -> { "gen_random_uuid()" } do |t|
      t.uuid       :user_id,         null: true
      t.string     :user_name,       limit: 120
      t.string     :user_role,       limit: 30,  default: "system"
      t.string     :action,          limit: 60,  null: false
      t.string     :auditable_type,  limit: 60,  null: false
      t.string     :auditable_id,    limit: 60,  null: false
      t.string     :auditable_name,  limit: 255
      t.jsonb      :changes_payload, default: {}, null: false
      t.inet       :ip_address
      t.text       :user_agent

      t.datetime   :created_at,      null: false
    end

    add_index :audit_logs, :created_at
    add_index :audit_logs, :user_id
    add_index :audit_logs, :action
    add_index :audit_logs, %i[auditable_type auditable_id]
  end
end
