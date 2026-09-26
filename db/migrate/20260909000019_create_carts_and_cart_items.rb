# frozen_string_literal: true

class CreateCartsAndCartItems < ActiveRecord::Migration[8.1]
  def change
    create_table :carts, id: :uuid, default: -> { "gen_random_uuid()" } do |t|
      t.uuid :user_id, null: false
      t.datetime :created_at, null: false
      t.datetime :updated_at, null: false
    end

    add_index :carts, :user_id, unique: true
    add_foreign_key :carts, :users, on_delete: :cascade

    create_table :cart_items, id: :uuid, default: -> { "gen_random_uuid()" } do |t|
      t.uuid     :cart_id,      null: false
      t.uuid     :service_id,   null: false
      t.integer  :quantity,     null: false, default: 1
      t.datetime :scheduled_at
      t.datetime :created_at,   null: false
      t.datetime :updated_at,   null: false
    end

    add_index :cart_items, :cart_id
    add_index :cart_items, :service_id
    add_index :cart_items, %i[cart_id service_id], unique: true
    add_foreign_key :cart_items, :carts,    on_delete: :cascade
    add_foreign_key :cart_items, :services, on_delete: :cascade
    add_check_constraint :cart_items, "quantity >= 1", name: "check_cart_items_quantity_positive"
  end
end
