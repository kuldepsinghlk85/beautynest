# frozen_string_literal: true

class CreateSessions < ActiveRecord::Migration[8.0]
  def change
    create_table :sessions, id: :uuid, default: -> { "gen_random_uuid()" } do |t|
      t.references :user, null: false, foreign_key: { on_delete: :cascade }, type: :uuid
      t.string :token_digest, null: false
      t.inet :ip_address
      t.text :user_agent
      t.datetime :expires_at, precision: 6, null: false
      t.datetime :revoked_at, precision: 6
      t.datetime :created_at, precision: 6, null: false
    end

    add_index :sessions, :token_digest, unique: true
    add_index :sessions, [:user_id, :revoked_at, :expires_at], name: "index_sessions_on_user_and_status"
  end
end
