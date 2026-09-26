# frozen_string_literal: true

class CreatePayments < ActiveRecord::Migration[8.1]
  def change
    create_table :payments, id: :uuid, default: -> { "gen_random_uuid()" } do |t|
      t.uuid    :booking_id, null: false
      t.decimal :amount,     precision: 10, scale: 2, null: false
      t.string  :method,     limit: 30,  null: false   # 'cash' | 'card' | 'upi' | 'wallet'
      t.string  :status,     limit: 20,  null: false, default: "pending"
      t.string  :transaction_ref
      t.datetime :paid_at
      t.datetime :created_at, null: false
      t.datetime :updated_at, null: false
    end

    add_index :payments, :booking_id
    add_index :payments, :status
    add_index :payments, :transaction_ref, where: "transaction_ref IS NOT NULL"
    add_foreign_key :payments, :bookings, on_delete: :cascade
    add_check_constraint :payments, "amount > 0", name: "check_payments_amount_positive"
    add_check_constraint :payments, "status IN ('pending', 'completed', 'failed', 'refunded')", name: "check_payments_status"
  end
end
