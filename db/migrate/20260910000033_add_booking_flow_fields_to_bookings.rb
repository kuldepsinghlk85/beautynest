# frozen_string_literal: true

class AddBookingFlowFieldsToBookings < ActiveRecord::Migration[8.0]
  def change
    add_column :bookings, :time_slot, :string, limit: 50
    add_reference :bookings, :city, type: :uuid, foreign_key: { on_delete: :nullify }, index: true
  end
end
