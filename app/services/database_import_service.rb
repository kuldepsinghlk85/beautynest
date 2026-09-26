# frozen_string_literal: true

require "securerandom"

class DatabaseImportService
  ENTITIES = %i[
    categories
    subcategories
    services
    service_city_prices
    workers
    worker_profiles
    customers
    addresses
    bookings
    booking_items
    payments
    reviews
    reschedule_requests
  ].freeze

  def self.import(raw_data)
    new(raw_data).import
  end

  def initialize(raw_data)
    @raw_data = raw_data
    @stats = ENTITIES.each_with_object({}) do |entity, h|
      h[entity] = { created: 0, skipped: 0 }
    end
  end

  def import
    parsed_data = parse_payload(@raw_data)
    return { success: false, error: "Invalid backup format: JSON payload could not be parsed." } unless parsed_data.is_a?(Hash)

    # Validate minimal structure
    metadata = parsed_data["backup_metadata"] || parsed_data[:backup_metadata]
    unless metadata.present? || parsed_data.key?("bookings") || parsed_data.key?(:bookings)
      return { success: false, error: "Unrecognized backup structure. Expected BeautyNest JSON database backup." }
    end

    ActiveRecord::Base.transaction do
      import_categories(parsed_data["categories"] || parsed_data[:categories])
      import_services(parsed_data["services"] || parsed_data[:services])
      import_workers(parsed_data["workers"] || parsed_data[:workers])
      import_customers(parsed_data["customers"] || parsed_data[:customers])
      import_bookings(parsed_data["bookings"] || parsed_data[:bookings])
      import_standalone_payments(parsed_data["payments"] || parsed_data[:payments])
      import_standalone_reviews(parsed_data["reviews"] || parsed_data[:reviews])
    end

    total_created = @stats.values.sum { |s| s[:created] }
    total_skipped = @stats.values.sum { |s| s[:skipped] }

    {
      success: true,
      total_created: total_created,
      total_skipped: total_skipped,
      details: @stats,
      metadata: metadata,
      message: "Database restore completed: #{total_created} missing records added, #{total_skipped} existing records kept untouched."
    }
  rescue JSON::ParserError => e
    { success: false, error: "JSON parsing error: #{e.message}" }
  rescue StandardError => e
    Rails.logger.error("[DatabaseImportService] Import failed: #{e.message}\n#{e.backtrace.first(5).join("\n")}")
    { success: false, error: e.message }
  end

  private

  def parse_payload(raw)
    return raw if raw.is_a?(Hash)

    if raw.respond_to?(:read)
      JSON.parse(raw.read)
    elsif raw.is_a?(String)
      JSON.parse(raw)
    else
      nil
    end
  end

  # ── Categories & Subcategories ──────────────────────────────────────────────
  def import_categories(categories)
    return unless categories.is_a?(Array)

    categories.each do |cat|
      cat = cat.with_indifferent_access
      existing_cat = find_existing_category(cat)

      if existing_cat
        @stats[:categories][:skipped] += 1
        parent_cat = existing_cat
      else
        cat_attrs = cat.slice(*Category.column_names)
        parent_cat = Category.create!(cat_attrs)
        @stats[:categories][:created] += 1
      end

      # Subcategories
      subcategories = cat[:subcategories]
      if subcategories.is_a?(Array)
        subcategories.each do |sub|
          sub = sub.with_indifferent_access
          existing_sub = find_existing_subcategory(sub, parent_cat.id)

          if existing_sub
            @stats[:subcategories][:skipped] += 1
          else
            sub_attrs = sub.slice(*Subcategory.column_names)
            sub_attrs["category_id"] = parent_cat.id
            Subcategory.create!(sub_attrs)
            @stats[:subcategories][:created] += 1
          end
        end
      end
    end
  end

  def find_existing_category(cat)
    Category.find_by(id: cat[:id]) ||
      (cat[:slug].present? && Category.find_by(slug: cat[:slug])) ||
      (cat[:name].present? && Category.find_by("LOWER(name) = ?", cat[:name].to_s.strip.downcase))
  end

  def find_existing_subcategory(sub, category_id)
    Subcategory.find_by(id: sub[:id]) ||
      (sub[:slug].present? && Subcategory.find_by(slug: sub[:slug])) ||
      (sub[:name].present? && Subcategory.find_by(category_id: category_id, name: sub[:name].to_s.strip))
  end

  # ── Services & City Prices ──────────────────────────────────────────────────
  def import_services(services)
    return unless services.is_a?(Array)

    services.each do |s|
      s = s.with_indifferent_access
      existing_s = find_existing_service(s)

      if existing_s
        @stats[:services][:skipped] += 1
        parent_service = existing_s
      else
        s_attrs = s.slice(*Service.column_names)
        # Ensure category foreign key is valid
        if s_attrs["category_id"].present? && !Category.exists?(id: s_attrs["category_id"])
          s_attrs["category_id"] = Category.first&.id
        end
        # Ensure subcategory foreign key is valid
        if s_attrs["subcategory_id"].present? && !Subcategory.exists?(id: s_attrs["subcategory_id"])
          s_attrs["subcategory_id"] = nil
        end

        parent_service = Service.create!(s_attrs)
        @stats[:services][:created] += 1
      end

      # Service city prices
      city_prices = s[:service_city_prices]
      if city_prices.is_a?(Array)
        city_prices.each do |scp|
          scp = scp.with_indifferent_access
          existing_scp = ServiceCityPrice.find_by(id: scp[:id]) ||
                         ServiceCityPrice.find_by(service_id: parent_service.id, city_id: scp[:city_id])

          if existing_scp
            @stats[:service_city_prices][:skipped] += 1
          elsif scp[:city_id].present? && City.exists?(id: scp[:city_id])
            scp_attrs = scp.slice(*ServiceCityPrice.column_names)
            scp_attrs["service_id"] = parent_service.id
            ServiceCityPrice.create!(scp_attrs)
            @stats[:service_city_prices][:created] += 1
          end
        end
      end
    end
  end

  def find_existing_service(s)
    Service.find_by(id: s[:id]) ||
      (s[:slug].present? && Service.find_by(slug: s[:slug])) ||
      (s[:name].present? && Service.find_by("LOWER(name) = ?", s[:name].to_s.strip.downcase))
  end

  # ── Workers ─────────────────────────────────────────────────────────────────
  def import_workers(workers)
    return unless workers.is_a?(Array)

    workers.each do |w|
      w = w.with_indifferent_access
      existing_user = find_existing_user(w)

      if existing_user
        @stats[:workers][:skipped] += 1
        worker_record = existing_user
      else
        u_attrs = w.slice(*User.column_names)
        u_attrs["password"] = SecureRandom.hex(16)
        u_attrs["role"] = "worker"
        worker_record = User.create!(u_attrs)
        @stats[:workers][:created] += 1
      end

      # Worker profile
      wp = w[:worker_profile]
      if wp.is_a?(Hash)
        wp = wp.with_indifferent_access
        existing_wp = WorkerProfile.find_by(user_id: worker_record.id) ||
                      WorkerProfile.find_by(id: wp[:id])

        if existing_wp
          @stats[:worker_profiles][:skipped] += 1
        else
          wp_attrs = wp.slice(*WorkerProfile.column_names)
          wp_attrs["user_id"] = worker_record.id
          # Validate city_id
          wp_attrs["city_id"] = nil if wp_attrs["city_id"].present? && !City.exists?(id: wp_attrs["city_id"])
          # Validate worker_tier_id
          wp_attrs["worker_tier_id"] = nil if wp_attrs["worker_tier_id"].present? && !WorkerTier.exists?(id: wp_attrs["worker_tier_id"])
          WorkerProfile.create!(wp_attrs)
          @stats[:worker_profiles][:created] += 1
        end
      end

      # Addresses
      import_addresses(w[:addresses], worker_record.id)
    end
  end

  # ── Customers ───────────────────────────────────────────────────────────────
  def import_customers(customers)
    return unless customers.is_a?(Array)

    customers.each do |c|
      c = c.with_indifferent_access
      existing_user = find_existing_user(c)

      if existing_user
        @stats[:customers][:skipped] += 1
        customer_record = existing_user
      else
        c_attrs = c.slice(*User.column_names)
        c_attrs["password"] = SecureRandom.hex(16)
        c_attrs["role"] = "customer"
        customer_record = User.create!(c_attrs)
        @stats[:customers][:created] += 1
      end

      import_addresses(c[:addresses], customer_record.id)
    end
  end

  def find_existing_user(u)
    User.find_by(id: u[:id]) ||
      (u[:email].present? && User.find_by("LOWER(email) = ?", u[:email].to_s.strip.downcase)) ||
      (u[:phone].present? && User.find_by(phone: u[:phone].to_s.strip))
  end

  def import_addresses(addresses, user_id)
    return unless addresses.is_a?(Array)

    addresses.each do |addr|
      addr = addr.with_indifferent_access
      existing_addr = Address.find_by(id: addr[:id]) ||
                      Address.find_by(user_id: user_id, line1: addr[:line1].to_s.strip, pincode: addr[:pincode].to_s.strip)

      if existing_addr
        @stats[:addresses][:skipped] += 1
      else
        addr_attrs = addr.slice(*Address.column_names)
        addr_attrs["user_id"] = user_id
        addr_attrs["city_id"] = nil if addr_attrs["city_id"].present? && !City.exists?(id: addr_attrs["city_id"])
        Address.create!(addr_attrs)
        @stats[:addresses][:created] += 1
      end
    end
  end

  # ── Bookings ────────────────────────────────────────────────────────────────
  def import_bookings(bookings)
    return unless bookings.is_a?(Array)

    bookings.each do |b|
      b = b.with_indifferent_access
      existing_bk = Booking.find_by(id: b[:id]) ||
                    (b[:booking_number].present? && Booking.find_by(booking_number: b[:booking_number].to_s.strip))

      if existing_bk
        @stats[:bookings][:skipped] += 1
        booking_record = existing_bk
      else
        b_attrs = b.slice(*Booking.column_names)

        # Validate customer_id
        unless User.exists?(id: b_attrs["customer_id"])
          b_attrs["customer_id"] = User.customers.first&.id
        end
        return if b_attrs["customer_id"].blank? # Safety check: cannot save booking without customer

        # Validate worker_id
        if b_attrs["worker_id"].present? && !User.exists?(id: b_attrs["worker_id"])
          b_attrs["worker_id"] = nil
        end
        # Validate address_id
        if b_attrs["address_id"].present? && !Address.exists?(id: b_attrs["address_id"])
          b_attrs["address_id"] = nil
        end
        # Validate city_id
        if b_attrs["city_id"].present? && !City.exists?(id: b_attrs["city_id"])
          b_attrs["city_id"] = nil
        end
        # Validate coupon_id
        if b_attrs["coupon_id"].present? && !Coupon.exists?(id: b_attrs["coupon_id"])
          b_attrs["coupon_id"] = nil
        end
        # Validate worker_tier_id
        if b_attrs["worker_tier_id"].present? && !WorkerTier.exists?(id: b_attrs["worker_tier_id"])
          b_attrs["worker_tier_id"] = nil
        end

        booking_record = Booking.create!(b_attrs)
        @stats[:bookings][:created] += 1
      end

      # Booking Items
      items = b[:items]
      if items.is_a?(Array)
        items.each do |item|
          item = item.with_indifferent_access
          existing_item = BookingItem.find_by(id: item[:id]) ||
                          BookingItem.find_by(booking_id: booking_record.id, service_id: item[:service_id])

          if existing_item
            @stats[:booking_items][:skipped] += 1
          else
            i_attrs = item.slice(*BookingItem.column_names)
            i_attrs["booking_id"] = booking_record.id
            if i_attrs["service_id"].present? && !Service.exists?(id: i_attrs["service_id"])
              i_attrs["service_id"] = Service.first&.id
            end
            if i_attrs["worker_id"].present? && !User.exists?(id: i_attrs["worker_id"])
              i_attrs["worker_id"] = nil
            end
            if i_attrs["city_id"].present? && !City.exists?(id: i_attrs["city_id"])
              i_attrs["city_id"] = nil
            end
            BookingItem.create!(i_attrs)
            @stats[:booking_items][:created] += 1
          end
        end
      end

      # Payments embedded in booking
      b_payments = b[:payments]
      if b_payments.is_a?(Array)
        b_payments.each do |p|
          p = p.with_indifferent_access
          existing_pay = Payment.find_by(id: p[:id]) ||
                         (p[:transaction_ref].present? && Payment.find_by(transaction_ref: p[:transaction_ref].to_s.strip))

          if existing_pay
            @stats[:payments][:skipped] += 1
          else
            p_attrs = p.slice(*Payment.column_names)
            p_attrs["booking_id"] = booking_record.id
            Payment.create!(p_attrs)
            @stats[:payments][:created] += 1
          end
        end
      end

      # Review embedded in booking
      rev = b[:review]
      if rev.is_a?(Hash)
        rev = rev.with_indifferent_access
        existing_rev = Review.find_by(id: rev[:id]) ||
                       Review.find_by(booking_id: booking_record.id)

        if existing_rev
          @stats[:reviews][:skipped] += 1
        else
          r_attrs = rev.slice(*Review.column_names)
          r_attrs["booking_id"] = booking_record.id
          r_attrs["customer_id"] ||= booking_record.customer_id
          r_attrs["worker_id"] ||= booking_record.worker_id
          r_attrs["service_id"] = nil if r_attrs["service_id"].present? && !Service.exists?(id: r_attrs["service_id"])
          Review.create!(r_attrs)
          @stats[:reviews][:created] += 1
        end
      end

      # Reschedule requests embedded in booking
      requests = b[:reschedule_requests]
      if requests.is_a?(Array)
        requests.each do |req|
          req = req.with_indifferent_access
          existing_req = BookingRescheduleRequest.find_by(id: req[:id])

          if existing_req
            @stats[:reschedule_requests][:skipped] += 1
          else
            req_attrs = req.slice(*BookingRescheduleRequest.column_names)
            req_attrs["booking_id"] = booking_record.id
            req_attrs["requested_by_id"] = booking_record.customer_id unless User.exists?(id: req_attrs["requested_by_id"])
            req_attrs["worker_id"] = booking_record.worker_id || User.workers.first&.id unless User.exists?(id: req_attrs["worker_id"])
            req_attrs["resolved_by_id"] = nil if req_attrs["resolved_by_id"].present? && !User.exists?(id: req_attrs["resolved_by_id"])
            BookingRescheduleRequest.create!(req_attrs)
            @stats[:reschedule_requests][:created] += 1
          end
        end
      end
    end
  end

  # ── Standalone Payments ─────────────────────────────────────────────────────
  def import_standalone_payments(payments)
    return unless payments.is_a?(Array)

    payments.each do |p|
      p = p.with_indifferent_access
      existing_pay = Payment.find_by(id: p[:id]) ||
                     (p[:transaction_ref].present? && Payment.find_by(transaction_ref: p[:transaction_ref].to_s.strip))

      if existing_pay
        @stats[:payments][:skipped] += 1
      elsif Booking.exists?(id: p[:booking_id])
        p_attrs = p.slice(*Payment.column_names)
        Payment.create!(p_attrs)
        @stats[:payments][:created] += 1
      end
    end
  end

  # ── Standalone Reviews ──────────────────────────────────────────────────────
  def import_standalone_reviews(reviews)
    return unless reviews.is_a?(Array)

    reviews.each do |rev|
      rev = rev.with_indifferent_access
      existing_rev = Review.find_by(id: rev[:id]) ||
                     (rev[:booking_id].present? && Review.find_by(booking_id: rev[:booking_id]))

      if existing_rev
        @stats[:reviews][:skipped] += 1
      elsif Booking.exists?(id: rev[:booking_id]) && User.exists?(id: rev[:customer_id])
        r_attrs = rev.slice(*Review.column_names)
        r_attrs["worker_id"] = nil if r_attrs["worker_id"].present? && !User.exists?(id: r_attrs["worker_id"])
        r_attrs["service_id"] = nil if r_attrs["service_id"].present? && !Service.exists?(id: r_attrs["service_id"])
        Review.create!(r_attrs)
        @stats[:reviews][:created] += 1
      end
    end
  end
end
