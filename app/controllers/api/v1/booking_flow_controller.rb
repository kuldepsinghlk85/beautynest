# frozen_string_literal: true

module Api
  module V1
    # Booking flow helpers: date availability and time slot availability for a city.
    # The full booking is created via POST /api/v1/bookings.
    class BookingFlowController < BaseController
      skip_before_action :authenticate_api_user!, only: %i[consent_form dates time_slots workers worker_availability]
      before_action :require_customer!, except: %i[consent_form dates time_slots workers worker_availability]
      before_action :set_city, only: %i[dates time_slots workers]

      # GET /api/v1/booking_flow/consent_form
      def consent_form
        render_success(
          {
            required: Setting.consent_form_required?,
            title: Setting.consent_form_title,
            version: Setting.consent_form_version,
            content: Setting.consent_form_content,
            product_choice: {
              enabled: Setting.product_choice_enabled?,
              platform_product_fee: Setting.platform_product_fee,
              platform_product_fee_note: Setting.platform_product_fee_note,
              options: [
                {
                  id: "platform",
                  label: "Platform's Sanitized Products Kit",
                  fee: Setting.platform_product_fee,
                  description: Setting.platform_product_fee_note
                },
                {
                  id: "customer",
                  label: "Use My Own Products",
                  fee: 0.0,
                  description: "You provide your own beauty and skincare products. Platform kit fee is waived."
                }
              ]
            }
          },
          "Consent form and product sourcing options retrieved successfully."
        )
      end

      # GET /api/v1/booking_flow/dates?city_id=...&worker_id=...
      # Returns the next 7 days with availability status for the given city or worker.
      def dates
        worker_id = params[:worker_id].presence
        dates_list = BookingAvailabilityService.available_dates(@city, 7, Date.current, worker_id: worker_id)

        worker_info = nil
        if worker_id.present?
          w = BookingAvailabilityService.resolve_worker(worker_id)
          worker_info = BookingAvailabilityService.worker_json(w) if w
        end

        render_success(
          {
            city: @city ? { id: @city.id, name: @city.name, slug: @city.slug } : nil,
            worker: worker_info,
            dates: dates_list
          },
          "Available dates retrieved successfully."
        )
      end

      # GET /api/v1/booking_flow/time_slots?city_id=...&date=...&worker_id=...
      # Returns time slot availability for the city or specific beautician on a given date.
      def time_slots
        date_param = params[:date].presence
        unless date_param
          return render_unprocessable(["Date parameter is required (format: YYYY-MM-DD)."])
        end

        parsed = (Date.parse(date_param) rescue nil)
        unless parsed
          return render_unprocessable(["Invalid date format. Use YYYY-MM-DD."])
        end

        if parsed < Date.current
          return render_unprocessable(["Date cannot be in the past."])
        end

        if parsed > Date.current + 14
          return render_unprocessable(["Date must be within the next 14 days."])
        end

        worker_id = params[:worker_id].presence
        slots = BookingAvailabilityService.time_slots_for(@city, date_param, worker_id: worker_id)

        worker_info = nil
        if worker_id.present?
          w = BookingAvailabilityService.resolve_worker(worker_id)
          worker_info = BookingAvailabilityService.worker_json(w) if w
        end

        render_success(
          {
            city: @city ? { id: @city.id, name: @city.name } : nil,
            worker: worker_info,
            date: date_param,
            day: parsed.strftime("%A"),
            time_slots: slots
          },
          "Available time slots retrieved successfully."
        )
      end

      # GET /api/v1/booking_flow/workers?city_id=...&date=...&time_slot=...&worker_id=...
      # Returns eligible workers in the city for the given date and time slot,
      # and if worker_id is specified, checks that worker's specific status (day-off, booked, city mismatch).
      def workers
        date_param = params[:date].presence
        time_slot  = params[:time_slot].presence
        requested_worker_id = params[:worker_id].presence

        workers_list = BookingAvailabilityService.eligible_workers(@city, date_param, time_slot)

        requested_status = nil
        if requested_worker_id.present?
          req_w = BookingAvailabilityService.resolve_worker(requested_worker_id)
          if req_w
            check = BookingAvailabilityService.worker_available?(req_w, date_param, time_slot, city: @city)
            requested_status = {
              worker: BookingAvailabilityService.worker_json(req_w),
              available: check[:available],
              error: check[:error]
            }
          else
            requested_status = {
              available: false,
              error: "Requested beauty professional not found."
            }
          end
        end

        render_success(
          {
            city: @city ? { id: @city.id, name: @city.name, slug: @city.slug } : nil,
            date: date_param,
            time_slot: time_slot,
            count: workers_list.size,
            workers: workers_list.map.with_index { |w, idx| BookingAvailabilityService.worker_json(w, recommended: idx.zero?) },
            requested_worker: requested_status
          },
          "Available beauty professionals retrieved successfully."
        )
      end

      # GET /api/v1/booking_flow/worker_availability?worker_id=...&date=...&time_slot=...&city_id=...
      def worker_availability
        worker_id  = params[:worker_id].presence
        date_param = params[:date].presence
        time_slot  = params[:time_slot].presence
        city_param = params[:city_id].presence || params[:city].presence

        return render_unprocessable(["worker_id is required."]) if worker_id.blank?
        return render_unprocessable(["date is required."]) if date_param.blank?
        return render_unprocessable(["time_slot is required."]) if time_slot.blank?

        result = BookingAvailabilityService.worker_available?(worker_id, date_param, time_slot, city: city_param)
        if result[:available]
          render_success(
            {
              available: true,
              worker: BookingAvailabilityService.worker_json(result[:worker]),
              city: result[:city] ? { id: result[:city].id, name: result[:city].name } : nil,
              date: date_param,
              time_slot: time_slot
            },
            "#{result[:worker].name} is available on #{date_param} at #{time_slot}."
          )
        else
          render_unprocessable([result[:error]])
        end
      end

      private

      def set_city
        city_id = params[:city_id].presence || params[:city].presence
        if city_id.blank? && params[:worker_id].present?
          worker = BookingAvailabilityService.resolve_worker(params[:worker_id])
          @city = worker&.worker_profile&.city || BookingAvailabilityService.resolve_city(worker&.serving_city)
          return if @city.present?
        end

        return render_unprocessable(["city_id parameter is required."]) unless city_id.present?

        @city = BookingAvailabilityService.resolve_city(city_id)
        render_not_found("City not found or not serviceable.") unless @city&.active?
      end
    end
  end
end
