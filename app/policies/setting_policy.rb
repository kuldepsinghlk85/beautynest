# frozen_string_literal: true

class SettingPolicy < ApplicationPolicy
  def show?   = admin?
  def edit?   = admin?
  def update? = admin?

  private

  def admin?
    user&.admin? && user&.active?
  end
end
