# frozen_string_literal: true

class AddAadhaarNumberToWorkerProfiles < ActiveRecord::Migration[8.1]
  def change
    add_column :worker_profiles, :aadhaar_number, :string, limit: 12
  end
end
