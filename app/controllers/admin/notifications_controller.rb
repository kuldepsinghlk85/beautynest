# frozen_string_literal: true

module Admin
  class NotificationsController < BaseController
    before_action :set_notification, only: %i[show edit update destroy]

    def index
      authorize :notification, :index?, policy_class: NotificationPolicy
      scope = if current_user&.admin? && params[:view] == "broadcasts"
                Notification.all.recent
              else
                policy_scope(Notification, policy_scope_class: NotificationPolicy::Scope).recent
              end
      @notifications = paginate(scope, per_page: 10)
      @unread_count  = current_user ? current_user.notifications.unread.count : 0
    end

    def show
      authorize @notification, :show?, policy_class: NotificationPolicy
      @notification.mark_as_read! if @notification.user_id == current_user&.id || current_user&.admin?
    end

    def new
      authorize :notification, :new?, policy_class: NotificationPolicy
      @notification = Notification.new
    end

    def create
      authorize :notification, :create?, policy_class: NotificationPolicy

      recipient_users = resolve_recipients(params[:notification][:recipient_type])
      created = 0

      recipient_users.each do |u|
        Notification.create!(
          user:           u,
          creator:        current_user,
          subject:        params[:notification][:subject],
          body:           params[:notification][:body],
          channel:        params[:notification][:channel].presence || "push",
          status:         "sent",
          recipient_type: params[:notification][:recipient_type].presence || "specific_user",
          sent_at:        Time.current
        )
        created += 1
      end

      redirect_to admin_notifications_path, notice: "#{created} notification(s) dispatched successfully."
    end

    def edit
      authorize @notification, :edit?, policy_class: NotificationPolicy
    end

    def update
      authorize @notification, :update?, policy_class: NotificationPolicy
      redirect_to admin_notification_path(@notification), notice: "Notification updated."
    end

    def destroy
      if @notification.present?
        authorize @notification, :destroy?, policy_class: NotificationPolicy
        @notification.destroy
        redirect_to admin_notifications_path, notice: "Notification deleted.", status: :see_other
      else
        skip_authorization
        redirect_to admin_notifications_path, status: :see_other
      end
    end

    def unread_count
      authorize :notification, :unread_count?, policy_class: NotificationPolicy
      count = current_user ? current_user.notifications.unread.count : 0
      render json: { unread_count: count }
    end

    private

    def set_notification
      id = params[:id].to_s.strip
      @notification = if id.match?(/\A[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\z/i)
                        Notification.find_by(id: id)
                      else
                        Notification.where("id::text LIKE ?", "#{id.downcase}%").first
                      end
      unless @notification
        skip_authorization
        redirect_to admin_notifications_path, status: :see_other
      end
    end

    def resolve_recipients(recipient_type)
      case recipient_type
      when "all_customers" then User.customers.active
      when "all_workers"   then User.workers.active
      when "all_admins"    then User.admins.active
      when "specific_user"
        user = User.find_by(id: params[:notification][:user_id])
        user ? [user] : []
      else
        []
      end
    end
  end
end
