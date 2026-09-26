# frozen_string_literal: true

class CsvExportService
  class << self
    # Generates RFC 4180 compliant CSV text with UTF-8 BOM for Microsoft Excel compatibility
    def generate(headers, rows)
      lines = []
      lines << headers.map { |h| escape_csv_cell(h) }.join(",")

      rows.each do |row|
        lines << row.map { |cell| escape_csv_cell(cell) }.join(",")
      end

      # Prepend UTF-8 BOM so Excel opens Hindi characters and currency symbols cleanly
      "\uFEFF" + lines.join("\r\n")
    end

    def bookings_csv(bookings_scope)
      headers = [
        "Booking ID",
        "Booked On",
        "Customer Name",
        "Customer Phone",
        "Customer Email",
        "Assigned Beautician",
        "Beautician Phone",
        "Services",
        "Scheduled Date",
        "Scheduled Slot",
        "Subtotal (INR)",
        "Discount (INR)",
        "Total Amount (INR)",
        "Payment Method",
        "Payment Status",
        "Booking Status",
        "Service Status",
        "Service Address",
        "City",
        "Notes"
      ]

      rows = bookings_scope.map do |b|
        cust = b.customer
        wrk  = b.worker
        addr = b.address

        services_list = b.booking_items.map(&:service_name_snapshot).compact.presence || [b.display_service]

        [
          b.display_id,
          b.created_at&.strftime("%Y-%m-%d %I:%M %p"),
          cust&.name || b.customer_name,
          cust&.phone,
          cust&.email,
          wrk&.name || b.worker_name,
          wrk&.phone,
          services_list.join(" + "),
          b.date.presence || b.scheduled_at&.strftime("%Y-%m-%d"),
          b.time_slot.presence || b.scheduled_at&.strftime("%I:%M %p"),
          b.subtotal_amount.to_f,
          b.discount_amount.to_f,
          b.total_amount.to_f,
          (b.payment_method.presence || "cash").upcase,
          b.payment_status.to_s.titleize,
          b.booking_status.to_s.titleize,
          b.service_status.to_s.titleize,
          addr ? [addr.line1, addr.line2, addr.city, addr.pincode].compact_blank.join(", ") : "Customer Address",
          b.city&.name || addr&.city || "Delhi",
          b.notes.to_s.strip
        ]
      end

      generate(headers, rows)
    end

    def workers_csv(workers_scope)
      headers = [
        "Specialist ID",
        "Name",
        "Phone",
        "Email",
        "City",
        "Speciality / Role",
        "Account Status",
        "Availability Status",
        "Working Days",
        "Average Rating",
        "Total Reviews",
        "Completed Jobs",
        "Total Revenue (INR)",
        "Joined Date"
      ]

      rows = workers_scope.map do |w|
        wp = w.worker_profile
        days = Array(wp&.available_days)
        rating_avg = wp&.rating_avg.to_f > 0 ? wp.rating_avg.to_f : (w.received_reviews.average(:rating).to_f rescue 0.0)
        reviews_cnt = wp&.rating_count.to_i > 0 ? wp.rating_count.to_i : (w.received_reviews.count rescue 0)
        jobs_done = w.worker_bookings.where("booking_status = 'completed' OR service_status = 'completed'").count
        revenue = w.worker_bookings.where("booking_status = 'completed' OR service_status = 'completed'").sum(:total_amount).to_f

        [
          w.id,
          w.name,
          w.phone,
          w.email,
          w.serving_city,
          wp&.bio.presence || "Beauty Professional",
          w.status.to_s.titleize,
          wp&.is_available? ? "Accepting Bookings" : "On Leave / Inactive",
          days.join(", "),
          sprintf("%.1f", rating_avg),
          reviews_cnt,
          jobs_done,
          revenue,
          w.created_at&.strftime("%Y-%m-%d")
        ]
      end

      generate(headers, rows)
    end

    def customers_csv(customers_scope)
      headers = [
        "Customer ID",
        "Name",
        "Phone",
        "Email",
        "Status",
        "Total Bookings",
        "Total Spent (INR)",
        "Default City",
        "Joined Date"
      ]

      rows = customers_scope.map do |c|
        def_addr = c.addresses.find_by(is_default: true) || c.addresses.first
        b_count = c.customer_bookings.count
        spent = c.customer_bookings.where(booking_status: %w[confirmed completed]).sum(:total_amount).to_f

        [
          c.id,
          c.name,
          c.phone,
          c.email,
          c.status.to_s.titleize,
          b_count,
          spent,
          def_addr&.city || "N/A",
          c.created_at&.strftime("%Y-%m-%d")
        ]
      end

      generate(headers, rows)
    end

    def payments_csv(payments_scope)
      headers = [
        "Payment ID",
        "Transaction Ref",
        "Booking ID",
        "Customer Name",
        "Specialist Name",
        "Amount (INR)",
        "Payment Method",
        "Payment Status",
        "Paid At",
        "Created At"
      ]

      rows = payments_scope.map do |p|
        bk = p.booking
        [
          p.id,
          p.transaction_ref.presence || "N/A",
          bk&.display_id || p.booking_id,
          bk&.customer_name || "N/A",
          bk&.worker_name || "Unassigned",
          p.amount.to_f,
          p.method.to_s.upcase,
          p.status.to_s.titleize,
          p.paid_at&.strftime("%Y-%m-%d %I:%M %p") || "N/A",
          p.created_at&.strftime("%Y-%m-%d %I:%M %p")
        ]
      end

      generate(headers, rows)
    end

    # Complete platform backup containing full JSON snapshots of primary tables
    def full_backup_json
      {
        backup_metadata: {
          platform: "BeautyNest Home Service Platform",
          generated_at: Time.current.iso8601,
          schema_version: "2026.09",
          total_bookings: Booking.count,
          total_workers: User.workers.count,
          total_customers: User.customers.count,
          total_services: Service.count,
          total_categories: Category.count
        },
        categories: Category.all.as_json(include: :subcategories),
        services: Service.all.as_json(include: :service_city_prices),
        workers: User.workers.includes(:worker_profile, :addresses).map do |w|
          w.as_json(except: %i[password_digest auth_token]).merge(
            worker_profile: w.worker_profile.as_json,
            addresses: w.addresses.as_json
          )
        end,
        customers: User.customers.includes(:addresses).map do |c|
          c.as_json(except: %i[password_digest auth_token]).merge(
            addresses: c.addresses.as_json
          )
        end,
        bookings: Booking.includes(:booking_items, :payments, :review, :booking_reschedule_requests).map do |b|
          b.as_json.merge(
            items: b.booking_items.as_json,
            payments: b.payments.as_json,
            review: b.review.as_json,
            reschedule_requests: b.booking_reschedule_requests.as_json
          )
        end,
        payments: Payment.all.as_json,
        reviews: Review.all.as_json
      }
    end

    private

    def escape_csv_cell(value)
      return "" if value.nil?
      str = value.to_s
      if str.match?(/[",\r\n]/)
        "\"#{str.gsub('"', '""')}\""
      else
        str
      end
    end
  end
end
