# frozen_string_literal: true

module Admin
  class CustomersController < BaseController
    def index
      base_scope = policy_scope(User, policy_scope_class: CustomerPolicy::Scope)
      @total_customers = base_scope.count
      @active_customers = base_scope.where(status: "active").count
      @inactive_customers = base_scope.where(status: "inactive").count
      @new_this_month = base_scope.where("created_at >= ?", Time.current.beginning_of_month).count

      scope = base_scope.order(created_at: :desc)

      if params[:q].present?
        q = "%#{params[:q].to_s.strip.downcase}%"
        scope = scope.where("LOWER(name) LIKE ? OR LOWER(email) LIKE ? OR phone LIKE ?", q, q, q)
      end

      if params[:status].present? && %w[active inactive].include?(params[:status].to_s.downcase)
        scope = scope.where(status: params[:status].to_s.downcase)
      end

      respond_to do |format|
        format.html do
          @customers = paginate(scope, per_page: 10)
        end
        format.csv do
          AuditLogger.log(
            actor: current_user,
            action: "export_customers_csv",
            record: current_user,
            record_name: "Customers CSV Export",
            metadata: { count: scope.count },
            request: request
          )
          send_data CsvExportService.customers_csv(scope),
                    filename: "customers-export-#{Time.current.strftime('%Y%m%d%H%M')}.csv",
                    type: "text/csv; charset=utf-8",
                    disposition: "attachment"
        end
      end
    end

    def show
      @customer = User.customers.find_by(id: params[:id])
      unless @customer
        skip_authorization
        redirect_to admin_customers_path, alert: "Customer not found."
        return
      end
      authorize @customer, policy_class: CustomerPolicy
      @bookings = current_user.admin? ? @customer.customer_bookings : @customer.customer_bookings.for_worker(current_user.id)
      @bookings = @bookings.includes(:booking_items, :payments).order(created_at: :desc)
      @addresses = @customer.addresses.default_first
    end

    def destroy
      @customer = User.customers.find_by(id: params[:id])
      if @customer
        authorize @customer, policy_class: CustomerPolicy
        name = @customer.name
        AuditLogger.log(
          actor: current_user,
          action: "destroy",
          record: @customer,
          auditable_type: "Customer",
          record_name: "Customer #{name}",
          request: request
        )
        @customer.destroy
        redirect_to admin_customers_path, status: :see_other, notice: "Customer '#{name}' was deleted successfully."
      else
        skip_authorization
        redirect_to admin_customers_path, status: :see_other, alert: "Customer not found."
      end
    end

    def toggle_status
      @customer = User.customers.find_by(id: params[:id])
      if @customer
        authorize @customer, :toggle_status?, policy_class: CustomerPolicy
        new_status = @customer.active? ? "inactive" : "active"
        @customer.update!(status: new_status)
        if new_status == "inactive"
          @customer.sessions.active.update_all(revoked_at: Time.current)
        end
        AuditLogger.log(
          actor: current_user,
          action: "toggle_status",
          record: @customer,
          auditable_type: "Customer",
          record_name: "Customer #{@customer.name}",
          changes: @customer.saved_changes,
          request: request
        )
        action_text = new_status == "active" ? "activated" : "deactivated"
        redirect_to admin_customers_path, status: :see_other, notice: "Customer '#{@customer.name}' has been #{action_text}."
      else
        skip_authorization
        redirect_to admin_customers_path, status: :see_other, alert: "Customer not found."
      end
    end
  end
end
