# frozen_string_literal: true

class AddKycFieldsToWorkerProfiles < ActiveRecord::Migration[8.1]
  def change
    add_column :worker_profiles, :upi_id,     :string, limit: 60
    add_column :worker_profiles, :kyc_status, :string, limit: 20, default: "pending", null: false
    add_column :worker_profiles, :skills,     :jsonb,  default: [], null: false
  end
end
