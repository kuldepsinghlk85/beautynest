# frozen_string_literal: true

module Api
  module V1
    module Worker
      # Worker-facing API: assigned bookings and status transitions.
      # Only workers may access these endpoints (enforced by require_worker!).
      class BookingsController < BaseController
        before_action :require_worker!
        before_action :set_booking, only: %i[show update_status accept reject complete_service complete_payment request_reschedule reschedule_requests]

        # GET /api/v1/worker/bookings
        def index
          bookings = current_api_user.worker_bookings
                                     .includes(:customer)
                                     .order(created_at: :desc)
          render_success(bookings.map { |b| booking_json(b) }, "Bookings retrieved successfully.")
        end

        # GET /api/v1/worker/bookings/:id
        def show
          render_success(booking_json(@booking), "Booking details retrieved successfully.")
        end

        # PATCH /api/v1/worker/bookings/:id/accept
        def accept
          if %w[pending confirmed accepted].include?(@booking.booking_status)
            @booking.update!(booking_status: "accepted")
            worker_label = current_api_user.name.start_with?("Worker") ? current_api_user.name : "Worker #{current_api_user.name}"
            notify_admins(
              "Booking Accepted: ##{@booking.display_id}",
              "#{worker_label} accepted the booking scheduled for #{@booking.display_date}."
            )
            AuditLogger.log(
              actor: current_api_user,
              action: "worker_accepted",
              record: @booking,
              record_name: "Booking ##{@booking.display_id}",
              metadata: {
                worker_id: current_api_user.id,
                worker_name: current_api_user.name,
                scheduled_at: @booking.scheduled_at&.iso8601
              },
              request: request
            )
          end
          render_success(booking_json(@booking), "Booking accepted successfully.")
        end

        # PATCH /api/v1/worker/bookings/:id/reject
        def reject
          if %w[pending confirmed accepted].include?(@booking.booking_status)
            worker_label = current_api_user.name.start_with?("Worker") ? current_api_user.name : "Worker #{current_api_user.name}"
            @booking.update!(booking_status: "rejected", service_status: "cancelled")
            notify_admins(
              "Booking Rejected: ##{@booking.display_id}",
              "#{worker_label} rejected the booking scheduled for #{@booking.display_date}."
            )
            AuditLogger.log(
              actor: current_api_user,
              action: "worker_rejected",
              record: @booking,
              record_name: "Booking ##{@booking.display_id}",
              metadata: {
                worker_id: current_api_user.id,
                worker_name: current_api_user.name
              },
              request: request
            )
          end
          render_success(booking_json(@booking), "Booking rejected.")
        end

        # PATCH /api/v1/worker/bookings/:id/complete_service
        def complete_service
          if %w[cancelled rejected].include?(@booking.booking_status) || @booking.service_status == "cancelled"
            return render_unprocessable(["Cannot complete a cancelled or rejected booking."])
          end

          @booking.update!(
            booking_status: "completed",
            service_status: "completed"
          )

          if params[:collect_payment].to_s == "1" || params[:collect_payment].to_s == "true"
            mark_booking_payment_completed!(params[:payment_method] || params[:method], params[:transaction_ref])
          end

          notify_admins(
            "Booking Completed: ##{@booking.display_id}",
            "Worker #{current_api_user.name} completed the booking scheduled for #{@booking.display_date}."
          )

          AuditLogger.log(
            actor: current_api_user,
            action: "worker_completed_service",
            record: @booking,
            record_name: "Booking ##{@booking.display_id}",
            changes: @booking.saved_changes,
            metadata: { worker_id: current_api_user.id, worker_name: current_api_user.name },
            request: request
          )

          render_success(booking_json(@booking.reload), "Service completed successfully.")
        end

        # PATCH /api/v1/worker/bookings/:id/complete_payment
        def complete_payment
          if %w[cancelled rejected].include?(@booking.booking_status)
            return render_unprocessable(["Cannot collect payment for a cancelled or rejected booking."])
          end

          mark_booking_payment_completed!(params[:payment_method] || params[:method], params[:transaction_ref])

          notify_admins(
            "Payment Collected: ##{@booking.display_id}",
            "Worker #{current_api_user.name} collected payment for booking ##{@booking.display_id}."
          )

          AuditLogger.log(
            actor: current_api_user,
            action: "worker_collected_payment",
            record: @booking,
            record_name: "Booking ##{@booking.display_id}",
            metadata: {
              amount: @booking.total_amount.to_f,
              worker_id: current_api_user.id
            },
            request: request
          )

          render_success(booking_json(@booking.reload), "Payment marked as completed.")
        end

        # POST /api/v1/worker/bookings/:id/request_reschedule
        # Worker indicates they cannot reach this appointment on time and requests slot change or reassignment
        def request_reschedule
          reason = params[:reason].to_s.strip
          if reason.blank?
            return render_unprocessable(["Please provide a reason explaining why you cannot reach or deliver this service on time."])
          end

          if %w[completed cancelled rejected].include?(@booking.booking_status)
            return render_unprocessable(["Cannot request reschedule for a #{@booking.booking_status} booking."])
          end

          # Check if there is already an open pending request
          existing_pending = @booking.booking_reschedule_requests.pending.first
          if existing_pending.present?
            return render_unprocessable(["You already have a pending reschedule request for this booking. Admin has been notified."])
          end

          requested_date = begin
            params[:requested_date].present? ? Date.parse(params[:requested_date].to_s) : nil
          rescue ArgumentError
            nil
          end

          reschedule_req = @booking.booking_reschedule_requests.create!(
            worker: current_api_user,
            requested_by: current_api_user,
            status: "pending",
            request_type: params[:request_type].presence || "cannot_reach",
            current_scheduled_at: @booking.scheduled_at,
            current_time_slot: @booking.time_slot,
            requested_date: requested_date,
            requested_time_slot: params[:requested_time_slot].presence,
            reason: reason
          )

          worker_label = current_api_user.name
          # Dispatch urgent notification to admins
          notify_admins(
            "⚠️ Beautician Cannot Reach: Booking ##{@booking.display_id}",
            "Specialist #{worker_label} reported unable to reach booking ##{@booking.display_id} on #{@booking.display_date}. Reason: #{reason}"
          )

          AuditLogger.log(
            actor: current_api_user,
            action: "worker_requested_reschedule",
            record: @booking,
            record_name: "Booking ##{@booking.display_id}",
            metadata: {
              request_id: reschedule_req.id,
              reason: reason,
              requested_date: requested_date,
              requested_slot: params[:requested_time_slot]
            },
            request: request
          )

          render_success(
            {
              booking: booking_json(@booking.reload),
              reschedule_request: {
                id: reschedule_req.id,
                status: reschedule_req.status,
                request_type: reschedule_req.request_type,
                reason: reschedule_req.reason,
                requested_date: reschedule_req.requested_date,
                requested_time_slot: reschedule_req.requested_time_slot,
                created_at: reschedule_req.created_at
              }
            },
            "Reschedule request submitted to Admin successfully. Admin will review and update slot or reassign."
          )
        end

        # GET /api/v1/worker/bookings/:id/reschedule_requests
        def reschedule_requests
          requests = @booking.booking_reschedule_requests.order(created_at: :desc)
          render_success(
            requests.map do |r|
              {
                id: r.id,
                status: r.status,
                request_type: r.request_type,
                reason: r.reason,
                admin_notes: r.admin_notes,
                action_taken: r.action_taken,
                current_time_slot: r.current_time_slot,
                requested_date: r.requested_date,
                requested_time_slot: r.requested_time_slot,
                created_at: r.created_at,
                resolved_at: r.resolved_at
              }
            end,
            "Reschedule requests retrieved successfully."
          )
        end

        # PATCH /api/v1/worker/bookings/:id/status
        def update_status
          raw_status = params.require(:status).to_s.strip.downcase
          new_status = case raw_status
                       when "accepted" then "confirmed"
                       when "rejected" then "rejected"
                       else raw_status
                       end

          allowed = worker_allowed_transitions[@booking.status]

          unless allowed&.include?(new_status)
            return render_unprocessable(
              ["Cannot transition from '#{@booking.status}' to '#{new_status}'."]
            )
          end

          @booking.update!(status: new_status)

          case new_status
          when "confirmed", "accepted"
            notify_admins(
              "Booking Accepted: ##{@booking.display_id}",
              "Worker #{current_api_user.name} accepted the booking scheduled for #{@booking.display_date}."
            )
            AuditLogger.log(
              actor: current_api_user,
              action: "worker_accepted",
              record: @booking,
              record_name: "Booking ##{@booking.display_id}",
              changes: @booking.saved_changes,
              metadata: { worker_id: current_api_user.id, worker_name: current_api_user.name },
              request: request
            )
          when "cancelled", "rejected"
            notify_admins(
              "Booking Rejected: ##{@booking.display_id}",
              "Worker #{current_api_user.name} rejected the booking scheduled for #{@booking.display_date}."
            )
            AuditLogger.log(
              actor: current_api_user,
              action: "worker_rejected",
              record: @booking,
              record_name: "Booking ##{@booking.display_id}",
              changes: @booking.saved_changes,
              metadata: { worker_id: current_api_user.id, worker_name: current_api_user.name },
              request: request
            )
          when "completed"
            notify_admins(
              "Booking Completed: ##{@booking.display_id}",
              "Worker #{current_api_user.name} completed the booking scheduled for #{@booking.display_date}."
            )
            AuditLogger.log(
              actor: current_api_user,
              action: "worker_completed",
              record: @booking,
              record_name: "Booking ##{@booking.display_id}",
              changes: @booking.saved_changes,
              metadata: { worker_id: current_api_user.id, worker_name: current_api_user.name },
              request: request
            )
          else
            AuditLogger.log(
              actor: current_api_user,
              action: "status_update",
              record: @booking,
              record_name: "Booking ##{@booking.display_id}",
              changes: @booking.saved_changes,
              metadata: { worker_id: current_api_user.id, worker_name: current_api_user.name, new_status: new_status },
              request: request
            )
          end

          render_success(booking_json(@booking), "Booking status updated to '#{new_status}'.")
        end

        private

        def set_booking
          @booking = current_api_user.worker_bookings.find(params[:id])
        end

        def notify_admins(subject, body)
          User.admins.active.each do |admin|
            Notification.create!(
              user:           admin,
              creator:        current_api_user,
              subject:        subject,
              body:           body,
              channel:        "push",
              status:         "sent",
              recipient_type: "admin",
              sent_at:        Time.current
            )
          end
        end

        # Workers may only move their own bookings along the forward path or reject
        def worker_allowed_transitions
          {
            "pending"     => %w[confirmed cancelled rejected in_progress completed],
            "confirmed"   => %w[in_progress cancelled rejected completed],
            "accepted"    => %w[in_progress cancelled rejected completed],
            "in_progress" => %w[completed cancelled]
          }
        end

        def mark_booking_payment_completed!(method_param = nil, ref_param = nil)
          pay_method = (method_param.presence || @booking.payment_method.presence || "cash").to_s.downcase
          pay_method = "cash" unless Payment::METHODS.include?(pay_method)
          tx_ref = ref_param.presence || "PAY-#{SecureRandom.hex(4).upcase}"

          pending_payments = @booking.payments.where.not(status: "completed")
          if pending_payments.any?
            pending_payments.each do |p|
              p.update!(
                status: "completed",
                method: pay_method,
                paid_at: Time.current,
                transaction_ref: p.transaction_ref.presence || tx_ref
              )
            end
          else
            @booking.payments.create!(
              amount: @booking.total_amount,
              method: pay_method,
              status: "completed",
              paid_at: Time.current,
              transaction_ref: tx_ref
            )
          end
        end

        def booking_json(booking)
          {
            id:              booking.id,
            booking_number:  booking.display_id,
            service_name:    booking.display_service,
            booking_status:  booking.booking_status,
            service_status:  booking.service_status,
            status:          booking.booking_status,
            scheduled_at:    booking.scheduled_at,
            subtotal_amount: booking.subtotal_amount.to_f,
            discount_amount: booking.discount_amount.to_f,
            total_amount:    booking.total_amount.to_f,
            display_amount:  booking.display_amount,
            display_date:    booking.display_date,
            display_time:    booking.display_time,
            has_pending_reschedule: booking.has_pending_reschedule_request?,
            pending_reschedule_reason: booking.pending_reschedule_request&.reason,
            pending_reschedule_slot: booking.pending_reschedule_request&.requested_time_slot,
            customer:        { id: booking.customer.id, name: booking.customer.name, phone: booking.customer.phone },
            created_at:      booking.created_at,
            extra_charges:   booking.booking_extra_charges.approved.map { |c|
              item_disc = booking.coupon ? booking.coupon.apply_to_extra(c.line_total.to_f).round(2) : 0.0
              item_net  = (c.line_total.to_f - item_disc).round(2)
              {
                id:              c.id,
                description:     c.description,
                charge_type:     c.charge_type,
                amount:          c.amount.to_f,
                quantity:        c.quantity,
                line_total:      c.line_total.to_f,
                discount_amount: item_disc,
                net_total:       item_net
              }
            }
          }
        end
      end
    end
  end
end
