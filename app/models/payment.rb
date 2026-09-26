# frozen_string_literal: true

class Payment < ApplicationRecord
  METHODS  = %w[cash card upi wallet cod].freeze
  STATUSES = %w[pending completed failed refunded].freeze

  belongs_to :booking

  validates :amount,  numericality: { greater_than: 0 }
  validates :method,  presence: true, inclusion: { in: METHODS }
  validates :status,  presence: true, inclusion: { in: STATUSES }

  def payment_method
    has_attribute?(:payment_method) ? read_attribute(:payment_method) : read_attribute(:method)
  end

  def payment_method=(val)
    if has_attribute?(:payment_method)
      write_attribute(:payment_method, val)
    else
      write_attribute(:method, val)
    end
  end

  scope :completed, -> { where(status: "completed") }
  scope :pending,   -> { where(status: "pending") }

  def customer
    booking&.customer&.name || "Customer"
  end

  def customer_name
    customer
  end

  def [](attr)
    case attr.to_sym
    when :customer then customer
    when :customer_name then customer_name
    else super
    end
  end

  def display_amount
    return "₹0" if amount.nil?
    (amount.to_f % 1).zero? ? "₹#{amount.to_i}" : "₹#{sprintf('%.2f', amount.to_f)}"
  end

  def mark_completed!(transaction_ref: nil)
    update!(status: "completed", paid_at: Time.current, transaction_ref: transaction_ref)
  end
end
