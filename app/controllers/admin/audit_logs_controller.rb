# frozen_string_literal: true

module Admin
  class AuditLogsController < BaseController
    before_action :set_audit_log, only: :show

    # GET /admin/audit_logs
    def index
      authorize AuditLog
      scope = policy_scope(AuditLog).ordered

      # Filters
      scope = scope.by_action(params[:audit_action]) if params[:audit_action].present?
      scope = scope.by_auditable_type(params[:auditable_type]) if params[:auditable_type].present?
      scope = scope.search(params[:search]) if params[:search].present?

      # Server-side pagination
      @audit_logs  = paginate(scope, per_page: 10)
      @per_page    = @audit_logs.limit_value
      @page        = @audit_logs.current_page
      @total_count = @audit_logs.total_count
      @total_pages = @audit_logs.total_pages

      # For filter dropdowns
      @actions          = AuditLog.distinct.pluck(:action).compact.sort
      @auditable_types  = AuditLog.distinct.pluck(:auditable_type).compact.sort
    end

    # GET /admin/audit_logs/:id
    def show
      authorize @audit_log
      respond_to do |format|
        format.html
        format.json do
          render json: {
            id: @audit_log.id,
            action: @audit_log.action,
            action_display_name: @audit_log.action_display_name,
            auditable_type: @audit_log.auditable_type,
            auditable_id: @audit_log.auditable_id,
            auditable_name: @audit_log.auditable_name,
            actor: {
              id: @audit_log.user_id,
              name: @audit_log.actor_display,
              email: @audit_log.user&.email,
              role: @audit_log.actor_role
            },
            security_trace: {
              ip_address: @audit_log.ip_address,
              user_agent: @audit_log.user_agent,
              created_at: @audit_log.created_at
            },
            changeset: @audit_log.parsed_changes,
            raw_payload: @audit_log.changes_payload
          }
        end
      end
    end

    private

    def set_audit_log
      @audit_log = AuditLog.find(params[:id])
    end
  end
end
