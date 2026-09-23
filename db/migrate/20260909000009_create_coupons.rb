# frozen_string_literal: true

class CreateCoupons < ActiveRecord::Migration[8.1]
  def change
    create_table :coupons, id: :uuid, default: -> { "gen_random_uuid()" } do |t|
      t.string  :code,              limit: 30,  null: false
      t.text    :description
      t.string  :discount_type,     limit: 20,  null: false  # 'percentage' | 'flat'
      t.decimal :discount_value,    precision: 10, scale: 2, null: false
      t.decimal :max_discount,      precision: 10, scale: 2
      t.decimal :min_order_amount,  precision: 10, scale: 2, null: false, default: 0.0
      t.datetime :valid_from
      t.datetime :valid_until
      t.integer :usage_limit
      t.integer :usage_count,       null: false, default: 0
      t.string  :status,            limit: 20,  null: false, default: "active"
      t.datetime :created_at, null: false
      t.datetime :updated_at, null: false
    end

    add_index :coupons, :code, unique: true
    add_index :coupons, :status
    add_index :coupons, :valid_until
    add_check_constraint :coupons, "discount_type IN ('percentage', 'flat')", name: "check_coupons_discount_type"
    add_check_constraint :coupons, "discount_value > 0", name: "check_coupons_discount_value_positive"
    add_check_constraint :coupons, "usage_count >= 0", name: "check_coupons_usage_count_non_negative"
    add_check_constraint :coupons, "status IN ('active', 'inactive', 'expired')", name: "check_coupons_status"
  end
end
