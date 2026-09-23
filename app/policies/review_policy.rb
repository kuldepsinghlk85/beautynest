# frozen_string_literal: true
class ReviewPolicy < ApplicationPolicy
  def index?  = admin? || worker?
  def show?   = admin? || (worker? && record.worker_id == user.id)
  def create? = admin?
  def update? = admin?
  def destroy? = admin?
  class Scope < ApplicationPolicy::Scope
    def resolve
      return scope.all if user&.admin?
      return scope.where(worker_id: user.id) if user&.worker?
      scope.none
    end
  end
  private
  def admin?  = user&.admin?
  def worker? = user&.worker?
end
