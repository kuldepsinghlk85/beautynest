# frozen_string_literal: true

class CreateMedia < ActiveRecord::Migration[8.1]
  def change
    create_table :media, id: :uuid, default: -> { "gen_random_uuid()" } do |t|
      t.string  :owner_type, limit: 30, null: false
      t.uuid    :owner_id,              null: false
      t.text    :url,                   null: false
      t.string  :content_type
      t.integer :position, null: false, default: 0
      t.datetime :created_at, null: false, default: -> { "now()" }
    end

    add_index :media, %i[owner_type owner_id], name: "index_media_on_owner"
    add_index :media, %i[owner_type owner_id position], name: "index_media_on_owner_and_position"
  end
end
