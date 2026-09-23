# frozen_string_literal: true

module Api
  module V1
    # Notification endpoints — scoped strictly to current_api_user.
    # Customers and Workers both use these endpoints (role from JWT).
    class NotificationsController < BaseController
      before_action :set_notification, only: %i[show read destroy]

      # GET /api/v1/notifications
      def index
        scope = current_api_user.notifications.recent
        scope = scope.unread if params[:unread].in?(%w[true 1])
        scope = scope.for_channel(params[:channel])
        scope = scope.for_status(params[:status])

        page     = [params.fetch(:page, 1).to_i, 1].max
        per_page = [[params.fetch(:per_page, 20).to_i, 1].max, 100].min
        total    = scope.count
        items    = scope.offset((page - 1) * per_page).limit(per_page)

        render_item(
          items.map(&:as_json_api),
          extra: {
            unread_count: current_api_user.notifications.unread.count,
            pagination: {
              page:        page,
              per_page:    per_page,
              total_count: total,
              total_pages: (total.to_f / per_page).ceil
            }
          }
        )
      end

      # GET /api/v1/notifications/:id
      def show
        render_item(@notification.as_json_api)
      end

      # PATCH /api/v1/notifications/:id/read
      def read
        @notification.mark_as_read!
        render_item(
          { id: @notification.id, subject: @notification.subject, read: true, read_at: @notification.read_at },
          message: "Notification marked as read."
        )
      end

      # PATCH /api/v1/notifications/read_all
      def read_all
        marked = current_api_user.notifications.unread.update_all(read_at: Time.current)
        render_item({ marked_count: marked }, message: "All notifications marked as read.")
      end

      # GET /api/v1/notifications/unread_count
      def unread_count
        render_item({ unread_count: current_api_user.notifications.unread.count })
      end

      # DELETE /api/v1/notifications/:id
      def destroy
        @notification.destroy
        render_item({ id: params[:id] }, message: "Notification deleted.")
      end

      private

      def set_notification
        @notification = current_api_user.notifications.find(params[:id])
      end
    end
  end
end
