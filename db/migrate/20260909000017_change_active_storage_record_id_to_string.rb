# frozen_string_literal: true

class ChangeActiveStorageRecordIdToString < ActiveRecord::Migration[8.1]
  def up
    change_column :active_storage_attachments, :record_id, :string
  end

  def down
    change_column :active_storage_attachments, :record_id, :bigint
  end
end
