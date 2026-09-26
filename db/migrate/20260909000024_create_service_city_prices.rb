# frozen_string_literal: true

class CreateServiceCityPrices < ActiveRecord::Migration[8.1]
  def change
    create_table :service_city_prices, id: :uuid, default: -> { "gen_random_uuid()" } do |t|
      t.uuid    :service_id,     null: false
      t.uuid    :city_id,        null: false
      t.decimal :base_price,     precision: 10, scale: 2, null: false
      t.decimal :discount_price, precision: 10, scale: 2
      t.string  :status,         limit: 20, null: false, default: "active"

      t.timestamps
    end

    add_index :service_city_prices, :city_id
    add_index :service_city_prices, %i[service_id city_id], unique: true, name: "index_service_city_prices_unique"
    add_index :service_city_prices, :service_id

    add_check_constraint :service_city_prices,
      "base_price >= 0::numeric",
      name: "check_scp_base_price_positive"

    add_check_constraint :service_city_prices,
      "discount_price IS NULL OR discount_price >= 0::numeric AND discount_price < base_price",
      name: "check_scp_discount_price_valid"

    add_check_constraint :service_city_prices,
      "status::text = ANY (ARRAY['active'::character varying, 'inactive'::character varying]::text[])",
      name: "check_scp_status"

    add_foreign_key :service_city_prices, :cities, on_delete: :cascade
    add_foreign_key :service_city_prices, :services, on_delete: :cascade
  end
end
