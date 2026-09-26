# frozen_string_literal: true

class CreateBookings < ActiveRecord::Migration[8.0]
  def change
    create_table :bookings, id: :uuid, default: -> { "gen_random_uuid()" } do |t|
      t.uuid :customer_id, null: false
      t.uuid :worker_id
      t.string :status, limit: 30, default: "pending", null: false
      t.string :service_name, limit: 150
      t.datetime :scheduled_at
      t.decimal :total_amount, precision: 10, scale: 2, default: "0.0", null: false

      t.timestamps
    end

    add_index :bookings, :customer_id
    add_index :bookings, :worker_id
    add_index :bookings, :status

    add_foreign_key :bookings, :users, column: :customer_id, on_delete: :cascade
    add_foreign_key :bookings, :users, column: :worker_id, on_delete: :nullify
  end
end
