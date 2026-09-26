# frozen_string_literal: true

module Admin
  class WorkersController < BaseController
    before_action :set_worker, only: %i[show edit update destroy]

    def index
      authorize :worker, :index?, policy_class: WorkerPolicy
      skip_policy_scope
      @active_tab = params[:tab].presence || "active"
      @cities = City.active.ordered
      
      @active_workers_count = User.workers.count
      @pending_invitations_count = WorkerInvitation.pending.count
      @total_invitations_count = WorkerInvitation.count

      if @active_tab == "invitations"
        inv_scope = WorkerInvitation.includes(:invited_by, :city).recent
        if params[:inv_status].present?
          case params[:inv_status]
          when "pending"  then inv_scope = inv_scope.where(status: "pending").where("expires_at > ?", Time.current)
          when "expired"  then inv_scope = inv_scope.where("status = 'expired' OR (status = 'pending' AND expires_at <= ?)", Time.current)
          when "accepted", "revoked" then inv_scope = inv_scope.where(status: params[:inv_status])
          end
        end
        if params[:q].present?
          q = "%#{params[:q].to_s.strip.downcase}%"
          inv_scope = inv_scope.where("LOWER(email) LIKE ? OR LOWER(name) LIKE ? OR phone LIKE ?", q, q, q)
        end
        @invitations = paginate(inv_scope, per_page: 10)
      else
        scope = User.workers
                    .includes({ worker_profile: %i[city worker_tier] }, :addresses)
                    .order(created_at: :desc)
                    .then { |s| apply_filters(s) }
        respond_to do |format|
          format.html do
            @workers = paginate(scope, per_page: 10)
          end
          format.csv do
            AuditLogger.log(
              actor: current_user,
              action: "export_workers_csv",
              record: current_user,
              record_name: "Beauticians CSV Export",
              metadata: { count: scope.count },
              request: request
            )
            send_data CsvExportService.workers_csv(scope),
                      filename: "beauticians-export-#{Time.current.strftime('%Y%m%d%H%M')}.csv",
                      type: "text/csv; charset=utf-8",
                      disposition: "attachment"
          end
        end
      end
    end

    def show
      @profile = @worker.worker_profile || @worker.build_worker_profile
      @active_tab = params[:tab].presence || "schedule"

      # Selected date for the time-slot grid (defaults to today or param)
      @selected_date = begin
        params[:date].present? ? Date.parse(params[:date].to_s) : Date.current
      rescue ArgumentError
        Date.current
      end

      # Rolling 7-day calendar window start:
      # If week_start param is provided, use it; if selected_date is in past, center around it; else start today
      base_start = if params[:week_start].present?
                     (Date.parse(params[:week_start].to_s) rescue Date.current)
                   elsif @selected_date < Date.current
                     @selected_date
                   else
                     Date.current
                   end

      @rolling_days      = (base_start..(base_start + 6.days)).to_a
      @prev_week_date    = base_start - 7.days
      @next_week_date    = base_start + 7.days
      @current_week_date = Date.current

      # Ensure booking preload covers both the 7-day window and the selected date
      window_start = [@rolling_days.first, @selected_date].min.beginning_of_day
      window_end   = [@rolling_days.last, @selected_date].max.end_of_day

      @week_bookings = @worker.worker_bookings
                              .includes(:customer, :booking_items, :services, :payments, :review, :booking_reschedule_requests)
                              .where(scheduled_at: window_start..window_end)
                              .where.not(booking_status: %w[cancelled rejected])
                              .to_a

      # Slot breakdown for the selected date
      @slots_for_date = calculate_slots_for_date(@worker, @selected_date, @week_bookings)

      # 7-Day matrix summary data
      @week_matrix = @rolling_days.map do |day_date|
        day_bookings = @week_bookings.select { |b| b.scheduled_at&.to_date == day_date }
        is_working_day = @profile.available_on_day?(day_date.strftime("%A"))
        is_active = @worker.active? && (@profile.is_available.nil? ? true : @profile.is_available)
        {
          date: day_date,
          day_name: day_date.strftime("%A"),
          short: WorkerProfile::DAY_CODES[day_date.strftime("%A")] || day_date.strftime("%a"),
          is_today: day_date == Date.current,
          is_working_day: is_working_day,
          is_active: is_active,
          bookings: day_bookings,
          bookings_count: day_bookings.count
        }
      end

      # Completed service history
      history_scope = @worker.worker_bookings
                             .includes(:customer, :booking_items, :services, :payments, :review)
                             .where("bookings.booking_status = 'completed' OR bookings.service_status = 'completed'")
                             .order(scheduled_at: :desc, created_at: :desc)

      if params[:history_date].present?
        begin
          h_date = Date.parse(params[:history_date].to_s)
          history_scope = history_scope.where(scheduled_at: h_date.beginning_of_day..h_date.end_of_day)
          @filtered_history_date = h_date
        rescue ArgumentError
          @filtered_history_date = nil
        end
      end

      # Customer reviews received by this worker
      reviews_scope = @worker.received_reviews
                             .includes(:customer, :service, :booking)
                             .order(created_at: :desc)

      # Handle pagination based on active tab so @pagination doesn't conflict
      if @active_tab == "history"
        @completed_bookings = paginate(history_scope, per_page: 15)
        @customer_reviews   = reviews_scope.limit(10)
      elsif @active_tab == "reviews"
        @completed_bookings = history_scope.limit(10)
        @customer_reviews   = paginate(reviews_scope, per_page: 15)
      else
        @completed_bookings = history_scope.limit(10)
        @customer_reviews   = reviews_scope.limit(10)
      end

      # Key aggregate metrics
      @recent_completed_services = history_scope.limit(8).to_a
      @total_completed_jobs = @worker.worker_bookings.where("booking_status = 'completed' OR service_status = 'completed'").count
      @total_revenue = @worker.worker_bookings.where("booking_status = 'completed' OR service_status = 'completed'").sum(:total_amount)
      @rating_avg = @profile.rating_avg.to_f > 0 ? @profile.rating_avg : (@customer_reviews.any? ? @worker.received_reviews.average(:rating).to_f.round(1) : 0.0)
      @total_reviews_count = @worker.received_reviews.count
    end

    def new
      authorize :worker, :new?, policy_class: WorkerPolicy
      WorkerTier.ensure_default_tiers! if WorkerTier.count < 3
      @cities = City.active.ordered
      @worker_tiers = WorkerTier.active.ordered
      @worker = User.new(role: "worker", status: "active")
      bronze_tier = WorkerTier.find_by(slug: "bronze") || WorkerTier.order(:position).first
      @profile = @worker.build_worker_profile(
        available_days: WorkerProfile::DEFAULT_DAYS,
        time_slot: WorkerProfile::DEFAULT_TIME_SLOT,
        is_available: true,
        experience_years: 2,
        worker_tier: bronze_tier
      )
    end

    def create
      authorize :worker, :create?, policy_class: WorkerPolicy
      
      p = worker_params
      provided_password = p[:password].presence
      temp_password = provided_password || "Worker@#{SecureRandom.alphanumeric(6)}"
      
      @worker = User.new(
        name: p[:name],
        email: p[:email],
        phone: p[:phone],
        status: p[:status].presence || "active",
        role: "worker",
        password: temp_password,
        password_confirmation: temp_password
      )

      ActiveRecord::Base.transaction do
        unless @worker.save
          raise ActiveRecord::Rollback
        end

        profile = @worker.worker_profile || @worker.build_worker_profile
        profile.bio = p[:bio].presence || p[:speciality].presence || "Beauty Professional"
        profile.experience_years = [p[:experience_years].to_i, 0].max
        profile.is_available = p.key?(:is_available) ? ActiveRecord::Type::Boolean.new.cast(p[:is_available]) : true
        profile.time_slot = p[:time_slot].presence || WorkerProfile::DEFAULT_TIME_SLOT
        profile.aadhaar_number = p[:aadhaar_number].to_s.strip
        profile.upi_id = p[:upi_id].to_s.strip.presence
        profile.kyc_status = p[:kyc_status].presence || "pending"
        profile.skills = Array(p[:skills]).reject(&:blank?)
        bronze_tier = WorkerTier.find_by(slug: "bronze") || WorkerTier.order(:position).first
        profile.worker_tier_id = p[:worker_tier_id].presence || bronze_tier&.id

        # Set available days
        if p[:available_days].present?
          days = Array(p[:available_days]).map(&:to_s).reject(&:blank?)
          profile.available_days = days.presence || WorkerProfile::DEFAULT_DAYS
        else
          profile.available_days = WorkerProfile::DEFAULT_DAYS
        end

        # Resolve city
        city_record = find_city_record(p[:city_id], p[:city])
        profile.city = city_record if city_record.present?

        unless profile.save
          profile.errors.full_messages.each { |msg| @worker.errors.add(:base, "Profile: #{msg}") }
          raise ActiveRecord::Rollback
        end

        city_name = city_record&.name || p[:city].presence
        if city_name.present?
          addr = @worker.addresses.build(
            label: "Operating City",
            city: city_name,
            city_id: city_record&.id,
            line1: "Operational Area",
            is_default: true
          )
          unless addr.save
            addr.errors.full_messages.each { |msg| @worker.errors.add(:base, "Address: #{msg}") }
            raise ActiveRecord::Rollback
          end
        end

        notice_msg = "Worker '#{@worker.name}' onboarded successfully."
        notice_msg += " Temporary Password: #{temp_password}" if provided_password.blank?

        pic = p[:avatar].presence || p[:image].presence || p[:profile_pic].presence || params[:avatar].presence || params[:image].presence || p[:avatar_url].presence
        remove = params[:remove_image] == "1" || params[:remove_avatar] == "1" || p[:remove_avatar] == "1" || p[:remove_image] == "1"

        if pic.present? || remove
          @worker.handle_avatar_upload(pic, folder: "beauty_connect/avatars", remove: remove)
        end

        AuditLogger.log(
          actor: current_user,
          action: "create",
          record: @worker,
          auditable_type: "Worker",
          record_name: "Worker #{@worker.name}",
          changes: @worker.saved_changes,
          metadata: {
            email: @worker.email,
            phone: @worker.phone,
            status: @worker.status,
            city: city_name,
            available_days: profile.available_days,
            worker_tier_id: profile.worker_tier_id
          },
          request: request
        )

        redirect_to admin_worker_path(@worker), notice: notice_msg
        return
      end

      @cities = City.active.ordered
      @worker_tiers = WorkerTier.active.ordered
      render :new, status: :unprocessable_entity
    end

    def edit
      WorkerTier.ensure_default_tiers! if WorkerTier.count < 3
      @cities = City.active.ordered
      @worker_tiers = WorkerTier.active.ordered
      @profile = @worker.worker_profile || @worker.build_worker_profile
      if @profile.worker_tier_id.blank?
        @profile.worker_tier = WorkerTier.find_by(slug: "bronze") || WorkerTier.order(:position).first
      end
    end

    def update
      p = worker_params
      user_attrs = {}
      user_attrs[:name]   = p[:name]   if p[:name].present?
      user_attrs[:email]  = p[:email]  if p[:email].present?
      user_attrs[:phone]  = p[:phone]  if p[:phone].present?
      user_attrs[:status] = p[:status] if p[:status].present?

      if p[:password].present?
        user_attrs[:password] = p[:password]
        user_attrs[:password_confirmation] = p[:password_confirmation].presence || p[:password]
      end

      ActiveRecord::Base.transaction do
        unless @worker.update(user_attrs)
          raise ActiveRecord::Rollback
        end

        pic = p[:avatar].presence || p[:image].presence || p[:profile_pic].presence || params[:avatar].presence || params[:image].presence || p[:avatar_url].presence
        remove = params[:remove_image] == "1" || params[:remove_avatar] == "1" || p[:remove_avatar] == "1" || p[:remove_image] == "1"

        if pic.present? || remove
          @worker.handle_avatar_upload(pic, folder: "beauty_connect/avatars", remove: remove)
        end

        profile = @worker.worker_profile || @worker.build_worker_profile
        profile.bio = p[:bio].presence || p[:speciality].presence if p[:speciality].present? || p[:bio].present?
        profile.experience_years = [p[:experience_years].to_i, 0].max if p[:experience_years].present?
        profile.is_available = ActiveRecord::Type::Boolean.new.cast(p[:is_available]) if p.key?(:is_available)
        profile.time_slot = p[:time_slot] if p[:time_slot].present?
        profile.aadhaar_number = p[:aadhaar_number].to_s.strip if p[:aadhaar_number].present?
        profile.upi_id = p[:upi_id].to_s.strip.presence if p.key?(:upi_id)
        profile.kyc_status = p[:kyc_status] if p[:kyc_status].present?
        profile.skills = Array(p[:skills]).reject(&:blank?) if p.key?(:skills)
        if p.key?(:worker_tier_id)
          bronze_tier = WorkerTier.find_by(slug: "bronze") || WorkerTier.order(:position).first
          profile.worker_tier_id = p[:worker_tier_id].presence || profile.worker_tier_id || bronze_tier&.id
        end

        if p.key?(:available_days)
          days = Array(p[:available_days]).map(&:to_s).reject(&:blank?)
          profile.available_days = days.presence || WorkerProfile::DEFAULT_DAYS
        end

        city_record = find_city_record(p[:city_id], p[:city])
        profile.city = city_record if city_record.present?

        unless profile.save
          profile.errors.full_messages.each { |msg| @worker.errors.add(:base, "Profile: #{msg}") }
          raise ActiveRecord::Rollback
        end

        city_name = city_record&.name || p[:city].presence
        if city_name.present?
          addr = @worker.default_address || @worker.addresses.build(label: "Operating City", line1: "Operational Area", is_default: true)
          addr.city = city_name
          addr.city_id = city_record&.id if city_record.present?
          addr.line1 = "Operational Area" if addr.line1.blank?
          unless addr.save
            addr.errors.full_messages.each { |msg| @worker.errors.add(:base, "Address: #{msg}") }
            raise ActiveRecord::Rollback
          end
        end

        AuditLogger.log(
          actor: current_user,
          action: "update",
          record: @worker,
          auditable_type: "Worker",
          record_name: "Worker #{@worker.name}",
          changes: @worker.saved_changes,
          metadata: {
            email: @worker.email,
            phone: @worker.phone,
            status: @worker.status,
            city: city_name,
            available_days: profile.available_days
          },
          request: request
        )

        redirect_to admin_worker_path(@worker), notice: "Worker '#{@worker.name}' updated successfully."
        return
      end

      @cities = City.active.ordered
      render :edit, status: :unprocessable_entity
    end

    def destroy
      authorize @worker, :destroy?, policy_class: WorkerPolicy
      name = @worker.name
      AuditLogger.log(
        actor: current_user,
        action: "destroy",
        record: @worker,
        auditable_type: "Worker",
        record_name: "Worker #{name}",
        request: request
      )
      @worker.destroy!
      redirect_to admin_workers_path, notice: "Worker '#{name}' deleted successfully."
    rescue ActiveRecord::RecordNotDestroyed => e
      redirect_to admin_workers_path, alert: "Could not delete worker: #{e.record.errors.full_messages.to_sentence}"
    end

    private

    def set_worker
      @worker = User.workers.find(params[:id])
      authorize @worker, :show?, policy_class: WorkerPolicy
    end

    ALLOWED_WORKER_FIELDS = [
      :name, :email, :phone, :status,
      :password, :password_confirmation,
      :avatar, :image, :profile_pic, :avatar_url, :remove_avatar, :remove_image,
      :city, :city_id, :worker_tier_id, :speciality, :bio, :experience_years,
      :is_available, :time_slot, :aadhaar_number, :upi_id, :kyc_status,
      { available_days: [], skills: [] }
    ].freeze

    def worker_params
      if params[:worker].present? && params[:user].present?
        p_worker = params.require(:worker).permit(ALLOWED_WORKER_FIELDS)
        p_user   = params.require(:user).permit(ALLOWED_WORKER_FIELDS)
        p_worker.merge(p_user)
      elsif params[:worker].present?
        params.require(:worker).permit(ALLOWED_WORKER_FIELDS)
      elsif params[:user].present?
        params.require(:user).permit(ALLOWED_WORKER_FIELDS)
      else
        params.permit(ALLOWED_WORKER_FIELDS)
      end
    end

    def find_city_record(city_id, city_name)
      if city_id.present?
        City.find_by(id: city_id)
      elsif city_name.present?
        City.find_by("LOWER(name) = ?", city_name.to_s.strip.downcase)
      end
    end

    def apply_filters(scope)
      if params[:q].present?
        q = "%#{params[:q].to_s.strip.downcase}%"
        scope = scope.where("LOWER(name) LIKE ? OR LOWER(email) LIKE ? OR phone LIKE ?", q, q, q)
      end
      scope = scope.where(status: params[:status]) if params[:status].present?

      if params[:city_id].present?
        scope = scope.joins(:worker_profile).where(worker_profiles: { city_id: params[:city_id] })
      elsif params[:city].present?
        c = "%#{params[:city].to_s.strip.downcase}%"
        scope = scope.left_outer_joins(:worker_profile, :addresses)
                     .joins("LEFT JOIN cities ON cities.id = worker_profiles.city_id")
                     .where("LOWER(cities.name) LIKE ? OR LOWER(addresses.city) LIKE ?", c, c)
                     .distinct
      end

      if params[:availability].present?
        today = Time.current.strftime("%A")
        case params[:availability]
        when "available_today"
          scope = scope.where(status: "active")
                       .joins(:worker_profile)
                       .where(worker_profiles: { is_available: true })
                       .where("worker_profiles.available_days ? :day", day: today)
        when "unavailable_today"
          scope = scope.left_outer_joins(:worker_profile)
                       .where(
                         "users.status != 'active' OR worker_profiles.is_available = false OR NOT (worker_profiles.available_days ? :day) OR worker_profiles.id IS NULL",
                         day: today
                       )
        end
      end

      scope
    end

    def calculate_slots_for_date(worker, date, week_bookings)
      profile = worker.worker_profile
      day_name = date.strftime("%A")
      is_working_day = profile&.available_on_day?(day_name) || false
      is_active = worker.active? && (profile&.is_available.nil? ? true : profile.is_available)

      day_bookings = week_bookings.select { |b| b.scheduled_at&.to_date == date }

      BookingAvailabilityService::STANDARD_TIME_SLOTS.map do |slot_info|
        slot_label = slot_info[:slot]
        slot_time_str = "#{date.strftime('%Y-%m-%d')} #{slot_info[:time]}:00"
        slot_datetime = (Time.zone.parse(slot_time_str) rescue nil)
        is_past = slot_datetime && slot_datetime < Time.current

        matching_booking = day_bookings.find do |b|
          if b.time_slot.present? && b.time_slot.casecmp?(slot_label)
            true
          elsif b.scheduled_at.present? && slot_datetime.present?
            (b.scheduled_at - slot_datetime).abs < 45.minutes
          else
            false
          end
        end

        transit_conflict = if matching_booking.nil? && slot_datetime.present?
                              day_bookings.find do |b|
                                next false unless b.scheduled_at
                                b_dur = b.total_duration_minutes
                                b_end = b.expected_finish_time || (b.scheduled_at + b_dur.minutes)
                                slot_datetime >= b_end && slot_datetime < (b_end + BookingAvailabilityService::TRAVEL_BUFFER_MINUTES.minutes)
                              end
                            end

        status = if matching_booking.present?
                   if matching_booking.completed? || matching_booking.service_status == "completed"
                     "completed"
                   else
                     "booked"
                   end
                 elsif transit_conflict.present?
                   "transit"
                 elsif !is_active
                   "inactive"
                 elsif !is_working_day
                   "off_duty"
                 elsif is_past
                   "passed"
                 else
                   "available"
                 end

        {
          slot: slot_label,
          time: slot_info[:time],
          period: slot_info[:period],
          status: status,
          is_available: status == "available",
          booking: matching_booking,
          transit_booking: transit_conflict,
          is_past: is_past
        }
      end
    end
  end
end

