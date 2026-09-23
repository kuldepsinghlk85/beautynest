# frozen_string_literal: true

class UpdateBookingAndServiceStatuses < ActiveRecord::Migration[8.1]
  def up
    # 1. Ensure booking_number exists
    unless column_exists?(:bookings, :booking_number)
      add_column :bookings, :booking_number, :string, limit: 30
      add_index :bookings, :booking_number
    end

    # 2. Rename status column to booking_status
    if column_exists?(:bookings, :status) && !column_exists?(:bookings, :booking_status)
      rename_column :bookings, :status, :booking_status
    elsif !column_exists?(:bookings, :booking_status)
      add_column :bookings, :booking_status, :string, limit: 30, default: "pending", null: false
    end

    # 3. Add service_status column
    unless column_exists?(:bookings, :service_status)
      add_column :bookings, :service_status, :string, limit: 30, default: "pending", null: false
      add_index :bookings, :service_status
    end

    # 4. Migrate and backfill existing data
    execute <<-SQL
      UPDATE bookings
      SET service_status = CASE
        WHEN booking_status = 'completed' THEN 'completed'
        WHEN booking_status = 'in_progress' THEN 'in_progress'
        WHEN booking_status IN ('cancelled', 'rejected') THEN 'cancelled'
        ELSE 'pending'
      END,
      booking_status = CASE
        WHEN booking_status IN ('in_progress', 'completed') THEN 'confirmed'
        ELSE booking_status
      END;
    SQL
  end

  def down
    if column_exists?(:bookings, :service_status)
      remove_index :bookings, :service_status if index_exists?(:bookings, :service_status)
      remove_column :bookings, :service_status
    end

    if column_exists?(:bookings, :booking_status) && !column_exists?(:bookings, :status)
      rename_column :bookings, :booking_status, :status
    end
  end
end
