# frozen_string_literal: true

# Drop the JSONB addresses column and text avatar_url from users.
# Replace with: avatar_media_id (FK to media).
# Addresses now live in the addresses table.
class AlterUsersNewSchema < ActiveRecord::Migration[8.1]
  def change
    # Remove old denormalized columns
    remove_column :users, :addresses, :jsonb
    remove_column :users, :avatar_url, :text

    # Add typed FK to media for avatar
    add_column  :users, :avatar_media_id, :uuid
    add_index   :users, :avatar_media_id
    add_foreign_key :users, :media, column: :avatar_media_id, on_delete: :nullify
  end
end
