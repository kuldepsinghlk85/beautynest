# frozen_string_literal: true

# Shared admin super-policy.
# All admin controllers use a single admin role — every action is allowed.
# When granular sub-roles are added, subclass this policy.
class AdminPolicy < ApplicationPolicy
  def index?   = admin?
  def show?    = admin?
  def new?     = admin?
  def create?  = admin?
  def edit?    = admin?
  def update?  = admin?
  def destroy? = admin?

  class Scope < ApplicationPolicy::Scope
    def resolve
      admin? ? scope.all : scope.none
    end

    private

    def admin?
      user&.admin? && user&.active?
    end
  end

  private

  def admin?
    user&.admin? && user&.active?
  end
end