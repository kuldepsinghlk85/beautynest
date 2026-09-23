class CreateCategories < ActiveRecord::Migration[8.1]
  def change
    create_table :categories, id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
      t.string  :name,        limit: 120, null: false
      t.text    :description
      t.string  :slug,        null: false
      t.integer :position,    default: 0, null: false
      t.boolean :featured,    default: false, null: false
      t.string  :status,      limit: 20, default: "active", null: false
      t.uuid    :parent_id    # null = top-level; non-null = sub-category

      t.timestamps null: false
    end

    add_index :categories, :slug,      unique: true
    add_index :categories, :parent_id
    add_index :categories, :position
    add_index :categories, :status
    add_index :categories, :featured

    add_check_constraint :categories,
      "status IN ('active', 'inactive')",
      name: "check_categories_status"

    add_foreign_key :categories, :categories,
      column: :parent_id,
      on_delete: :cascade
  end
end
