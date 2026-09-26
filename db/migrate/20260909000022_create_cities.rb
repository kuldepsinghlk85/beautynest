# frozen_string_literal: true

class CreateCities < ActiveRecord::Migration[8.1]
  def change
    create_table :cities, id: :uuid, default: -> { "gen_random_uuid()" } do |t|
      t.string :name,   limit: 100, null: false
      t.string :slug,   null: false
      t.string :state,  limit: 100
      t.string :status, limit: 20,  null: false, default: "active"

      t.timestamps
    end

    add_index :cities, :slug, unique: true
    add_index :cities, :status
    add_check_constraint :cities,
      "status::text = ANY (ARRAY['active'::character varying, 'inactive'::character varying]::text[])",
      name: "check_cities_status"
  end
end
