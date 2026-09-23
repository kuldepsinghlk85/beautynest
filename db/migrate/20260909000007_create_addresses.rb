# frozen_string_literal: true

class CreateAddresses < ActiveRecord::Migration[8.1]
  def change
    create_table :addresses, id: :uuid, default: -> { "gen_random_uuid()" } do |t|
      t.uuid    :user_id,                      null: false
      t.string  :label,   limit: 50
      t.string  :line1,   limit: 200,          null: false
      t.string  :line2,   limit: 200
      t.string  :city,    limit: 100,          null: false
      t.string  :state,   limit: 100
      t.string  :pincode, limit: 12
      t.decimal :latitude,  precision: 9, scale: 6
      t.decimal :longitude, precision: 9, scale: 6
      t.boolean :is_default, null: false, default: false
      t.datetime :created_at, null: false
      t.datetime :updated_at, null: false
    end

    add_index :addresses, :user_id
    add_index :addresses, %i[user_id is_default], name: "index_addresses_on_user_and_default"
    add_foreign_key :addresses, :users, on_delete: :cascade
  end
end
