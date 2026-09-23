# frozen_string_literal: true

class BookingAvailabilityService
  TRAVEL_BUFFER_MINUTES = 30

  STANDARD_TIME_SLOTS = [
    { slot: "09:00 AM", time: "09:00", period: "morning" },
    { slot: "10:30 AM", time: "10:30", period: "morning" },
    { slot: "12:00 PM", time: "12:00", period: "afternoon" },
    { slot: "01:30 PM", time: "01:30", period: "afternoon" },
    { slot: "03:00 PM", time: "03:00", period: "afternoon" },
    { slot: "04:30 PM", time: "04:30", period: "evening" },
    { slot: "06:00 PM", time: "06:00", period: "evening" },
    { slot: "07:30 PM", time: "07:30", period: "evening" }
  ].freeze

  PAYMENT_OPTIONS = [
    {
      id: "cod",
      name: "Cash on Delivery / Pay After Service",
      description: "Pay in cash or UPI directly to your beauty professional after service is completed",
      icon: "cash",
      badge: "Pay After Service",
      enabled: true
    },
    {
      id: "upi",
      name: "UPI / QR Code",
      description: "Pay instantly using Google Pay, PhonePe, Paytm, or any UPI app",
      icon: "qrcode",
      badge: "Instant & Secure",
      enabled: true
    },
    {
      id: "card",
      name: "Credit / Debit Card",
      description: "Visa, Mastercard, RuPay & American Express supported",
      icon: "credit-card",
      badge: nil,
      enabled: true
    },
    {
      id: "netbanking",
      name: "Net Banking",
      description: "Net banking across all major Indian banks",
      icon: "building-bank",
      badge: nil,
      enabled: true
    },
    {
      id: "wallet",
      name: "Digital Wallet",
      description: "Paytm, Mobikwik, Amazon Pay & other popular wallets",
      icon: "wallet",
      badge: nil,
      enabled: true
    }
  ].freeze

  class << self
    # Resolve City record from City instance, UUID, slug, or name
    def resolve_city(city_or_id)
      return city_or_id if city_or_id.is_a?(City)
      return nil if city_or_id.blank?

      City.friendly.find_by(id: city_or_id) ||
        City.friendly.find_by(slug: city_or_id.to_s.parameterize) ||
        City.where("LOWER(name) = ?", city_or_id.to_s.strip.downcase).first
    end

    # All active workers who serve this city and have an active profile
    def workers_for_city(city_or_id)
      city = resolve_city(city_or_id)
      return User.none unless city

      # Query workers with city_id on worker_profile OR fallback address city matching
      User.workers
          .where(status: "active")
          .joins(:worker_profile)
          .where(worker_profiles: { is_available: true })
          .where(
            "worker_profiles.city_id = :cid OR LOWER(worker_profiles.bio) LIKE :cname OR EXISTS (SELECT 1 FROM addresses WHERE addresses.user_id = users.id AND (addresses.city_id = :cid OR LOWER(addresses.city) = :cname_lower))",
            cid: city.id,
            cname: "%#{city.name.downcase}%",
            cname_lower: city.name.downcase
          )
          .distinct
    end

    # Resolve Worker record from User instance or UUID
    def resolve_worker(worker_or_id)
      return worker_or_id if worker_or_id.is_a?(User)
      return nil if worker_or_id.blank?

      User.workers.find_by(id: worker_or_id)
    end

    # Return rolling dates (default 14 days starting from today) with real availability metrics
    def available_dates(city_or_id, days_count = 14, start_date = Date.current, worker_id: nil)
      if worker_id.present?
        return worker_schedule_for_dates(worker_id, days_count, start_date)
      end

      city = resolve_city(city_or_id)
      return [] unless city

      city_workers = workers_for_city(city).includes(:worker_profile).to_a
      base_date = start_date.to_date

      0.upto(days_count - 1).map do |i|
        date_item = base_date + i
        day_name  = date_item.strftime("%A")
        day_short = WorkerProfile::DAY_CODES[day_name] || day_name[0, 2]

        # Filter workers who have this day in their schedule
        scheduled_workers = city_workers.select do |w|
          w.worker_profile&.available_on_day?(day_name)
        end

        is_avail = scheduled_workers.any?

        {
          date: date_item.strftime("%Y-%m-%d"),
          display_date: date_item.strftime("%a, %d %b"),
          day: day_name,
          day_short: day_short,
          is_today: (date_item == Date.current),
          is_available: is_avail,
          available_therapists_count: scheduled_workers.count,
          status_text: is_avail ? "#{scheduled_workers.count} #{'therapist'.pluralize(scheduled_workers.count)} available" : "No therapists scheduled"
        }
      end
    end

    # Schedule dates for a specific beautician over next N days
    def worker_schedule_for_dates(worker_or_id, days_count = 7, start_date = Date.current)
      worker = resolve_worker(worker_or_id)
      return [] unless worker

      wp = worker.worker_profile
      base_date = start_date.to_date

      0.upto(days_count - 1).map do |i|
        date_item = base_date + i
        day_name  = date_item.strftime("%A")
        day_short = WorkerProfile::DAY_CODES[day_name] || day_name[0, 2]

        is_working_day = wp&.available_on_day?(day_name) || false
        is_active = worker.active? && (wp&.is_available.nil? ? true : wp.is_available)

        # Check if worker has at least one open time slot on this day
        has_free_slot = false
        if is_working_day && is_active
          slots = worker_time_slots(worker, date_item)
          has_free_slot = slots.any? { |s| s[:is_available] }
        end

        is_avail = is_working_day && is_active && has_free_slot

        status_text = if !is_active
                        "Unavailable"
                      elsif !is_working_day
                        "Day Off"
                      elsif !has_free_slot
                        "Fully Booked"
                      else
                        "Available"
                      end

        {
          date: date_item.strftime("%Y-%m-%d"),
          display_date: date_item.strftime("%a, %d %b"),
          day: day_name,
          day_short: day_short,
          is_today: (date_item == Date.current),
          is_available: is_avail,
          is_working_day: is_working_day,
          status_text: status_text,
          worker: {
            id: worker.id,
            name: worker.name,
            experience_years: wp&.experience_years.to_i,
            experience_display: worker.experience_display
          }
        }
      end
    end

    # Available time slots for a given city and date (or for a specific worker if worker_id given)
    def time_slots_for(city_or_id, date, worker_id: nil)
      if worker_id.present?
        return worker_time_slots(worker_id, date)
      end

      city = resolve_city(city_or_id)
      return [] unless city

      parsed_date = parse_date(date)
      return [] unless parsed_date

      day_name = parsed_date.strftime("%A")
      city_workers = workers_for_city(city).includes(:worker_profile).to_a
      on_duty_workers = city_workers.select { |w| w.worker_profile&.available_on_day?(day_name) }

      # Preload bookings on that date to check conflicts
      day_start = parsed_date.beginning_of_day
      day_end   = parsed_date.end_of_day
      day_bookings = Booking.active_scheduled
                            .where(scheduled_at: day_start..day_end)
                            .where.not(worker_id: nil)
                            .to_a

      STANDARD_TIME_SLOTS.map do |slot_info|
        slot_label = slot_info[:slot]
        slot_time_str = "#{parsed_date.strftime('%Y-%m-%d')} #{slot_info[:time]}:00"
        slot_datetime = (Time.zone.parse(slot_time_str) rescue nil)

        # If date is today and time slot is in the past, mark unavailable
        is_past = slot_datetime && slot_datetime < (Time.current + 20.minutes)

        # Count workers free at this time
        busy_worker_ids = day_bookings.select do |b|
          next false unless b.scheduled_at
          (b.scheduled_at - slot_datetime).abs < 60.minutes || b.time_slot == slot_label
        end.map(&:worker_id).compact.uniq

        free_workers = on_duty_workers.reject { |w| busy_worker_ids.include?(w.id) }
        is_avail = !is_past && free_workers.any?

        {
          slot: slot_label,
          time: slot_info[:time],
          period: slot_info[:period],
          is_available: is_avail,
          available_workers_count: is_avail ? free_workers.count : 0,
          status_text: is_past ? "Passed" : (is_avail ? "Available" : "Fully Booked")
        }
      end
    end

    # Time slots specifically for a single beautician on a given date
    def worker_time_slots(worker_or_id, date)
      worker = resolve_worker(worker_or_id)
      return [] unless worker

      parsed_date = parse_date(date)
      return [] unless parsed_date

      wp = worker.worker_profile
      day_name = parsed_date.strftime("%A")
      is_working_day = wp&.available_on_day?(day_name) || false
      is_active = worker.active? && (wp&.is_available.nil? ? true : wp.is_available)

      # Preload bookings for this worker on this date
      day_start = parsed_date.beginning_of_day
      day_end   = parsed_date.end_of_day
      worker_bookings = Booking.active_scheduled
                               .where(worker_id: worker.id)
                               .where(scheduled_at: day_start..day_end)
                               .includes(:booking_items, :services)
                               .to_a

      STANDARD_TIME_SLOTS.map do |slot_info|
        slot_label = slot_info[:slot]
        slot_time_str = "#{parsed_date.strftime('%Y-%m-%d')} #{slot_info[:time]}:00"
        slot_datetime = (Time.zone.parse(slot_time_str) rescue nil)

        is_past = slot_datetime && slot_datetime < (Time.current + 20.minutes)

        avail_result = worker_available?(worker, parsed_date, slot_label, duration_minutes: 60)
        is_avail = is_active && is_working_day && !is_past && avail_result[:available]

        matching_booking = worker_bookings.find do |b|
          next false unless b.scheduled_at
          b_dur = b.total_duration_minutes
          b_end = b.expected_finish_time || (b.scheduled_at + b_dur.minutes)
          slot_datetime >= b.scheduled_at && slot_datetime < b_end
        end

        transit_conflict = worker_bookings.find do |b|
          next false unless b.scheduled_at
          b_dur = b.total_duration_minutes
          b_end = b.expected_finish_time || (b.scheduled_at + b_dur.minutes)
          slot_datetime >= b_end && slot_datetime < (b_end + TRAVEL_BUFFER_MINUTES.minutes)
        end

        status_text = if !is_active
                        "Unavailable"
                      elsif !is_working_day
                        "Day Off"
                      elsif is_past
                        "Passed"
                      elsif matching_booking.present?
                        "Booked"
                      elsif transit_conflict.present?
                        "In Transit"
                      elsif !avail_result[:available]
                        "Unavailable"
                      else
                        "Available"
                      end

        {
          slot: slot_label,
          time: slot_info[:time],
          period: slot_info[:period],
          is_available: is_avail,
          status_text: status_text,
          reason: avail_result[:error]
        }
      end
    end

    # Check if a worker serves a specific city
    def worker_serves_city?(worker_or_id, city_or_id)
      worker = resolve_worker(worker_or_id)
      city = resolve_city(city_or_id)
      return true if worker.nil? || city.nil?

      wp = worker.worker_profile
      return true if wp&.city_id == city.id
      return true if worker.serving_city.to_s.casecmp?(city.name)
      return true if wp&.bio.to_s.downcase.include?(city.name.downcase)
      return true if worker.addresses.where(city_id: city.id).exists? ||
                     worker.addresses.where("LOWER(city) = ?", city.name.downcase).exists?

      false
    end

    # Check if a specific beautician is available on a specific date and time slot (with travel buffer & service completion validation)
    def worker_available?(worker_or_id, date, time_slot, city: nil, duration_minutes: nil, exclude_booking_id: nil)
      worker = resolve_worker(worker_or_id)
      return { available: false, error: "Requested beauty professional not found." } unless worker

      unless worker.active?
        return { available: false, error: "#{worker.name} is currently inactive and cannot accept bookings." }
      end

      wp = worker.worker_profile
      if wp && !wp.is_available?
        return { available: false, error: "#{worker.name} is currently not accepting new appointments." }
      end

      # Validate city serviceability if city is provided
      city_record = nil
      if city.present?
        city_record = resolve_city(city)
        if city_record.nil?
          return { available: false, error: "Selected city is invalid or not serviceable." }
        end
        unless city_record.active?
          return { available: false, error: "City '#{city_record.name}' is currently not serviceable." }
        end
        unless worker_serves_city?(worker, city_record)
          served_name = worker.serving_city.presence || wp&.city&.name || "another city"
          return {
            available: false,
            error: "#{worker.name} is not available in #{city_record.name}. She only provides services in #{served_name}."
          }
        end
      end

      parsed_date = parse_date(date)
      return { available: false, error: "Invalid date format. Please use YYYY-MM-DD." } unless parsed_date

      if parsed_date < Date.current
        return { available: false, error: "Booking date cannot be in the past." }
      end

      if parsed_date > Date.current + 14
        return { available: false, error: "Booking date must be within the next 14 days." }
      end

      day_name = parsed_date.strftime("%A")
      unless wp&.available_on_day?(day_name)
        working_days = wp&.available_days_short || "Monday - Saturday"
        return {
          available: false,
          error: "#{worker.name} does not work on #{day_name}s. Her working days are: #{working_days}."
        }
      end

      slot_info = STANDARD_TIME_SLOTS.find { |s| s[:slot].casecmp?(time_slot.to_s.strip) }
      time_str = slot_info ? slot_info[:time] : (Time.zone.parse(time_slot.to_s).strftime("%H:%M") rescue nil)
      return { available: false, error: "Invalid time slot '#{time_slot}'." } unless time_str

      slot_datetime = (Time.zone.parse("#{parsed_date.strftime('%Y-%m-%d')} #{time_str}:00") rescue nil)
      if slot_datetime && slot_datetime < (Time.current + 15.minutes)
        return { available: false, error: "Time slot '#{time_slot}' on #{parsed_date.strftime('%d %b')} has already passed. Please select a future time slot." }
      end

      slot_label = slot_info ? slot_info[:slot] : time_slot.to_s.strip
      req_duration = [duration_minutes.to_i, 60].max
      req_start = slot_datetime
      req_end   = slot_datetime + req_duration.minutes

      # Load all active/scheduled bookings for this worker on that date
      scope = Booking.active_scheduled
                     .where(worker_id: worker.id)
                     .where(scheduled_at: parsed_date.beginning_of_day..parsed_date.end_of_day)
                     .includes(:booking_items, :services)
      scope = scope.where.not(id: exclude_booking_id) if exclude_booking_id.present?
      day_bookings = scope.to_a

      day_bookings.each do |b|
        b_start = b.scheduled_at
        next unless b_start

        b_dur = b.total_duration_minutes
        b_end = b.expected_finish_time || (b_start + b_dur.minutes)
        earliest_reach = b_end + TRAVEL_BUFFER_MINUTES.minutes

        # 1. Direct overlap check
        if req_start < b_end && req_end > b_start
          return {
            available: false,
            error: "#{worker.name} is already serving Booking ##{b.display_id} (#{b.display_service}) from #{b_start.strftime('%I:%M %p')} to #{b_end.strftime('%I:%M %p')}."
          }
        end

        # 2. Prior service completion & reachability buffer check
        if b_start <= req_start
          if req_start < earliest_reach
            return {
              available: false,
              error: "#{worker.name} cannot reach in time. Her previous service (Booking ##{b.display_id}) completes at #{b_end.strftime('%I:%M %p')} and requires at least #{TRAVEL_BUFFER_MINUTES} minutes travel buffer. Earliest reachable time is #{earliest_reach.strftime('%I:%M %p')}."
            }
          end

          # Realtime ongoing service check if date is today
          if parsed_date == Date.current && b_start <= Time.current
            is_done = b.booking_status == "completed" || b.service_status == "completed"
            if !is_done && b.service_status == "in_progress"
              if req_start < (Time.current + TRAVEL_BUFFER_MINUTES.minutes + 15.minutes)
                return {
                  available: false,
                  error: "#{worker.name}'s prior service (Booking ##{b.display_id}) is currently in progress and not completed yet. She will not be able to reach this service on time."
                }
              end
            end
          end
        end

        # 3. Subsequent service transit buffer check
        if b_start >= req_end
          next_required_reach = req_end + TRAVEL_BUFFER_MINUTES.minutes
          if next_required_reach > b_start
            return {
              available: false,
              error: "This service (#{req_duration} mins) plus #{TRAVEL_BUFFER_MINUTES} mins travel buffer will conflict with #{worker.name}'s next scheduled booking (##{b.display_id} at #{b_start.strftime('%I:%M %p')})."
            }
          end
        end
      end

      { available: true, worker: worker, city: city_record, date: parsed_date, time_slot: slot_label }
    end

    # List real therapists available in the city on the selected date & time slot
    def eligible_workers(city_or_id, date, time_slot = nil, duration_minutes: 60)
      city = resolve_city(city_or_id)
      return [] unless city

      parsed_date = parse_date(date)
      return [] unless parsed_date

      day_name = parsed_date.strftime("%A")
      city_workers = workers_for_city(city).includes(:worker_profile).to_a
      on_duty_workers = city_workers.select { |w| w.worker_profile&.available_on_day?(day_name) }

      if time_slot.present?
        on_duty_workers = on_duty_workers.select do |w|
          worker_available?(w, parsed_date, time_slot, city: city, duration_minutes: duration_minutes)[:available]
        end
      end

      # Sort by highest rating, then experience
      on_duty_workers.sort_by do |w|
        [- (w.worker_profile&.rating_avg || 0.0).to_f, - (w.worker_profile&.experience_years || 0).to_i]
      end
    end

    # Auto-assign best available worker for a booking
    def auto_assign_worker(city_or_id, date, time_slot = nil)
      workers = eligible_workers(city_or_id, date, time_slot)
      return nil if workers.empty?

      # Prefer worker with fewest bookings on this day
      parsed_date = parse_date(date)
      if parsed_date
        bookings_count_by_worker = Booking.active_scheduled
                                         .where(scheduled_at: parsed_date.beginning_of_day..parsed_date.end_of_day)
                                         .where(worker_id: workers.map(&:id))
                                         .group(:worker_id)
                                         .count

        workers.min_by do |w|
          count = bookings_count_by_worker[w.id] || 0
          rating = (w.worker_profile&.rating_avg || 0.0).to_f
          # balance load and rating
          count * 10 - rating
        end
      else
        workers.first
      end
    end

    # Format worker representation for booking flow responses
    def worker_json(worker, recommended: false)
      return nil unless worker

      profile = worker.worker_profile
      tier = profile&.worker_tier
      {
        id: worker.id,
        name: worker.name,
        phone: worker.phone,
        speciality: profile&.bio.presence || "Beauty Professional",
        bio: profile&.bio,
        experience_years: profile&.experience_years || 0,
        rating: (profile&.rating_avg || 0.0).to_f,
        reviews_count: profile&.rating_count || 0,
        avatar_url: worker.avatar_url,
        initials: worker.initials,
        serving_city: worker.serving_city,
        is_available: profile&.is_available.nil? ? true : profile.is_available,
        recommended: recommended,
        worker_tier: tier ? {
          id: tier.id,
          name: tier.name,
          slug: tier.slug,
          price_multiplier: tier.price_multiplier.to_f
        } : nil
      }
    end

    def parse_date(date_val)
      return nil if date_val.blank?
      return date_val.to_date if date_val.is_a?(Time) || date_val.is_a?(DateTime) || date_val.is_a?(ActiveSupport::TimeWithZone)
      return date_val if date_val.is_a?(Date)
      return date_val.to_date if date_val.respond_to?(:to_date)

      Date.parse(date_val.to_s)
    rescue ArgumentError
      nil
    end
  end
end
