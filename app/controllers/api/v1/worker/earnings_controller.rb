# frozen_string_literal: true

module Api
  module V1
    module Worker
      # GET /api/v1/worker/earnings — summary of completed job payouts
      class EarningsController < BaseController
        before_action :require_worker!

        def index
          completed = current_api_user.worker_bookings
                                      .where(service_status: "completed")
                                      .order(created_at: :desc)

          render_success(
            {
              total_earnings: completed.sum(:total_amount).to_f,
              completed_count: completed.count,
              bookings: completed.map do |b|
                {
                  id: b.id,
                  service_name: b.display_service,
                  amount: b.total_amount.to_f,
                  display_amount: b.display_amount,
                  completed_at: b.updated_at
                }
              end
            },
            "Earnings retrieved successfully."
          )
        end
      end
    end
  end
end
