# frozen_string_literal: true
class PaymentPolicy < ApplicationPolicy
  def index?   = admin? || worker?
  def show?    = admin? || (worker? && record.booking&.worker_id.to_s == user.id.to_s)
  def create?  = admin?
  def new?     = admin?
  def update?  = admin?
  def edit?    = admin?

  class Scope < ApplicationPolicy::Scope
    def resolve
      if user&.admin?
        scope.all
      elsif user&.worker?
        scope.joins(:booking).where(bookings: { worker_id: user.id })
      else
        scope.none
      end
    end
  end

  private
  def admin?  = user&.admin?
  def worker? = user&.worker?
end
