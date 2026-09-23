# frozen_string_literal: true

# ponytail: Table may already exist from a prior branch migration (20260907000006).
# Safe to re-run — all DDL is idempotent.
class CreateNotifications < ActiveRecord::Migration[8.1]
  def change
    create_table :notifications, id: :uuid, default: -> { "gen_random_uuid()" }, if_not_exists: true do |t|
      t.references :user,       null: false, foreign_key: { on_delete: :cascade }, type: :uuid
      t.references :created_by, null: true,  foreign_key: { to_table: :users, on_delete: :nullify }, type: :uuid

      t.string  :subject,        null: false, limit: 255
      t.text    :body,           null: false
      t.string  :channel,        null: false, limit: 20,  default: "push"
      t.string  :status,         null: false, limit: 20,  default: "pending"
      t.string  :recipient_type, null: false, limit: 50,  default: "specific_user"
      t.jsonb   :metadata,       null: false,             default: {}
      t.datetime :read_at
      t.datetime :sent_at

      t.timestamps
    end

    add_index :notifications, [:user_id, :read_at], if_not_exists: true
    add_index :notifications, :status,              if_not_exists: true
    add_index :notifications, :created_at,          if_not_exists: true

    # Constraints: suppress error if already exists
    begin
      add_check_constraint :notifications,
        "channel IN ('push','email','sms')", name: "check_notifications_channel"
    rescue ActiveRecord::StatementInvalid
      # already exists
    end
    begin
      add_check_constraint :notifications,
        "status IN ('pending','sent','failed')", name: "check_notifications_status"
    rescue ActiveRecord::StatementInvalid
      # already exists
    end
  end
end
