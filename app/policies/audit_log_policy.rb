# frozen_string_literal: true

class AuditLogPolicy < AdminPolicy
  def index? = admin?
  def show?  = admin?

  # Audit logs are strictly immutable and append-only
  def new?     = false
  def create?  = false
  def edit?    = false
  def update?  = false
  def destroy? = false
end
