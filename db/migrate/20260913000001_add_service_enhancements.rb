# frozen_string_literal: true

class AddServiceEnhancements < ActiveRecord::Migration[8.1]
  def change
    # ------------------------------------------------------------------
    # 1. WORKER TIERS (Bronze / Silver / Gold) + tiered pricing
    # ------------------------------------------------------------------
    create_table :worker_tiers, id: :uuid, default: -> { "gen_random_uuid()" } do |t|
      t.string  :name, limit: 20, null: false            # "Bronze", "Silver", "Gold"
      t.string  :slug, null: false                         # "bronze", "silver", "gold"
      t.decimal :price_multiplier, precision: 5, scale: 2, default: "1.0", null: false
      t.integer :position, default: 0, null: false
      t.string  :status, limit: 20, default: "active", null: false
      t.timestamps
    end
    add_index :worker_tiers, :slug, unique: true
    add_check_constraint :worker_tiers, "price_multiplier > 0", name: "check_worker_tiers_multiplier_positive"
    add_check_constraint :worker_tiers, "status IN ('active','inactive')", name: "check_worker_tiers_status"

    add_column :worker_profiles, :worker_tier_id, :uuid
    add_index :worker_profiles, :worker_tier_id
    add_foreign_key :worker_profiles, :worker_tiers, on_delete: :nullify

    create_table :service_tier_prices, id: :uuid, default: -> { "gen_random_uuid()" } do |t|
      t.uuid    :service_id, null: false
      t.uuid    :worker_tier_id, null: false
      t.decimal :price, precision: 10, scale: 2, null: false
      t.timestamps
    end
    add_index :service_tier_prices, [:service_id, :worker_tier_id],
              unique: true, name: "index_service_tier_prices_unique"
    add_foreign_key :service_tier_prices, :services, on_delete: :cascade
    add_foreign_key :service_tier_prices, :worker_tiers, on_delete: :cascade
    add_check_constraint :service_tier_prices, "price >= 0", name: "check_service_tier_price_positive"

    # Snapshot which tier the assigned worker was, at time of booking
    add_column :bookings, :worker_tier_id, :uuid
    add_index :bookings, :worker_tier_id
    add_foreign_key :bookings, :worker_tiers, on_delete: :nullify

    # ------------------------------------------------------------------
    # 2. PLATFORM PRODUCTS (with cost vs selling price)
    # ------------------------------------------------------------------
    create_table :products, id: :uuid, default: -> { "gen_random_uuid()" } do |t|
      t.string  :name, limit: 150, null: false
      t.text    :description
      t.decimal :cost_price, precision: 10, scale: 2, null: false     # cost to the platform
      t.decimal :selling_price, precision: 10, scale: 2, null: false  # charged to customer
      t.string  :unit, limit: 20, default: "unit", null: false
      t.text    :image_url
      t.string  :status, limit: 20, default: "active", null: false
      t.timestamps
    end
    add_check_constraint :products, "cost_price >= 0", name: "check_products_cost_positive"
    add_check_constraint :products, "selling_price >= 0", name: "check_products_selling_positive"
    add_check_constraint :products, "status IN ('active','inactive')", name: "check_products_status"
    add_index :products, :status

    # Which products are recommended/required for a given service
    create_table :service_products, id: :uuid, default: -> { "gen_random_uuid()" } do |t|
      t.uuid    :service_id, null: false
      t.uuid    :product_id, null: false
      t.boolean :is_required, default: false, null: false
      t.timestamps
    end
    add_index :service_products, [:service_id, :product_id], unique: true
    add_foreign_key :service_products, :services, on_delete: :cascade
    add_foreign_key :service_products, :products, on_delete: :cascade

    # Snapshot of products actually used/charged on a booking
    create_table :booking_products, id: :uuid, default: -> { "gen_random_uuid()" } do |t|
      t.uuid    :booking_id, null: false
      t.uuid    :product_id
      t.string  :product_name_snapshot, limit: 150, null: false
      t.decimal :price_snapshot, precision: 10, scale: 2, null: false
      t.integer :quantity, default: 1, null: false
      t.datetime :created_at, default: -> { "now()" }, null: false
    end
    add_index :booking_products, :booking_id
    add_index :booking_products, :product_id
    add_foreign_key :booking_products, :bookings, on_delete: :cascade
    add_foreign_key :booking_products, :products, on_delete: :nullify
    add_check_constraint :booking_products, "price_snapshot >= 0", name: "check_booking_products_price_positive"
    add_check_constraint :booking_products, "quantity >= 1", name: "check_booking_products_quantity_positive"

    # ------------------------------------------------------------------
    # 3. CONSENT FORM (before service starts)
    # ------------------------------------------------------------------
    create_table :service_consents, id: :uuid, default: -> { "gen_random_uuid()" } do |t|
      t.uuid     :booking_id, null: false
      t.string   :product_source, limit: 20, null: false, default: "platform" # "platform" or "customer"
      t.boolean  :terms_accepted, null: false, default: false
      t.string   :terms_version, limit: 20
      t.text     :customer_signature_url
      t.text     :notes
      t.datetime :consented_at
      t.uuid     :recorded_by_worker_id
      t.timestamps
    end
    add_index :service_consents, :booking_id, unique: true
    add_foreign_key :service_consents, :bookings, on_delete: :cascade
    add_foreign_key :service_consents, :users, column: :recorded_by_worker_id, on_delete: :nullify
    add_check_constraint :service_consents, "product_source IN ('platform','customer')",
                          name: "check_consents_product_source"

    # ------------------------------------------------------------------
    # 4. WORKER-ADDED ON-SITE CHARGES (extra services/products/custom)
    # ------------------------------------------------------------------
    create_table :booking_extra_charges, id: :uuid, default: -> { "gen_random_uuid()" } do |t|
      t.uuid     :booking_id, null: false
      t.uuid     :added_by_worker_id, null: false
      t.string   :charge_type, limit: 20, null: false   # "service", "product", "custom"
      t.uuid     :service_id
      t.uuid     :product_id
      t.string   :description, limit: 255, null: false
      t.decimal  :amount, precision: 10, scale: 2, null: false
      t.integer  :quantity, default: 1, null: false
      t.string   :status, limit: 20, default: "pending", null: false # pending/approved/rejected
      t.datetime :approved_at
      t.timestamps
    end
    add_index :booking_extra_charges, :booking_id
    add_index :booking_extra_charges, :status
    add_foreign_key :booking_extra_charges, :bookings, on_delete: :cascade
    add_foreign_key :booking_extra_charges, :users, column: :added_by_worker_id, on_delete: :nullify
    add_foreign_key :booking_extra_charges, :services, on_delete: :nullify
    add_foreign_key :booking_extra_charges, :products, on_delete: :nullify
    add_check_constraint :booking_extra_charges, "charge_type IN ('service','product','custom')",
                          name: "check_extra_charge_type"
    add_check_constraint :booking_extra_charges, "amount >= 0",
                          name: "check_extra_charge_amount_positive"
    add_check_constraint :booking_extra_charges, "quantity >= 1",
                          name: "check_extra_charge_quantity_positive"
    add_check_constraint :booking_extra_charges, "status IN ('pending','approved','rejected')",
                          name: "check_extra_charge_status"

    # ------------------------------------------------------------------
    # 5. CUSTOMER GPS LOCATION
    # ------------------------------------------------------------------
    add_column :bookings, :customer_latitude, :decimal, precision: 9, scale: 6
    add_column :bookings, :customer_longitude, :decimal, precision: 9, scale: 6
    add_column :bookings, :location_captured_at, :datetime

    # Optional: real-time location pings (worker en route / customer at service time)
    create_table :live_locations, id: :uuid, default: -> { "gen_random_uuid()" } do |t|
      t.uuid     :user_id, null: false      # worker or customer
      t.uuid     :booking_id
      t.decimal  :latitude, precision: 9, scale: 6, null: false
      t.decimal  :longitude, precision: 9, scale: 6, null: false
      t.datetime :recorded_at, null: false
      t.datetime :created_at, default: -> { "now()" }, null: false
    end
    add_index :live_locations, [:booking_id, :recorded_at]
    add_index :live_locations, :user_id
    add_foreign_key :live_locations, :users, on_delete: :cascade
    add_foreign_key :live_locations, :bookings, on_delete: :cascade

    # ------------------------------------------------------------------
    # 6. HOMEPAGE / WEBSITE CONTENT (lightweight CMS)
    # ------------------------------------------------------------------
    create_table :homepage_sections, id: :uuid, default: -> { "gen_random_uuid()" } do |t|
      t.string  :section_key, limit: 50, null: false   # "hero_banner", "testimonials", "featured_categories"
      t.string  :title, limit: 200
      t.text    :subtitle
      t.jsonb   :content, default: {}, null: false      # flexible payload per section type
      t.text    :image_url
      t.integer :position, default: 0, null: false
      t.string  :status, limit: 20, default: "active", null: false
      t.timestamps
    end
    add_index :homepage_sections, :section_key, unique: true
    add_index :homepage_sections, :position
    add_check_constraint :homepage_sections, "status IN ('active','inactive')",
                          name: "check_homepage_sections_status"
  end
end
