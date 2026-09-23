# frozen_string_literal: true

module Admin
  class BookingsController < BaseController
    before_action :set_booking, only: %i[show edit update]

    def index
      authorize Booking
      base_scope = policy_scope(Booking)
      @status_counts = base_scope.group(:booking_status).count
      @total_count   = base_scope.count
      @pending_reschedule_count = BookingRescheduleRequest.pending.count

      scope = base_scope
                .includes(:customer, :worker, :booking_items, :payments, :booking_reschedule_requests)
                .then { |s| apply_filters(s) }
                .order(created_at: :desc, id: :desc)
      respond_to do |format|
        format.html do
          @workers = User.workers.order(:name)
          @bookings = paginate(scope, per_page: 10)
        end
        format.csv do
          AuditLogger.log(
            actor: current_user,
            action: "export_bookings_csv",
            record: current_user,
            record_name: "Bookings CSV Export",
            metadata: { count: scope.count },
            request: request
          )
          send_data CsvExportService.bookings_csv(scope),
                    filename: "bookings-export-#{Time.current.strftime('%Y%m%d%H%M')}.csv",
                    type: "text/csv; charset=utf-8",
                    disposition: "attachment"
        end
        format.json do
          render json: scope.as_json(include: %i[customer worker booking_items payments])
        end
      end
    end

    def show
      @booking.recalculate_amounts! if @booking.booking_extra_charges.any?
      @booking_items = @booking.booking_items.includes(:service)
      @payments      = @booking.payments
      @review        = @booking.review
      @available_services = Service.active.ordered
      @available_products = Product.active.ordered
      @eligible_replacement_workers = BookingAvailabilityService.eligible_workers(@booking.city, @booking.date, @booking.time_slot).reject { |w| w.id == @booking.worker_id }
    end

    def new
      authorize Booking
      @booking   = Booking.new
      @customers = User.customers.active.order(:name)
      @workers   = User.workers.active.order(:name)
      @services  = Service.active.includes(:category).ordered
    end

    def create
      authorize Booking
      b_params = booking_params.except(:service_ids, :service_id, :date, :time, :payment_status)
      @booking = Booking.new(b_params)

      # Extract appointment date and time slot
      booking_date = params.dig(:booking, :date).presence
      booking_time = params.dig(:booking, :time).presence
      if booking_date.present?
        parsed_dt = (Time.zone.parse("#{booking_date} #{booking_time}") rescue nil) || (Date.parse(booking_date) rescue nil)
        @booking.scheduled_at = parsed_dt if parsed_dt
      end
      @booking.time_slot = booking_time if booking_time.present?

      # Associate customer's address and city
      customer = User.find_by(id: @booking.customer_id)
      if customer
        cust_addr = customer.default_address || customer.addresses.first
        @booking.address ||= cust_addr
        @booking.city_id ||= cust_addr&.city_id || City.find_by(name: cust_addr&.city)&.id || City.first&.id
      end

      # Initial statuses
      @booking.booking_status ||= "confirmed"
      @booking.service_status ||= "pending"

      service_ids = Array(params.dig(:booking, :service_ids) || params.dig(:booking, :service_id)).compact_blank

      if @booking.save
        build_booking_items(@booking, service_ids)
        @booking.recalculate_amounts!

        # Create corresponding payment ledger entry
        pay_status = params.dig(:booking, :payment_status).to_s.downcase
        if pay_status == "paid" && @booking.total_amount > 0
          @booking.payments.create!(
            amount: @booking.total_amount,
            method: "upi",
            status: "completed",
            paid_at: Time.current,
            transaction_ref: "TXN-ADM-#{SecureRandom.hex(4).upcase}"
          )
        elsif pay_status == "pending" && @booking.total_amount > 0
          @booking.payments.create!(
            amount: @booking.total_amount,
            method: "cash",
            status: "pending"
          )
        end

        notify_worker_booking_assigned(@booking) if @booking.worker_id.present?

        AuditLogger.log(
          actor: current_user,
          action: "create",
          record: @booking,
          record_name: "Booking ##{@booking.display_id}",
          metadata: {
            customer_id: @booking.customer_id,
            worker_id: @booking.worker_id,
            total_amount: @booking.total_amount.to_f
          },
          request: request
        )

        redirect_to admin_booking_path(@booking), notice: "Booking ##{@booking.display_id} created successfully."
      else
        @customers = User.customers.active.order(:name)
        @workers   = User.workers.active.order(:name)
        @services  = Service.active.includes(:category).ordered
        render :new, status: :unprocessable_entity
      end
    end

    def edit
      @customers = User.customers.active.order(:name)
      @workers   = User.workers.active.order(:name)
    end

    def update
      old_worker_id = @booking.worker_id&.to_s
      if @booking.update(booking_params.except(:service_ids))
        new_worker_id = @booking.worker_id&.to_s

        # Notify worker when newly assigned & record audit log
        if new_worker_id.present? && new_worker_id != old_worker_id
          notify_worker_booking_assigned(@booking)
          assigned_worker = User.find_by(id: new_worker_id)
          AuditLogger.log(
            actor: current_user,
            action: "assign_worker",
            record: @booking,
            record_name: "Booking ##{@booking.display_id}",
            metadata: {
              worker_id: new_worker_id,
              worker_name: assigned_worker&.name || "Worker #{new_worker_id}"
            },
            request: request
          )
        end

        if @booking.saved_changes.present?
          AuditLogger.log(
            actor: current_user,
            action: "update",
            record: @booking,
            record_name: "Booking ##{@booking.display_id}",
            changes: @booking.saved_changes,
            request: request
          )
        end

        redirect_to admin_booking_path(@booking), notice: "Booking updated."
      else
        @customers = User.customers.active.order(:name)
        @workers   = User.workers.active.order(:name)
        render :edit, status: :unprocessable_entity
      end
    end

    def accept
      @booking = Booking.find_by(id: params[:id]) || Booking.find_by(booking_number: params[:id]) || Booking.find(params[:id])
      authorize @booking, :accept?, policy_class: BookingPolicy
      if %w[pending confirmed accepted].include?(@booking.booking_status)
        @booking.update!(booking_status: "accepted")
        worker_name = current_user.name
        worker_label = worker_name.start_with?("Worker") ? worker_name : "Worker #{worker_name}"
        notify_admins_booking_event(
          "Booking Accepted: ##{@booking.display_id}",
          "#{worker_label} accepted booking ##{@booking.display_id} for customer #{@booking.customer_name} scheduled on #{@booking.display_date}."
        )
        AuditLogger.log(
          actor: current_user,
          action: "accept_booking",
          record: @booking,
          record_name: "Booking ##{@booking.display_id}",
          changes: @booking.saved_changes,
          request: request
        )
        redirect_back fallback_location: admin_booking_path(@booking), notice: "Booking accepted successfully.", status: :see_other
      else
        redirect_back fallback_location: admin_booking_path(@booking), alert: "Booking cannot be accepted in current status (#{@booking.booking_status}).", status: :see_other
      end
    end

    def reject
      @booking = Booking.find_by(id: params[:id]) || Booking.find_by(booking_number: params[:id]) || Booking.find(params[:id])
      authorize @booking, :reject?, policy_class: BookingPolicy
      if %w[pending confirmed accepted].include?(@booking.booking_status)
        worker_name = current_user.name
        worker_label = worker_name.start_with?("Worker") ? worker_name : "Worker #{worker_name}"
        @booking.update!(booking_status: "rejected", service_status: "cancelled")
        notify_admins_booking_event(
          "Booking Rejected: ##{@booking.display_id}",
          "#{worker_label} rejected booking ##{@booking.display_id} scheduled on #{@booking.display_date}."
        )
        AuditLogger.log(
          actor: current_user,
          action: "reject_booking",
          record: @booking,
          record_name: "Booking ##{@booking.display_id}",
          changes: @booking.saved_changes,
          request: request
        )
        redirect_back fallback_location: admin_booking_path(@booking), notice: "Booking rejected.", status: :see_other
      else
        redirect_back fallback_location: admin_booking_path(@booking), alert: "Booking cannot be rejected in current status (#{@booking.booking_status}).", status: :see_other
      end
    end

    def complete_service
      @booking = Booking.find_by(id: params[:id]) || Booking.find_by(booking_number: params[:id]) || Booking.find(params[:id])
      authorize @booking, :complete_service?, policy_class: BookingPolicy

      if %w[cancelled rejected].include?(@booking.booking_status) || @booking.service_status == "cancelled"
        redirect_back fallback_location: admin_booking_path(@booking), alert: "Cannot complete a cancelled or rejected booking.", status: :see_other
        return
      end

      @booking.update!(booking_status: "completed", service_status: "completed")

      if params[:collect_payment].to_s == "1" || params[:collect_payment].to_s == "true"
        settle_booking_payment!
      end

      worker_name = current_user.name
      worker_label = worker_name.start_with?("Worker") ? worker_name : "Worker #{worker_name}"

      notify_admins_booking_event(
        "Service Completed: ##{@booking.display_id}",
        "#{worker_label} marked service ##{@booking.display_id} as completed for customer #{@booking.customer_name}."
      )

      if @booking.customer.present?
        Notification.create!(
          user: @booking.customer,
          creator: current_user,
          subject: "Service Completed: ##{@booking.display_id}",
          body: "Your beauty appointment ##{@booking.display_id} has been marked completed by #{worker_label}. Please take a moment to rate your experience!",
          channel: "push",
          status: "sent",
          recipient_type: "customer",
          sent_at: Time.current
        )
      end

      AuditLogger.log(
        actor: current_user,
        action: "complete_service",
        record: @booking,
        record_name: "Booking ##{@booking.display_id}",
        changes: @booking.saved_changes,
        request: request
      )

      redirect_back fallback_location: admin_booking_path(@booking), notice: "Service marked as completed successfully. The customer can now review this booking.", status: :see_other
    end

    def complete_payment
      @booking = Booking.find_by(id: params[:id]) || Booking.find_by(booking_number: params[:id]) || Booking.find(params[:id])
      authorize @booking, :complete_payment?, policy_class: BookingPolicy

      if %w[cancelled rejected].include?(@booking.booking_status)
        redirect_back fallback_location: admin_booking_path(@booking), alert: "Cannot collect payment for a cancelled or rejected booking.", status: :see_other
        return
      end

      settle_booking_payment!(params[:payment_method], params[:transaction_ref])

      worker_name = current_user.name
      worker_label = worker_name.start_with?("Worker") ? worker_name : "Worker #{worker_name}"

      notify_admins_booking_event(
        "Payment Collected: ##{@booking.display_id}",
        "#{worker_label} collected payment of #{@booking.display_amount} for booking ##{@booking.display_id}."
      )

      AuditLogger.log(
        actor: current_user,
        action: "complete_payment",
        record: @booking,
        record_name: "Booking ##{@booking.display_id}",
        metadata: {
          amount: @booking.total_amount.to_f
        },
        request: request
      )

      redirect_back fallback_location: admin_booking_path(@booking), notice: "Payment collected and marked as completed successfully.", status: :see_other
    end

    # POST /admin/bookings/:id/approve_reschedule
    def approve_reschedule
      @booking = Booking.find_by(id: params[:id]) || Booking.find_by(booking_number: params[:id]) || Booking.find(params[:id])
      authorize @booking, :approve_reschedule?, policy_class: BookingPolicy

      req = @booking.booking_reschedule_requests.pending.find_by(id: params[:request_id]) || @booking.pending_reschedule_request
      unless req
        return redirect_back fallback_location: admin_booking_path(@booking), alert: "No pending reschedule request found for this booking.", status: :see_other
      end

      new_date = params[:date].presence || req.requested_date&.to_s || @booking.date.to_s
      new_slot = params[:time_slot].presence || req.requested_time_slot.presence || @booking.time_slot

      slot_info = BookingAvailabilityService::STANDARD_TIME_SLOTS.find { |s| s[:slot].casecmp?(new_slot.to_s.strip) }
      time_str = slot_info ? slot_info[:time] : "10:30"
      new_scheduled_at = (Time.zone.parse("#{new_date} #{time_str}:00") rescue nil)

      unless new_scheduled_at
        return redirect_back fallback_location: admin_booking_path(@booking), alert: "Invalid date or time slot selected.", status: :see_other
      end

      # Verify worker availability for new slot
      check = BookingAvailabilityService.worker_available?(@booking.worker, new_date, new_slot, city: @booking.city, exclude_booking_id: @booking.id)
      unless check[:available]
        return redirect_back fallback_location: admin_booking_path(@booking), alert: "Cannot reschedule: #{check[:error]}", status: :see_other
      end

      ActiveRecord::Base.transaction do
        @booking.update!(
          date: new_date,
          time_slot: new_slot,
          scheduled_at: new_scheduled_at
        )

        req.update!(
          status: "approved",
          action_taken: "slot_changed",
          admin_notes: params[:admin_notes].presence || "Rescheduled by Admin",
          resolved_at: Time.current,
          resolved_by: current_user
        )
      end

      # Notify Customer and Worker
      if @booking.customer.present?
        Notification.create!(
          user: @booking.customer,
          creator: current_user,
          subject: "Booking Rescheduled: ##{@booking.display_id}",
          body: "Your booking ##{@booking.display_id} has been rescheduled to #{new_date} at #{new_slot}.",
          channel: "push",
          status: "sent",
          recipient_type: "customer",
          sent_at: Time.current
        )
      end

      if @booking.worker.present?
        Notification.create!(
          user: @booking.worker,
          creator: current_user,
          subject: "Slot Change Approved: ##{@booking.display_id}",
          body: "Your slot change request for ##{@booking.display_id} has been approved. New schedule: #{new_date} at #{new_slot}.",
          channel: "push",
          status: "sent",
          recipient_type: "worker",
          sent_at: Time.current
        )
      end

      AuditLogger.log(
        actor: current_user,
        action: "approve_reschedule",
        record: @booking,
        record_name: "Booking ##{@booking.display_id}",
        changes: @booking.saved_changes,
        metadata: { new_date: new_date, new_slot: new_slot, request_id: req.id },
        request: request
      )

      redirect_back fallback_location: admin_booking_path(@booking), notice: "Slot change approved! Booking rescheduled to #{new_date} at #{new_slot}.", status: :see_other
    end

    # POST /admin/bookings/:id/reassign_reschedule
    def reassign_reschedule
      @booking = Booking.find_by(id: params[:id]) || Booking.find_by(booking_number: params[:id]) || Booking.find(params[:id])
      authorize @booking, :reassign_reschedule?, policy_class: BookingPolicy

      req = @booking.booking_reschedule_requests.pending.find_by(id: params[:request_id]) || @booking.pending_reschedule_request
      new_worker_id = params[:new_worker_id].presence
      unless new_worker_id.present?
        return redirect_back fallback_location: admin_booking_path(@booking), alert: "Please select a specialist to reassign.", status: :see_other
      end

      new_worker = User.workers.find_by(id: new_worker_id)
      unless new_worker
        return redirect_back fallback_location: admin_booking_path(@booking), alert: "Selected specialist not found.", status: :see_other
      end

      # Verify new worker is free for this exact slot
      check = BookingAvailabilityService.worker_available?(new_worker, @booking.date, @booking.time_slot, city: @booking.city, exclude_booking_id: @booking.id)
      unless check[:available]
        return redirect_back fallback_location: admin_booking_path(@booking), alert: "#{new_worker.name} is not available: #{check[:error]}", status: :see_other
      end

      old_worker = @booking.worker

      ActiveRecord::Base.transaction do
        @booking.update!(worker: new_worker)

        if req.present?
          req.update!(
            status: "approved",
            action_taken: "reassigned_worker",
            admin_notes: params[:admin_notes].presence || "Reassigned to #{new_worker.name} by Admin",
            resolved_at: Time.current,
            resolved_by: current_user
          )
        end
      end

      # Notify Old Worker, New Worker, and Customer
      if old_worker.present?
        Notification.create!(
          user: old_worker,
          creator: current_user,
          subject: "Booking Reassigned: ##{@booking.display_id}",
          body: "You have been relieved from booking ##{@booking.display_id} as requested. Reassigned to #{new_worker.name}.",
          channel: "push",
          status: "sent",
          recipient_type: "worker",
          sent_at: Time.current
        )
      end

      Notification.create!(
        user: new_worker,
        creator: current_user,
        subject: "New Booking Assigned: ##{@booking.display_id}",
        body: "You have been assigned to booking ##{@booking.display_id} scheduled for #{@booking.display_date} at #{@booking.display_time}.",
        channel: "push",
        status: "sent",
        recipient_type: "worker",
        sent_at: Time.current
      )

      if @booking.customer.present?
        Notification.create!(
          user: @booking.customer,
          creator: current_user,
          subject: "Beauty Specialist Update: ##{@booking.display_id}",
          body: "Specialist #{new_worker.name} has been assigned to your booking on #{@booking.display_date}.",
          channel: "push",
          status: "sent",
          recipient_type: "customer",
          sent_at: Time.current
        )
      end

      AuditLogger.log(
        actor: current_user,
        action: "reassign_reschedule",
        record: @booking,
        record_name: "Booking ##{@booking.display_id}",
        metadata: { old_worker_id: old_worker&.id, new_worker_id: new_worker.id, request_id: req&.id },
        request: request
      )

      redirect_back fallback_location: admin_booking_path(@booking), notice: "Booking successfully reassigned to #{new_worker.name}.", status: :see_other
    end

    # POST /admin/bookings/:id/reject_reschedule
    def reject_reschedule
      @booking = Booking.find_by(id: params[:id]) || Booking.find_by(booking_number: params[:id]) || Booking.find(params[:id])
      authorize @booking, :reject_reschedule?, policy_class: BookingPolicy

      req = @booking.booking_reschedule_requests.pending.find_by(id: params[:request_id]) || @booking.pending_reschedule_request
      unless req
        return redirect_back fallback_location: admin_booking_path(@booking), alert: "No pending reschedule request found.", status: :see_other
      end

      req.update!(
        status: "rejected",
        action_taken: "rejected",
        admin_notes: params[:admin_notes].presence || "Request declined by Admin",
        resolved_at: Time.current,
        resolved_by: current_user
      )

      if @booking.worker.present?
        Notification.create!(
          user: @booking.worker,
          creator: current_user,
          subject: "Slot Change Declined: ##{@booking.display_id}",
          body: "Your slot change request for booking ##{@booking.display_id} was declined by Admin. Reason: #{req.admin_notes}",
          channel: "push",
          status: "sent",
          recipient_type: "worker",
          sent_at: Time.current
        )
      end

      AuditLogger.log(
        actor: current_user,
        action: "reject_reschedule",
        record: @booking,
        record_name: "Booking ##{@booking.display_id}",
        metadata: { request_id: req.id, admin_notes: req.admin_notes },
        request: request
      )

      redirect_back fallback_location: admin_booking_path(@booking), notice: "Reschedule request declined.", status: :see_other
    end

    private

    def settle_booking_payment!(method_param = nil, ref_param = nil)
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

    def set_booking
      @booking = Booking.includes(:customer, :worker, :booking_items, :coupon, :address).find_by(id: params[:id]) ||
                 Booking.includes(:customer, :worker, :booking_items, :coupon, :address).find_by(booking_number: params[:id]) ||
                 Booking.find(params[:id])
      authorize @booking
    end

    def booking_params
      params.require(:booking).permit(
        :customer_id, :worker_id, :address_id, :coupon_id,
        :scheduled_at, :status, :booking_status, :service_status, :notes,
        :service_id, :date, :time, :payment_status, service_ids: []
      )
    end

    def build_booking_items(booking, service_ids)
      Array(service_ids).compact_blank.each do |sid|
        svc = Service.find_by(id: sid) || Service.friendly.find_by(id: sid)
        next unless svc
        booking.booking_items.create!(
          service:                   svc,
          service_name_snapshot:     svc.name,
          price_snapshot:            svc.effective_price,
          duration_minutes_snapshot: svc.duration_minutes || 60,
          quantity:                  1,
          booking_date:              booking.scheduled_at&.to_date,
          time_slot:                 booking.time_slot,
          city_id:                   booking.city_id,
          worker_id:                 booking.worker_id
        )
      end
    end

    def apply_filters(scope)
      if params[:q].present?
        q = "%#{params[:q].to_s.strip.downcase}%"
        scope = scope.left_joins(:customer, :worker).where(
          "LOWER(bookings.booking_number) LIKE :q OR LOWER(users.name) LIKE :q OR users.phone LIKE :q OR LOWER(workers_bookings.name) LIKE :q",
          q: q
        )
      end

      if params[:booking_status].present? && params[:booking_status] != "all"
        scope = scope.where(booking_status: params[:booking_status])
      elsif params[:status].present? && params[:status] != "all"
        scope = scope.where("bookings.booking_status = :st OR bookings.service_status = :st", st: params[:status])
      end

      if params[:worker_id].present? && params[:worker_id] != "all"
        scope = scope.where(worker_id: params[:worker_id])
      end

      if params[:payment_status].present? && params[:payment_status] != "all"
        scope = scope.joins(:payments).where(payments: { status: params[:payment_status] }).distinct
      end

      case params[:timeframe]
      when "today"
        scope = scope.where("bookings.created_at >= ?", Time.current.beginning_of_day)
      when "this_week"
        scope = scope.where("bookings.created_at >= ?", Time.current.beginning_of_week)
      when "this_month"
        scope = scope.where("bookings.created_at >= ?", Time.current.beginning_of_month)
      end

      scope = scope.where(service_status: params[:service_status]) if params[:service_status].present? && params[:service_status] != "all"
      scope = scope.where(customer_id: params[:customer_id])       if params[:customer_id].present?

      if params[:from].present?
        begin
          scope = scope.where("bookings.scheduled_at >= ?", params[:from].to_date.beginning_of_day)
        rescue StandardError
        end
      end

      if params[:to].present?
        begin
          scope = scope.where("bookings.scheduled_at <= ?", params[:to].to_date.end_of_day)
        rescue StandardError
        end
      end

      if params[:reschedule_filter] == "pending"
        scope = scope.joins(:booking_reschedule_requests).where(booking_reschedule_requests: { status: "pending" }).distinct
      end

      scope
    end

    def notify_worker_booking_assigned(booking)
      worker = User.find_by(id: booking.worker_id)
      return unless worker

      Notification.create!(
        user:           worker,
        creator:        current_user,
        subject:        "New Booking Assigned: ##{booking.id.to_s.first(8)}",
        body:           "You have been assigned booking ##{booking.id.to_s.first(8)} scheduled for #{booking.display_date} at #{booking.display_time}.",
        channel:        "push",
        status:         "sent",
        recipient_type: "worker",
        sent_at:        Time.current
      )
    end

    def notify_admins_booking_event(subject, body)
      User.admins.active.each do |admin|
        Notification.create!(
          user:           admin,
          creator:        current_user,
          subject:        subject,
          body:           body,
          channel:        "push",
          status:         "sent",
          recipient_type: "admin",
          sent_at:        Time.current
        )
      end
    end
  end
end
