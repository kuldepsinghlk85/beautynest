# frozen_string_literal: true

class CreateSettings < ActiveRecord::Migration[8.1]
  def change
    create_table :settings, id: :uuid, default: -> { "gen_random_uuid()" } do |t|
      t.string :key, limit: 100, null: false
      t.text   :value

      t.timestamps
    end

    add_index :settings, :key, unique: true
  end
end
