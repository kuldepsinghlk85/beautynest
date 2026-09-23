# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema[8.1].define(version: 2026_09_22_000001) do
  # These are extensions that must be enabled in order to support this database
  enable_extension "pg_catalog.plpgsql"
  enable_extension "pgcrypto"

  create_table "active_storage_attachments", force: :cascade do |t|
    t.bigint "blob_id", null: false
    t.datetime "created_at", null: false
    t.string "name", null: false
    t.string "record_id", null: false
    t.string "record_type", null: false
    t.index ["blob_id"], name: "index_active_storage_attachments_on_blob_id"
    t.index ["record_type", "record_id", "name", "blob_id"], name: "index_active_storage_attachments_uniqueness", unique: true
  end

  create_table "active_storage_blobs", force: :cascade do |t|
    t.bigint "byte_size", null: false
    t.string "checksum"
    t.string "content_type"
    t.datetime "created_at", null: false
    t.string "filename", null: false
    t.string "key", null: false
    t.text "metadata"
    t.string "service_name", null: false
    t.index ["key"], name: "index_active_storage_blobs_on_key", unique: true
  end

  create_table "active_storage_variant_records", force: :cascade do |t|
    t.bigint "blob_id", null: false
    t.string "variation_digest", null: false
    t.index ["blob_id", "variation_digest"], name: "index_active_storage_variant_records_uniqueness", unique: true
  end

  create_table "addresses", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.string "city", limit: 100, null: false
    t.uuid "city_id"
    t.datetime "created_at", null: false
    t.boolean "is_default", default: false, null: false
    t.string "label", limit: 50
    t.decimal "latitude", precision: 9, scale: 6
    t.string "line1", limit: 200, null: false
    t.string "line2", limit: 200
    t.decimal "longitude", precision: 9, scale: 6
    t.string "pincode", limit: 12
    t.string "state", limit: 100
    t.datetime "updated_at", null: false
    t.uuid "user_id", null: false
    t.index ["city_id"], name: "index_addresses_on_city_id"
    t.index ["user_id", "is_default"], name: "index_addresses_on_user_and_default"
    t.index ["user_id"], name: "index_addresses_on_user_id"
  end

  create_table "audit_logs", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.string "action", limit: 60, null: false
    t.string "auditable_id", limit: 60, null: false
    t.string "auditable_name", limit: 255
    t.string "auditable_type", limit: 60, null: false
    t.jsonb "changes_payload", default: {}, null: false
    t.datetime "created_at", null: false
    t.inet "ip_address"
    t.text "user_agent"
    t.uuid "user_id"
    t.string "user_name", limit: 120
    t.string "user_role", limit: 30, default: "system"
    t.index ["action"], name: "index_audit_logs_on_action"
    t.index ["auditable_type", "auditable_id"], name: "index_audit_logs_on_auditable_type_and_auditable_id"
    t.index ["created_at"], name: "index_audit_logs_on_created_at"
    t.index ["user_id"], name: "index_audit_logs_on_user_id"
  end

  create_table "booking_extra_charges", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "added_by_worker_id", null: false
    t.decimal "amount", precision: 10, scale: 2, null: false
    t.datetime "approved_at"
    t.uuid "booking_id", null: false
    t.string "charge_type", limit: 20, null: false
    t.datetime "created_at", null: false
    t.string "description", limit: 255, null: false
    t.uuid "product_id"
    t.integer "quantity", default: 1, null: false
    t.uuid "service_id"
    t.string "status", limit: 20, default: "pending", null: false
    t.datetime "updated_at", null: false
    t.index ["booking_id"], name: "index_booking_extra_charges_on_booking_id"
    t.index ["status"], name: "index_booking_extra_charges_on_status"
    t.check_constraint "amount >= 0::numeric", name: "check_extra_charge_amount_positive"
    t.check_constraint "charge_type::text = ANY (ARRAY['service'::character varying::text, 'product'::character varying::text, 'custom'::character varying::text])", name: "check_extra_charge_type"
    t.check_constraint "quantity >= 1", name: "check_extra_charge_quantity_positive"
    t.check_constraint "status::text = ANY (ARRAY['pending'::character varying::text, 'approved'::character varying::text, 'rejected'::character varying::text])", name: "check_extra_charge_status"
  end

  create_table "booking_items", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.date "booking_date"
    t.uuid "booking_id", null: false
    t.uuid "city_id"
    t.datetime "created_at", default: -> { "now()" }, null: false
    t.integer "duration_minutes_snapshot", null: false
    t.decimal "price_snapshot", precision: 10, scale: 2, null: false
    t.integer "quantity", default: 1, null: false
    t.datetime "scheduled_at"
    t.uuid "service_id"
    t.string "service_name_snapshot", limit: 150, null: false
    t.string "time_slot", limit: 50
    t.uuid "worker_id"
    t.index ["booking_id"], name: "index_booking_items_on_booking_id"
    t.index ["city_id"], name: "index_booking_items_on_city_id"
    t.index ["service_id"], name: "index_booking_items_on_service_id"
    t.index ["worker_id"], name: "index_booking_items_on_worker_id"
    t.check_constraint "duration_minutes_snapshot >= 1", name: "check_booking_items_duration_positive"
    t.check_constraint "price_snapshot >= 0::numeric", name: "check_booking_items_price_positive"
    t.check_constraint "quantity >= 1", name: "check_booking_items_quantity_positive"
  end

  create_table "booking_products", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "booking_id", null: false
    t.datetime "created_at", default: -> { "now()" }, null: false
    t.decimal "price_snapshot", precision: 10, scale: 2, null: false
    t.uuid "product_id"
    t.string "product_name_snapshot", limit: 150, null: false
    t.integer "quantity", default: 1, null: false
    t.index ["booking_id"], name: "index_booking_products_on_booking_id"
    t.index ["product_id"], name: "index_booking_products_on_product_id"
    t.check_constraint "price_snapshot >= 0::numeric", name: "check_booking_products_price_positive"
    t.check_constraint "quantity >= 1", name: "check_booking_products_quantity_positive"
  end

  create_table "booking_reschedule_requests", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.string "action_taken"
    t.text "admin_notes"
    t.uuid "booking_id", null: false
    t.datetime "created_at", null: false
    t.datetime "current_scheduled_at"
    t.string "current_time_slot"
    t.text "reason", null: false
    t.string "request_type", default: "cannot_reach", null: false
    t.uuid "requested_by_id", null: false
    t.date "requested_date"
    t.string "requested_time_slot"
    t.datetime "resolved_at"
    t.uuid "resolved_by_id"
    t.string "status", default: "pending", null: false
    t.datetime "updated_at", null: false
    t.uuid "worker_id", null: false
    t.index ["booking_id"], name: "index_booking_reschedule_requests_on_booking_id"
    t.index ["request_type"], name: "index_booking_reschedule_requests_on_request_type"
    t.index ["requested_by_id"], name: "index_booking_reschedule_requests_on_requested_by_id"
    t.index ["resolved_by_id"], name: "index_booking_reschedule_requests_on_resolved_by_id"
    t.index ["status"], name: "index_booking_reschedule_requests_on_status"
    t.index ["worker_id"], name: "index_booking_reschedule_requests_on_worker_id"
  end

  create_table "bookings", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "address_id"
    t.string "booking_number", limit: 30
    t.string "booking_status", limit: 30, default: "pending", null: false
    t.uuid "city_id"
    t.uuid "coupon_id"
    t.datetime "created_at", null: false
    t.uuid "customer_id", null: false
    t.decimal "customer_latitude", precision: 9, scale: 6
    t.decimal "customer_longitude", precision: 9, scale: 6
    t.decimal "discount_amount", precision: 10, scale: 2, default: "0.0", null: false
    t.decimal "latitude", precision: 9, scale: 6
    t.datetime "location_captured_at"
    t.decimal "longitude", precision: 9, scale: 6
    t.text "notes"
    t.datetime "scheduled_at"
    t.string "service_status", limit: 30, default: "pending", null: false
    t.decimal "subtotal_amount", precision: 10, scale: 2, default: "0.0", null: false
    t.string "time_slot", limit: 50
    t.decimal "total_amount", precision: 10, scale: 2, default: "0.0", null: false
    t.datetime "updated_at", null: false
    t.uuid "worker_id"
    t.uuid "worker_tier_id"
    t.index ["address_id"], name: "index_bookings_on_address_id"
    t.index ["booking_number"], name: "index_bookings_on_booking_number"
    t.index ["booking_status"], name: "index_bookings_on_booking_status"
    t.index ["city_id"], name: "index_bookings_on_city_id"
    t.index ["coupon_id"], name: "index_bookings_on_coupon_id"
    t.index ["customer_id"], name: "index_bookings_on_customer_id"
    t.index ["scheduled_at"], name: "index_bookings_on_scheduled_at"
    t.index ["service_status"], name: "index_bookings_on_service_status"
    t.index ["worker_id"], name: "index_bookings_on_worker_id"
    t.index ["worker_tier_id"], name: "index_bookings_on_worker_tier_id"
    t.check_constraint "discount_amount >= 0::numeric", name: "check_bookings_discount_non_negative"
    t.check_constraint "subtotal_amount >= 0::numeric", name: "check_bookings_subtotal_non_negative"
    t.check_constraint "total_amount >= 0::numeric", name: "check_bookings_total_non_negative"
  end

  create_table "cart_items", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.date "booking_date"
    t.uuid "cart_id", null: false
    t.uuid "city_id"
    t.datetime "created_at", null: false
    t.integer "quantity", default: 1, null: false
    t.datetime "scheduled_at"
    t.uuid "service_id", null: false
    t.string "time_slot", limit: 50
    t.datetime "updated_at", null: false
    t.uuid "worker_id"
    t.index ["cart_id", "service_id"], name: "index_cart_items_on_cart_and_service"
    t.index ["cart_id"], name: "index_cart_items_on_cart_id"
    t.index ["city_id"], name: "index_cart_items_on_city_id"
    t.index ["service_id"], name: "index_cart_items_on_service_id"
    t.index ["worker_id"], name: "index_cart_items_on_worker_id"
    t.check_constraint "quantity >= 1", name: "check_cart_items_quantity_positive"
  end

  create_table "carts", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.date "booking_date"
    t.uuid "city_id"
    t.uuid "coupon_id"
    t.datetime "created_at", null: false
    t.text "notes"
    t.string "time_slot", limit: 30
    t.datetime "updated_at", null: false
    t.uuid "user_id"
    t.uuid "worker_id"
    t.index ["city_id"], name: "index_carts_on_city_id"
    t.index ["coupon_id"], name: "index_carts_on_coupon_id"
    t.index ["user_id"], name: "index_carts_on_user_id", unique: true
    t.index ["worker_id"], name: "index_carts_on_worker_id"
  end

  create_table "categories", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.datetime "created_at", null: false
    t.text "description"
    t.boolean "featured", default: false, null: false
    t.text "image_url"
    t.string "name", limit: 120, null: false
    t.integer "position", default: 0, null: false
    t.string "slug", null: false
    t.string "status", limit: 20, default: "active", null: false
    t.datetime "updated_at", null: false
    t.index ["featured"], name: "index_categories_on_featured"
    t.index ["position"], name: "index_categories_on_position"
    t.index ["slug"], name: "index_categories_on_slug", unique: true
    t.index ["status"], name: "index_categories_on_status"
    t.check_constraint "status::text = ANY (ARRAY['active'::character varying::text, 'inactive'::character varying::text])", name: "check_categories_status"
  end

  create_table "cities", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.datetime "created_at", null: false
    t.string "name", limit: 100, null: false
    t.string "slug", null: false
    t.string "state", limit: 100
    t.string "status", limit: 20, default: "active", null: false
    t.datetime "updated_at", null: false
    t.index ["slug"], name: "index_cities_on_slug", unique: true
    t.index ["status"], name: "index_cities_on_status"
    t.check_constraint "status::text = ANY (ARRAY['active'::character varying::text, 'inactive'::character varying::text])", name: "check_cities_status"
  end

  create_table "coupons", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.string "code", limit: 30, null: false
    t.datetime "created_at", null: false
    t.text "description"
    t.string "discount_type", limit: 20, null: false
    t.decimal "discount_value", precision: 10, scale: 2, null: false
    t.decimal "max_discount", precision: 10, scale: 2
    t.decimal "min_order_amount", precision: 10, scale: 2, default: "0.0", null: false
    t.string "status", limit: 20, default: "active", null: false
    t.datetime "updated_at", null: false
    t.integer "usage_count", default: 0, null: false
    t.integer "usage_limit"
    t.datetime "valid_from"
    t.datetime "valid_until"
    t.index ["code"], name: "index_coupons_on_code", unique: true
    t.index ["status"], name: "index_coupons_on_status"
    t.index ["valid_until"], name: "index_coupons_on_valid_until"
    t.check_constraint "discount_type::text = ANY (ARRAY['percentage'::character varying::text, 'flat'::character varying::text])", name: "check_coupons_discount_type"
    t.check_constraint "discount_value > 0::numeric", name: "check_coupons_discount_value_positive"
    t.check_constraint "status::text = ANY (ARRAY['active'::character varying::text, 'inactive'::character varying::text, 'expired'::character varying::text])", name: "check_coupons_status"
    t.check_constraint "usage_count >= 0", name: "check_coupons_usage_count_non_negative"
  end

  create_table "favorites", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.datetime "created_at", default: -> { "now()" }, null: false
    t.uuid "service_id", null: false
    t.uuid "user_id", null: false
    t.index ["service_id"], name: "index_favorites_on_service_id"
    t.index ["user_id", "service_id"], name: "index_favorites_on_user_id_and_service_id", unique: true
  end

  create_table "friendly_id_slugs", force: :cascade do |t|
    t.datetime "created_at"
    t.string "scope"
    t.string "slug", null: false
    t.integer "sluggable_id", null: false
    t.string "sluggable_type", limit: 50
    t.index ["slug", "sluggable_type", "scope"], name: "index_friendly_id_slugs_on_slug_and_sluggable_type_and_scope", unique: true
    t.index ["slug", "sluggable_type"], name: "index_friendly_id_slugs_on_slug_and_sluggable_type"
    t.index ["sluggable_id"], name: "index_friendly_id_slugs_on_sluggable_id"
    t.index ["sluggable_type"], name: "index_friendly_id_slugs_on_sluggable_type"
  end

  create_table "homepage_sections", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.jsonb "content", default: {}, null: false
    t.datetime "created_at", null: false
    t.text "image_url"
    t.integer "position", default: 0, null: false
    t.string "section_key", limit: 50, null: false
    t.string "status", limit: 20, default: "active", null: false
    t.text "subtitle"
    t.string "title", limit: 200
    t.datetime "updated_at", null: false
    t.index ["position"], name: "index_homepage_sections_on_position"
    t.index ["section_key"], name: "index_homepage_sections_on_section_key", unique: true
    t.check_constraint "status::text = ANY (ARRAY['active'::character varying::text, 'inactive'::character varying::text])", name: "check_homepage_sections_status"
  end

  create_table "live_locations", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "booking_id"
    t.datetime "created_at", default: -> { "now()" }, null: false
    t.decimal "latitude", precision: 9, scale: 6, null: false
    t.decimal "longitude", precision: 9, scale: 6, null: false
    t.datetime "recorded_at", null: false
    t.uuid "user_id", null: false
    t.index ["booking_id", "recorded_at"], name: "index_live_locations_on_booking_id_and_recorded_at"
    t.index ["user_id"], name: "index_live_locations_on_user_id"
  end

  create_table "media", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.string "content_type"
    t.datetime "created_at", default: -> { "now()" }, null: false
    t.uuid "owner_id", null: false
    t.string "owner_type", limit: 30, null: false
    t.integer "position", default: 0, null: false
    t.text "url", null: false
    t.index ["owner_type", "owner_id", "position"], name: "index_media_on_owner_and_position"
    t.index ["owner_type", "owner_id"], name: "index_media_on_owner"
  end

  create_table "notifications", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.text "body", null: false
    t.string "channel", limit: 30, default: "push", null: false
    t.datetime "created_at", null: false
    t.uuid "created_by_id"
    t.datetime "read_at"
    t.string "recipient_type", limit: 50, default: "specific_user", null: false
    t.datetime "sent_at"
    t.string "status", limit: 30, default: "sent", null: false
    t.string "subject", limit: 255, null: false
    t.datetime "updated_at", null: false
    t.uuid "user_id", null: false
    t.index ["channel"], name: "index_notifications_on_channel"
    t.index ["created_at"], name: "index_notifications_on_created_at"
    t.index ["created_by_id"], name: "index_notifications_on_created_by_id"
    t.index ["status"], name: "index_notifications_on_status"
    t.index ["user_id", "read_at"], name: "index_notifications_on_user_id_and_read_at"
    t.index ["user_id"], name: "index_notifications_on_user_id"
    t.check_constraint "channel::text = ANY (ARRAY['push'::character varying::text, 'email'::character varying::text, 'sms'::character varying::text])", name: "check_notifications_channel"
    t.check_constraint "status::text = ANY (ARRAY['pending'::character varying::text, 'sent'::character varying::text, 'failed'::character varying::text])", name: "check_notifications_status"
  end

  create_table "payments", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.decimal "amount", precision: 10, scale: 2, null: false
    t.uuid "booking_id", null: false
    t.datetime "created_at", null: false
    t.string "method", limit: 30, null: false
    t.datetime "paid_at"
    t.string "status", limit: 20, default: "pending", null: false
    t.string "transaction_ref"
    t.datetime "updated_at", null: false
    t.index ["booking_id"], name: "index_payments_on_booking_id"
    t.index ["status"], name: "index_payments_on_status"
    t.index ["transaction_ref"], name: "index_payments_on_transaction_ref", where: "(transaction_ref IS NOT NULL)"
    t.check_constraint "amount > 0::numeric", name: "check_payments_amount_positive"
    t.check_constraint "status::text = ANY (ARRAY['pending'::character varying::text, 'completed'::character varying::text, 'failed'::character varying::text, 'refunded'::character varying::text])", name: "check_payments_status"
  end

  create_table "products", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.decimal "cost_price", precision: 10, scale: 2, null: false
    t.datetime "created_at", null: false
    t.text "description"
    t.text "image_url"
    t.string "name", limit: 150, null: false
    t.decimal "selling_price", precision: 10, scale: 2, null: false
    t.string "status", limit: 20, default: "active", null: false
    t.string "unit", limit: 20, default: "unit", null: false
    t.datetime "updated_at", null: false
    t.index ["status"], name: "index_products_on_status"
    t.check_constraint "cost_price >= 0::numeric", name: "check_products_cost_positive"
    t.check_constraint "selling_price >= 0::numeric", name: "check_products_selling_positive"
    t.check_constraint "status::text = ANY (ARRAY['active'::character varying::text, 'inactive'::character varying::text])", name: "check_products_status"
  end

  create_table "reviews", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "booking_id"
    t.text "comment"
    t.datetime "created_at", default: -> { "now()" }, null: false
    t.uuid "customer_id", null: false
    t.integer "rating", null: false
    t.uuid "service_id"
    t.uuid "worker_id"
    t.index ["booking_id"], name: "index_reviews_on_booking_id"
    t.index ["customer_id", "booking_id"], name: "index_reviews_unique_booking_review", unique: true, where: "(service_id IS NULL)"
    t.index ["customer_id", "service_id"], name: "index_reviews_unique_service_review", unique: true, where: "(service_id IS NOT NULL)"
    t.index ["customer_id"], name: "index_reviews_on_customer_id"
    t.index ["rating"], name: "index_reviews_on_rating"
    t.index ["service_id"], name: "index_reviews_on_service_id"
    t.index ["worker_id"], name: "index_reviews_on_worker_id"
    t.check_constraint "rating >= 1 AND rating <= 5", name: "check_reviews_rating_range"
  end

  create_table "service_city_prices", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.decimal "base_price", precision: 10, scale: 2, null: false
    t.uuid "city_id", null: false
    t.datetime "created_at", null: false
    t.decimal "discount_price", precision: 10, scale: 2
    t.uuid "service_id", null: false
    t.string "status", limit: 20, default: "active", null: false
    t.datetime "updated_at", null: false
    t.index ["city_id"], name: "index_service_city_prices_on_city_id"
    t.index ["service_id", "city_id"], name: "index_service_city_prices_unique", unique: true
    t.index ["service_id"], name: "index_service_city_prices_on_service_id"
    t.check_constraint "base_price >= 0::numeric", name: "check_scp_base_price_positive"
    t.check_constraint "discount_price IS NULL OR discount_price >= 0::numeric AND discount_price < base_price", name: "check_scp_discount_price_valid"
    t.check_constraint "status::text = ANY (ARRAY['active'::character varying::text, 'inactive'::character varying::text])", name: "check_scp_status"
  end

  create_table "service_consents", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "booking_id", null: false
    t.datetime "consented_at"
    t.datetime "created_at", null: false
    t.text "customer_signature_url"
    t.text "notes"
    t.string "product_source", limit: 20, default: "platform", null: false
    t.uuid "recorded_by_worker_id"
    t.boolean "terms_accepted", default: false, null: false
    t.string "terms_version", limit: 20
    t.datetime "updated_at", null: false
    t.index ["booking_id"], name: "index_service_consents_on_booking_id", unique: true
    t.check_constraint "product_source::text = ANY (ARRAY['platform'::character varying::text, 'customer'::character varying::text])", name: "check_consents_product_source"
  end

  create_table "service_products", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.datetime "created_at", null: false
    t.boolean "is_required", default: false, null: false
    t.uuid "product_id", null: false
    t.uuid "service_id", null: false
    t.datetime "updated_at", null: false
    t.index ["service_id", "product_id"], name: "index_service_products_on_service_id_and_product_id", unique: true
  end

  create_table "service_tier_prices", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.datetime "created_at", null: false
    t.decimal "price", precision: 10, scale: 2, null: false
    t.uuid "service_id", null: false
    t.datetime "updated_at", null: false
    t.uuid "worker_tier_id", null: false
    t.index ["service_id", "worker_tier_id"], name: "index_service_tier_prices_unique", unique: true
    t.check_constraint "price >= 0::numeric", name: "check_service_tier_price_positive"
  end

  create_table "services", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.text "about"
    t.decimal "base_price", precision: 10, scale: 2, null: false
    t.jsonb "benefits", default: []
    t.datetime "created_at", null: false
    t.text "description"
    t.decimal "discount_price", precision: 10, scale: 2
    t.integer "duration_minutes", default: 60, null: false
    t.boolean "featured", default: false, null: false
    t.text "image_url"
    t.string "name", limit: 150, null: false
    t.integer "position", default: 0, null: false
    t.jsonb "process", default: []
    t.string "slug", null: false
    t.string "status", limit: 20, default: "active", null: false
    t.uuid "subcategory_id", null: false
    t.string "tag", limit: 50, null: false
    t.datetime "updated_at", null: false
    t.index ["base_price"], name: "index_services_on_base_price"
    t.index ["featured"], name: "index_services_on_featured"
    t.index ["position"], name: "index_services_on_position"
    t.index ["slug"], name: "index_services_on_slug", unique: true
    t.index ["status"], name: "index_services_on_status"
    t.index ["subcategory_id"], name: "index_services_on_subcategory_id"
    t.index ["tag"], name: "index_services_on_tag"
    t.check_constraint "base_price >= 0::numeric", name: "check_services_base_price_positive"
    t.check_constraint "discount_price IS NULL OR discount_price >= 0::numeric AND discount_price < base_price", name: "check_services_discount_price_valid"
    t.check_constraint "status::text = ANY (ARRAY['active'::character varying::text, 'inactive'::character varying::text])", name: "check_services_status"
  end

  create_table "sessions", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.datetime "created_at", null: false
    t.datetime "expires_at", null: false
    t.inet "ip_address"
    t.datetime "revoked_at"
    t.string "token_digest", null: false
    t.text "user_agent"
    t.uuid "user_id", null: false
    t.index ["token_digest"], name: "index_sessions_on_token_digest", unique: true
    t.index ["user_id", "revoked_at", "expires_at"], name: "index_sessions_on_user_and_status"
    t.index ["user_id"], name: "index_sessions_on_user_id"
  end

  create_table "settings", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.datetime "created_at", null: false
    t.string "key", limit: 100, null: false
    t.datetime "updated_at", null: false
    t.text "value"
    t.index ["key"], name: "index_settings_on_key", unique: true
  end

  create_table "subcategories", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "category_id", null: false
    t.datetime "created_at", null: false
    t.text "description"
    t.boolean "featured", default: false, null: false
    t.string "name", limit: 120, null: false
    t.integer "position", default: 0, null: false
    t.string "slug", null: false
    t.string "status", limit: 20, default: "active", null: false
    t.datetime "updated_at", null: false
    t.index ["category_id", "position"], name: "index_subcategories_on_category_id_and_position"
    t.index ["category_id"], name: "index_subcategories_on_category_id"
    t.index ["featured"], name: "index_subcategories_on_featured"
    t.index ["slug"], name: "index_subcategories_on_slug", unique: true
    t.index ["status"], name: "index_subcategories_on_status"
    t.check_constraint "status::text = ANY (ARRAY['active'::character varying::text, 'inactive'::character varying::text])", name: "check_subcategories_status"
  end

  create_table "users", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "avatar_media_id"
    t.text "avatar_url"
    t.datetime "created_at", null: false
    t.string "email", limit: 200, null: false
    t.string "name", limit: 120, null: false
    t.string "password_digest", null: false
    t.string "phone", limit: 20, null: false
    t.datetime "reset_password_sent_at"
    t.string "reset_password_token", limit: 128
    t.string "role", limit: 20, default: "customer", null: false
    t.string "status", limit: 20, default: "active", null: false
    t.datetime "updated_at", null: false
    t.index "lower((email)::text)", name: "index_users_on_lower_email", unique: true
    t.index ["avatar_media_id"], name: "index_users_on_avatar_media_id"
    t.index ["phone"], name: "index_users_on_phone", unique: true
    t.index ["reset_password_token"], name: "index_users_on_reset_password_token", unique: true
    t.index ["role"], name: "index_users_on_role"
    t.index ["status"], name: "index_users_on_status"
    t.check_constraint "role::text = ANY (ARRAY['customer'::character varying::text, 'worker'::character varying::text, 'admin'::character varying::text])", name: "check_users_role"
    t.check_constraint "status::text = ANY (ARRAY['active'::character varying::text, 'inactive'::character varying::text])", name: "check_users_status"
  end

  create_table "worker_invitations", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.datetime "accepted_at"
    t.uuid "city_id"
    t.datetime "created_at", null: false
    t.string "email", limit: 255, null: false
    t.datetime "expires_at", null: false
    t.uuid "invited_by_id", null: false
    t.string "name", limit: 150
    t.string "phone", limit: 20
    t.string "speciality", limit: 150
    t.string "status", limit: 20, default: "pending", null: false
    t.string "token", limit: 128, null: false
    t.datetime "updated_at", null: false
    t.index ["city_id"], name: "index_worker_invitations_on_city_id"
    t.index ["email"], name: "index_worker_invitations_on_email"
    t.index ["invited_by_id"], name: "index_worker_invitations_on_invited_by_id"
    t.index ["status"], name: "index_worker_invitations_on_status"
    t.index ["token"], name: "index_worker_invitations_on_token", unique: true
    t.check_constraint "status::text = ANY (ARRAY['pending'::character varying::text, 'accepted'::character varying::text, 'expired'::character varying::text, 'revoked'::character varying::text])", name: "check_worker_invitations_status"
  end

  create_table "worker_profiles", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.string "aadhaar_number", limit: 12
    t.jsonb "available_days", default: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"], null: false
    t.text "bio"
    t.uuid "city_id"
    t.datetime "created_at", null: false
    t.integer "experience_years", default: 0, null: false
    t.boolean "is_available", default: true, null: false
    t.string "kyc_status", limit: 20, default: "pending", null: false
    t.decimal "latitude", precision: 9, scale: 6
    t.decimal "longitude", precision: 9, scale: 6
    t.decimal "rating_avg", precision: 3, scale: 2, default: "0.0", null: false
    t.integer "rating_count", default: 0, null: false
    t.jsonb "skills", default: [], null: false
    t.string "time_slot", default: "Full Day (Throughout the Day)", null: false
    t.datetime "updated_at", null: false
    t.string "upi_id", limit: 60
    t.uuid "user_id", null: false
    t.uuid "worker_tier_id"
    t.index ["available_days"], name: "index_worker_profiles_on_available_days", using: :gin
    t.index ["city_id"], name: "index_worker_profiles_on_city_id"
    t.index ["is_available"], name: "index_worker_profiles_on_is_available"
    t.index ["user_id"], name: "index_worker_profiles_on_user_id", unique: true
    t.index ["worker_tier_id"], name: "index_worker_profiles_on_worker_tier_id"
    t.check_constraint "experience_years >= 0", name: "check_worker_profiles_experience_non_negative"
    t.check_constraint "rating_avg >= 0::numeric AND rating_avg <= 5::numeric", name: "check_worker_profiles_rating_range"
  end

  create_table "worker_tiers", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.datetime "created_at", null: false
    t.string "name", limit: 20, null: false
    t.integer "position", default: 0, null: false
    t.decimal "price_multiplier", precision: 5, scale: 2, default: "1.0", null: false
    t.string "slug", null: false
    t.string "status", limit: 20, default: "active", null: false
    t.datetime "updated_at", null: false
    t.index ["slug"], name: "index_worker_tiers_on_slug", unique: true
    t.check_constraint "price_multiplier > 0::numeric", name: "check_worker_tiers_multiplier_positive"
    t.check_constraint "status::text = ANY (ARRAY['active'::character varying::text, 'inactive'::character varying::text])", name: "check_worker_tiers_status"
  end

  add_foreign_key "active_storage_attachments", "active_storage_blobs", column: "blob_id"
  add_foreign_key "active_storage_variant_records", "active_storage_blobs", column: "blob_id"
  add_foreign_key "addresses", "cities", on_delete: :nullify
  add_foreign_key "addresses", "users", on_delete: :cascade
  add_foreign_key "booking_extra_charges", "bookings", on_delete: :cascade
  add_foreign_key "booking_extra_charges", "products", on_delete: :nullify
  add_foreign_key "booking_extra_charges", "services", on_delete: :nullify
  add_foreign_key "booking_extra_charges", "users", column: "added_by_worker_id", on_delete: :nullify
  add_foreign_key "booking_items", "bookings", on_delete: :cascade
  add_foreign_key "booking_items", "cities", on_delete: :nullify
  add_foreign_key "booking_items", "services", on_delete: :nullify
  add_foreign_key "booking_items", "users", column: "worker_id", on_delete: :nullify
  add_foreign_key "booking_products", "bookings", on_delete: :cascade
  add_foreign_key "booking_products", "products", on_delete: :nullify
  add_foreign_key "booking_reschedule_requests", "bookings"
  add_foreign_key "booking_reschedule_requests", "users", column: "requested_by_id"
  add_foreign_key "booking_reschedule_requests", "users", column: "resolved_by_id"
  add_foreign_key "booking_reschedule_requests", "users", column: "worker_id"
  add_foreign_key "bookings", "addresses", on_delete: :nullify
  add_foreign_key "bookings", "cities", on_delete: :nullify
  add_foreign_key "bookings", "coupons", on_delete: :nullify
  add_foreign_key "bookings", "users", column: "customer_id", on_delete: :cascade
  add_foreign_key "bookings", "users", column: "worker_id", on_delete: :nullify
  add_foreign_key "bookings", "worker_tiers", on_delete: :nullify
  add_foreign_key "cart_items", "carts", on_delete: :cascade
  add_foreign_key "cart_items", "cities", on_delete: :nullify
  add_foreign_key "cart_items", "services", on_delete: :cascade
  add_foreign_key "cart_items", "users", column: "worker_id", on_delete: :nullify
  add_foreign_key "carts", "cities", on_delete: :nullify
  add_foreign_key "carts", "coupons", on_delete: :nullify
  add_foreign_key "carts", "users", column: "worker_id", on_delete: :nullify
  add_foreign_key "carts", "users", on_delete: :cascade
  add_foreign_key "favorites", "services", on_delete: :cascade
  add_foreign_key "favorites", "users", on_delete: :cascade
  add_foreign_key "live_locations", "bookings", on_delete: :cascade
  add_foreign_key "live_locations", "users", on_delete: :cascade
  add_foreign_key "notifications", "users", column: "created_by_id", on_delete: :nullify
  add_foreign_key "notifications", "users", on_delete: :cascade
  add_foreign_key "payments", "bookings", on_delete: :cascade
  add_foreign_key "reviews", "bookings", on_delete: :cascade
  add_foreign_key "reviews", "services"
  add_foreign_key "reviews", "users", column: "customer_id", on_delete: :cascade
  add_foreign_key "reviews", "users", column: "worker_id", on_delete: :nullify
  add_foreign_key "service_city_prices", "cities", on_delete: :cascade
  add_foreign_key "service_city_prices", "services", on_delete: :cascade
  add_foreign_key "service_consents", "bookings", on_delete: :cascade
  add_foreign_key "service_consents", "users", column: "recorded_by_worker_id", on_delete: :nullify
  add_foreign_key "service_products", "products", on_delete: :cascade
  add_foreign_key "service_products", "services", on_delete: :cascade
  add_foreign_key "service_tier_prices", "services", on_delete: :cascade
  add_foreign_key "service_tier_prices", "worker_tiers", on_delete: :cascade
  add_foreign_key "services", "subcategories", on_delete: :restrict
  add_foreign_key "sessions", "users", on_delete: :cascade
  add_foreign_key "subcategories", "categories", on_delete: :restrict
  add_foreign_key "users", "media", column: "avatar_media_id", on_delete: :nullify
  add_foreign_key "worker_invitations", "cities", on_delete: :nullify
  add_foreign_key "worker_invitations", "users", column: "invited_by_id", on_delete: :cascade
  add_foreign_key "worker_profiles", "cities", on_delete: :nullify
  add_foreign_key "worker_profiles", "users", on_delete: :cascade
  add_foreign_key "worker_profiles", "worker_tiers", on_delete: :nullify
end
