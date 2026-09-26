# frozen_string_literal: true

class CreateReviews < ActiveRecord::Migration[8.1]
  def change
    create_table :reviews, id: :uuid, default: -> { "gen_random_uuid()" } do |t|
      t.uuid    :booking_id,  null: false
      t.uuid    :customer_id, null: false
      t.uuid    :worker_id                   # nullable — worker may be unassigned/deleted
      t.integer :rating,      null: false
      t.text    :comment
      t.datetime :created_at, null: false, default: -> { "now()" }
    end

    add_index :reviews, :booking_id, unique: true   # one review per booking
    add_index :reviews, :customer_id
    add_index :reviews, :worker_id
    add_index :reviews, :rating
    add_foreign_key :reviews, :bookings, on_delete: :cascade
    add_foreign_key :reviews, :users, column: :customer_id, on_delete: :cascade
    add_foreign_key :reviews, :users, column: :worker_id,   on_delete: :nullify
    add_check_constraint :reviews, "rating BETWEEN 1 AND 5", name: "check_reviews_rating_range"
  end
end
