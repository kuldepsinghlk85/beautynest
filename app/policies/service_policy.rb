# frozen_string_literal: true

class ServicePolicy < ApplicationPolicy
  # Admin panel: only admins
  def index?   = admin? || worker?
  def show?    = admin? || worker?
  def create?  = admin?
  def update?  = admin?
  def destroy? = admin?
  def new?     = admin?
  def edit?    = admin?

  class Scope < ApplicationPolicy::Scope
    def resolve
      if user&.admin?
        scope.all
      elsif user&.worker?
        scope.active
      else
        scope.none
      end
    end
  end

  private

  def admin? = user&.admin?
end
