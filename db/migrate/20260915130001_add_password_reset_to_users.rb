# frozen_string_literal: true

class AddPasswordResetToUsers < ActiveRecord::Migration[8.0]
  def change
    add_column :users, :reset_password_token, :string, limit: 128
    add_column :users, :reset_password_sent_at, :datetime

    add_index :users, :reset_password_token, unique: true
  end
end
