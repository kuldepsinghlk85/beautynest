# frozen_string_literal: true

class CreateWorkerInvitations < ActiveRecord::Migration[8.0]
  def change
    create_table :worker_invitations, id: :uuid, default: -> { "gen_random_uuid()" } do |t|
      t.string   :email,        null: false, limit: 255
      t.string   :name,         limit: 150
      t.string   :phone,        limit: 20
      t.string   :speciality,   limit: 150
      t.references :city,       type: :uuid, foreign_key: { to_table: :cities, on_delete: :nullify }, null: true
      t.string   :token,        null: false, limit: 128
      t.string   :status,       null: false, default: "pending", limit: 20
      t.references :invited_by, type: :uuid, foreign_key: { to_table: :users, on_delete: :cascade }, null: false
      t.datetime :expires_at,   null: false
      t.datetime :accepted_at
      t.timestamps
    end

    add_index :worker_invitations, :token, unique: true
    add_index :worker_invitations, :email
    add_index :worker_invitations, :status

    add_check_constraint(
      :worker_invitations,
      "status IN ('pending', 'accepted', 'expired', 'revoked')",
      name: "check_worker_invitations_status"
    )
  end
end
