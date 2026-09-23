# frozen_string_literal: true

class WorkerPolicy < ApplicationPolicy
  def index?
    admin?
  end

  def show?
    return true if admin?
    return false unless worker?

    own_worker_profile?
  end

  def new?
    admin?
  end

  def create?
    admin?
  end

  def edit?
    update?
  end

  def update?
    return true if admin?
    return false unless worker?

    own_worker_profile?
  end

  def destroy?
    admin?
  end

  class Scope < ApplicationPolicy::Scope
    def resolve
      if user&.admin? && user&.active?
        scope.all
      elsif user&.worker? && user&.active?
        scope.where(id: user.id)
      else
        scope.none
      end
    end
  end

  private

  def admin?
    user&.admin? && user&.active?
  end

  def worker?
    user&.worker? && user&.active?
  end

  def own_worker_profile?
    rec_id = record.is_a?(Hash) ? (record[:user_id] || record[:id]).to_s : record.id.to_s
    rec_id == user.id.to_s
  end
end
