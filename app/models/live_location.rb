# frozen_string_literal: true

class LiveLocation < ApplicationRecord
  belongs_to :user
  belongs_to :booking, optional: true

  validates :latitude, presence: true, numericality: true
  validates :longitude, presence: true, numericality: true
  validates :recorded_at, presence: true

  scope :recent, -> { order(recorded_at: :desc) }
end
