# frozen_string_literal: true

class CreateWorkerProfiles < ActiveRecord::Migration[8.1]
  def change
    create_table :worker_profiles, id: :uuid, default: -> { "gen_random_uuid()" } do |t|
      t.uuid    :user_id,          null: false
      t.text    :bio
      t.integer :experience_years, null: false, default: 0
      t.decimal :rating_avg,       precision: 3, scale: 2, null: false, default: 0.0
      t.integer :rating_count,     null: false, default: 0
      t.boolean :is_available,     null: false, default: true
      t.datetime :created_at, null: false
      t.datetime :updated_at, null: false
    end

    add_index :worker_profiles, :user_id, unique: true
    add_index :worker_profiles, :is_available
    add_foreign_key :worker_profiles, :users, on_delete: :cascade
    add_check_constraint :worker_profiles, "experience_years >= 0", name: "check_worker_profiles_experience_non_negative"
    add_check_constraint :worker_profiles, "rating_avg >= 0 AND rating_avg <= 5", name: "check_worker_profiles_rating_range"
  end
end
