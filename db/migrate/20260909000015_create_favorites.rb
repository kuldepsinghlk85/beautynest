# frozen_string_literal: true

class CreateFavorites < ActiveRecord::Migration[8.1]
  def change
    create_table :favorites, id: :uuid, default: -> { "gen_random_uuid()" } do |t|
      t.uuid    :user_id,    null: false
      t.uuid    :service_id, null: false
      t.datetime :created_at, null: false, default: -> { "now()" }
    end

    add_index :favorites, %i[user_id service_id], unique: true
    add_index :favorites, :service_id
    add_foreign_key :favorites, :users,    on_delete: :cascade
    add_foreign_key :favorites, :services, on_delete: :cascade
  end
end
