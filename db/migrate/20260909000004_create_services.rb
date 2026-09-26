class CreateServices < ActiveRecord::Migration[8.1]
  def change
    create_table :services, id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
      t.references :category,         type: :uuid, null: false, foreign_key: true
      t.string  :name,                limit: 150, null: false
      t.text    :description
      t.string  :slug,                null: false
      t.decimal :base_price,          precision: 10, scale: 2, null: false
      t.decimal :discount_price,      precision: 10, scale: 2  # nullable
      t.integer :duration_minutes,    null: false, default: 60
      t.integer :position,            default: 0, null: false
      t.boolean :featured,            default: false, null: false
      t.string  :status,              limit: 20, default: "active", null: false

      t.timestamps null: false
    end

    add_index :services, :slug,       unique: true
    add_index :services, :status
    add_index :services, :base_price
    add_index :services, :featured
    add_index :services, :position

    add_check_constraint :services,
      "status IN ('active', 'inactive')",
      name: "check_services_status"

    add_check_constraint :services,
      "base_price >= 0",
      name: "check_services_base_price_positive"

    add_check_constraint :services,
      "discount_price IS NULL OR (discount_price >= 0 AND discount_price < base_price)",
      name: "check_services_discount_price_valid"
  end
end
