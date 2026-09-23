# frozen_string_literal: true

# Bookings now reference an address and optional coupon.
# Service line items move to booking_items; service_id and service_name drop here.
# Adds subtotal_amount, discount_amount, and notes.
class AlterBookingsNewSchema < ActiveRecord::Migration[8.1]
  def change
    # ── Remove old direct-service columns ──────────────────────────────────────
    remove_foreign_key :bookings, :services                          # service_id FK
    remove_index  :bookings, :service_id
    remove_column :bookings, :service_id,   :uuid
    remove_column :bookings, :service_name, :string

    # ── Add new relational columns ─────────────────────────────────────────────
    add_column :bookings, :address_id,       :uuid
    add_column :bookings, :coupon_id,        :uuid
    add_column :bookings, :subtotal_amount,  :decimal, precision: 10, scale: 2, null: false, default: 0.0
    add_column :bookings, :discount_amount,  :decimal, precision: 10, scale: 2, null: false, default: 0.0
    add_column :bookings, :notes,            :text

    add_index :bookings, :address_id
    add_index :bookings, :coupon_id
    add_index :bookings, :scheduled_at

    add_foreign_key :bookings, :addresses, on_delete: :nullify
    add_foreign_key :bookings, :coupons,   on_delete: :nullify

    add_check_constraint :bookings, "subtotal_amount  >= 0", name: "check_bookings_subtotal_non_negative"
    add_check_constraint :bookings, "discount_amount  >= 0", name: "check_bookings_discount_non_negative"
    add_check_constraint :bookings, "total_amount     >= 0", name: "check_bookings_total_non_negative"
  end
end
