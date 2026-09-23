# frozen_string_literal: true

class AddCityIdToAddressesAndWorkerProfiles < ActiveRecord::Migration[8.1]
  def change
    add_column :addresses, :city_id, :uuid
    add_index  :addresses, :city_id
    add_foreign_key :addresses, :cities, on_delete: :nullify

    add_column :worker_profiles, :city_id, :uuid
    add_index  :worker_profiles, :city_id
    add_foreign_key :worker_profiles, :cities, on_delete: :nullify
  end
end
