# frozen_string_literal: true

class CreateBookingItems < ActiveRecord::Migration[8.1]
  def change
    create_table :booking_items, id: :uuid, default: -> { "gen_random_uuid()" } do |t|
      t.uuid    :booking_id,                null: false
      t.uuid    :service_id                             # nullable — service may be deleted later
      t.string  :service_name_snapshot, limit: 150, null: false
      t.decimal :price_snapshot,     precision: 10, scale: 2, null: false
      t.integer :duration_minutes_snapshot,           null: false
      t.integer :quantity,                            null: false, default: 1
      t.datetime :created_at, null: false, default: -> { "now()" }
    end

    add_index :booking_items, :booking_id
    add_index :booking_items, :service_id
    add_foreign_key :booking_items, :bookings, on_delete: :cascade
    add_foreign_key :booking_items, :services, on_delete: :nullify
    add_check_constraint :booking_items, "quantity >= 1",        name: "check_booking_items_quantity_positive"
    add_check_constraint :booking_items, "price_snapshot >= 0",  name: "check_booking_items_price_positive"
    add_check_constraint :booking_items, "duration_minutes_snapshot >= 1", name: "check_booking_items_duration_positive"
  end
end
