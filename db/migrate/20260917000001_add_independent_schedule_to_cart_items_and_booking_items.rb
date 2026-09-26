# frozen_string_literal: true

class AddIndependentScheduleToCartItemsAndBookingItems < ActiveRecord::Migration[8.0]
  def change
    # ── 1. Enhance cart_items with independent schedule & worker ──
    add_column :cart_items, :booking_date, :date
    add_column :cart_items, :time_slot, :string, limit: 50
    add_reference :cart_items, :worker, type: :uuid, foreign_key: { to_table: :users, on_delete: :nullify }, index: true
    add_reference :cart_items, :city, type: :uuid, foreign_key: { to_table: :cities, on_delete: :nullify }, index: true

    # Remove unique index on [cart_id, service_id] so customers can schedule multiple slots
    if index_exists?(:cart_items, [:cart_id, :service_id], name: "index_cart_items_on_cart_id_and_service_id")
      remove_index :cart_items, name: "index_cart_items_on_cart_id_and_service_id"
    end
    add_index :cart_items, [:cart_id, :service_id], name: "index_cart_items_on_cart_and_service"

    # ── 2. Enhance booking_items with independent schedule & worker ──
    add_column :booking_items, :scheduled_at, :datetime
    add_column :booking_items, :booking_date, :date
    add_column :booking_items, :time_slot, :string, limit: 50
    add_reference :booking_items, :worker, type: :uuid, foreign_key: { to_table: :users, on_delete: :nullify }, index: true
    add_reference :booking_items, :city, type: :uuid, foreign_key: { to_table: :cities, on_delete: :nullify }, index: true
  end
end
