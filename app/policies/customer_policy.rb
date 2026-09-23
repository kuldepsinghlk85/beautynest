# frozen_string_literal: true

class CustomerPolicy < ApplicationPolicy
  def index?
    admin? || worker?
  end

  def show?
    return true if admin?
    return true if customer? && own_record?
    return false unless worker?

    customer_belongs_to_worker?
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
    admin? || (customer? && own_record?)
  end

  def destroy?
    admin? || (customer? && own_record?)
  end

  def toggle_status?
    admin?
  end

  class Scope < ApplicationPolicy::Scope
    def resolve
      if user&.admin? && user&.active?
        scope.customers
      elsif user&.worker? && user&.active?
        user.associated_customers
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

  def customer?
    user&.customer? && user&.active?
  end

  def own_record?
    rec_id = record.is_a?(Hash) ? record[:id].to_s : record.id.to_s
    user.id.to_s == rec_id
  end

  def customer_belongs_to_worker?
    cust_id = record.is_a?(Hash) ? record[:id].to_s : record.id.to_s
    user.associated_customer_ids.map(&:to_s).include?(cust_id)
  end
end
