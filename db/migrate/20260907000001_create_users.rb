# frozen_string_literal: true

class CreateUsers < ActiveRecord::Migration[8.0]
  def change
    enable_extension "pgcrypto" unless extension_enabled?("pgcrypto")

    create_table :users, id: :uuid, default: -> { "gen_random_uuid()" } do |t|
      t.string :name, limit: 120, null: false
      t.string :email, limit: 200, null: false
      t.string :phone, limit: 20, null: false
      t.string :password_digest, null: false
      t.string :role, limit: 20, default: "customer", null: false
      t.string :status, limit: 20, default: "active", null: false
      t.jsonb :addresses, default: [], null: false
      t.text :avatar_url

      t.timestamps
    end

    add_index :users, "LOWER(email)", unique: true, name: "index_users_on_lower_email"
    add_index :users, :phone, unique: true
    add_index :users, :role
    add_index :users, :status

    add_check_constraint :users, "role IN ('customer', 'worker', 'admin')", name: "check_users_role"
    add_check_constraint :users, "status IN ('active', 'inactive')", name: "check_users_status"
  end
end
