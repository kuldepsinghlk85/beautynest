# frozen_string_literal: true

class UserPolicy < ApplicationPolicy
  def index?
    admin?
  end

  def show?
    if record.customer?
      CustomerPolicy.new(user, record).show?
    elsif record.worker?
      WorkerPolicy.new(user, record).show?
    else
      admin?
    end
  end

  def update?
    if record.customer?
      CustomerPolicy.new(user, record).update?
    elsif record.worker?
      WorkerPolicy.new(user, record).update?
    else
      admin?
    end
  end

  def destroy?
    if record.customer?
      CustomerPolicy.new(user, record).destroy?
    else
      admin?
    end
  end

  class Scope < ApplicationPolicy::Scope
    def resolve
      if user&.admin? && user&.active?
        scope.all
      elsif user&.worker? && user&.active?
        scope.where(id: [user.id] + user.associated_customer_ids)
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
end
