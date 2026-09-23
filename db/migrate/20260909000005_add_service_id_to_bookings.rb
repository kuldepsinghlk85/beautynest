class AddServiceIdToBookings < ActiveRecord::Migration[8.1]
  def change
    # Nullable FK — existing bookings keep their free-text service_name
    add_column :bookings, :service_id, :uuid, null: true
    add_index  :bookings, :service_id
    add_foreign_key :bookings, :services, column: :service_id, on_delete: :nullify
  end
end
