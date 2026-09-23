# frozen_string_literal: true
class BookingPolicy < ApplicationPolicy
  def index?   = admin? || worker?
  def show?    = admin? || (worker? && record.try(:worker_id).to_s == user.id.to_s)
  def create?  = admin?
  def new?     = admin?
  def update?  = admin? || (worker? && record.try(:worker_id).to_s == user.id.to_s)
  def edit?    = admin?

  def accept?
    worker? && record.try(:worker_id).to_s == user.id.to_s
  end

  def reject?
    worker? && record.try(:worker_id).to_s == user.id.to_s
  end

  def complete_service?
    admin? || (worker? && record.try(:worker_id).to_s == user.id.to_s)
  end

  def complete_payment?
    admin? || (worker? && record.try(:worker_id).to_s == user.id.to_s)
  end

  def approve_reschedule? = admin?
  def reassign_reschedule? = admin?
  def reject_reschedule?   = admin?

  class Scope < ApplicationPolicy::Scope
    def resolve
      return scope.all if user&.admin?
      return scope.for_worker(user.id) if user&.worker?
      scope.none
    end
  end
  private
  def admin?  = user&.admin?
  def worker? = user&.worker?
end
