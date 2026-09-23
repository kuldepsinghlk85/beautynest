# frozen_string_literal: true

class AddAvailabilityFieldsToWorkerProfiles < ActiveRecord::Migration[8.1]
  def change
    add_column :worker_profiles, :available_days, :jsonb,
               default: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
               null: false
    add_column :worker_profiles, :time_slot, :string,
               default: "Full Day (Throughout the Day)",
               null: false

    add_index :worker_profiles, :available_days, using: :gin

    reversible do |dir|
      dir.up do
        execute <<~SQL
          UPDATE worker_profiles
          SET available_days = '["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]'::jsonb
          WHERE available_days IS NULL;

          UPDATE worker_profiles
          SET time_slot = 'Full Day (Throughout the Day)'
          WHERE time_slot IS NULL;
        SQL
      end
    end
  end
end
