# frozen_string_literal: true
class CouponPolicy < ApplicationPolicy
  def index?   = admin?
  def show?    = admin?
  def create?  = admin?
  def new?     = admin?
  def update?        = admin?
  def edit?          = admin?
  def destroy?       = admin?
  def toggle_status? = admin?
  class Scope < ApplicationPolicy::Scope
    def resolve = user&.admin? ? scope.all : scope.none
  end
  private
  def admin? = user&.admin?
end
