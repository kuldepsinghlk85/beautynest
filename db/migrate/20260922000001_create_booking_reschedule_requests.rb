# frozen_string_literal: true

class CreateBookingRescheduleRequests < ActiveRecord::Migration[8.0]
  def change
    create_table :booking_reschedule_requests, id: :uuid do |t|
      t.references :booking,        null: false, type: :uuid, foreign_key: true, index: true
      t.references :worker,         null: false, type: :uuid, foreign_key: { to_table: :users }, index: true
      t.references :requested_by,   null: false, type: :uuid, foreign_key: { to_table: :users }, index: true
      t.references :resolved_by,    null: true,  type: :uuid, foreign_key: { to_table: :users }, index: true

      t.string   :status,               null: false, default: "pending"
      t.string   :request_type,          null: false, default: "cannot_reach"
      t.datetime :current_scheduled_at
      t.string   :current_time_slot
      t.date     :requested_date
      t.string   :requested_time_slot
      t.text     :reason,               null: false
      t.text     :admin_notes
      t.string   :action_taken
      t.datetime :resolved_at

      t.timestamps
    end

    add_index :booking_reschedule_requests, :status
    add_index :booking_reschedule_requests, :request_type
  end
end
