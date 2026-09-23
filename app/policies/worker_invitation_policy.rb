# frozen_string_literal: true

class WorkerInvitationPolicy < ApplicationPolicy
  def index?
    admin?
  end

  def new?
    admin?
  end

  def create?
    admin?
  end

  def resend?
    admin?
  end

  def revoke?
    admin?
  end

  class Scope < ApplicationPolicy::Scope
    def resolve
      if user&.admin? && user&.active?
        scope.all
      else
        scope.none
      end
    end
  end

  private

  def admin?
    user&.admin? && user&.active?
  end
end
