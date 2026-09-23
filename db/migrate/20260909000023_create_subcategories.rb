# frozen_string_literal: true

class CreateSubcategories < ActiveRecord::Migration[8.1]
  def change
    create_table :subcategories, id: :uuid, default: -> { "gen_random_uuid()" } do |t|
      t.uuid    :category_id, null: false
      t.string  :name,        limit: 120, null: false
      t.string  :slug,        null: false
      t.text    :description
      t.integer :position,    null: false, default: 0
      t.string  :status,      limit: 20,  null: false, default: "active"
      t.boolean :featured,    null: false, default: false

      t.timestamps
    end

    add_index :subcategories, %i[category_id position]
    add_index :subcategories, :category_id
    add_index :subcategories, :featured
    add_index :subcategories, :slug, unique: true
    add_index :subcategories, :status

    add_check_constraint :subcategories,
      "status::text = ANY (ARRAY['active'::character varying::text, 'inactive'::character varying::text])",
      name: "check_subcategories_status"

    add_foreign_key :subcategories, :categories, on_delete: :restrict
  end
end
