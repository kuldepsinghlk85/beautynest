# frozen_string_literal: true

class EnhanceCartsForBookingFlow < ActiveRecord::Migration[8.1]
  def change
    # Allow carts to belong to a guest session before login
    change_column_null :carts, :user_id, true

    # Add scheduling, worker, city, and coupon associations directly on Cart
    add_column :carts, :worker_id, :uuid
    add_column :carts, :city_id, :uuid
    add_column :carts, :booking_date, :date
    add_column :carts, :time_slot, :string, limit: 30
    add_column :carts, :coupon_id, :uuid
    add_column :carts, :notes, :text

    add_index :carts, :worker_id
    add_index :carts, :city_id
    add_index :carts, :coupon_id

    add_foreign_key :carts, :users, column: :worker_id, on_delete: :nullify
    add_foreign_key :carts, :cities, column: :city_id, on_delete: :nullify
    add_foreign_key :carts, :coupons, column: :coupon_id, on_delete: :nullify
  end
end
