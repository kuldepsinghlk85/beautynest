# frozen_string_literal: true

class NotificationPolicy < ApplicationPolicy
  # Admin sees everything; worker/customer see only own notifications
  def index?  = admin? || worker? || customer?
  def show?   = admin? || owns_notification?
  def new?    = admin?
  def create? = admin?
  def edit?   = admin?
  def update? = admin?
  def destroy?
    admin? || owns_notification?
  end

  def read?     = owns_notification?
  def read_all? = user.present? && user.active?
  def unread_count? = user.present? && user.active?

  class Scope < ApplicationPolicy::Scope
    def resolve
      if user.present? && user.active?
        scope.where(user_id: user.id)
      else
        scope.none
      end
    end
  end

  private

  def owns_notification?
    return false unless user.present? && user.active?
    return false unless record.respond_to?(:user_id)
    record.user_id.to_s == user.id.to_s
  end
end
