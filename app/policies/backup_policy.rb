# frozen_string_literal: true

class BackupPolicy < ApplicationPolicy
  def export?
    user&.admin? && user&.active?
  end

  def import?
    user&.admin? && user&.active?
  end
end
