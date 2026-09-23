# frozen_string_literal: true

class AddAboutBenefitsProcessToServicesAndServiceIdToReviews < ActiveRecord::Migration[8.1]
  def change
    add_column :services, :about, :text
    add_column :services, :benefits, :jsonb, default: []
    add_column :services, :process, :jsonb, default: []

    add_reference :reviews, :service, type: :uuid, foreign_key: true, index: true
    change_column_null :reviews, :booking_id, true

    remove_index :reviews, name: "index_reviews_on_booking_id", if_exists: true
    add_index :reviews, :booking_id

    add_index :reviews, %i[customer_id booking_id], unique: true, where: "service_id IS NULL", name: "index_reviews_unique_booking_review"
    add_index :reviews, %i[customer_id service_id], unique: true, where: "service_id IS NOT NULL", name: "index_reviews_unique_service_review"
  end
end
