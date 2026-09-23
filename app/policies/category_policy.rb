# frozen_string_literal: true

class CategoryPolicy < ApplicationPolicy
  # Admin panel: only admins
  def index?   = admin?
  def show?    = admin?
  def create?  = admin?
  def update?  = admin?
  def destroy? = admin?
  def new?     = admin?
  def edit?    = admin?

  class Scope < ApplicationPolicy::Scope
    def resolve
      user&.admin? ? scope.all : scope.none
    end
  end

  private

  def admin? = user&.admin?
end
