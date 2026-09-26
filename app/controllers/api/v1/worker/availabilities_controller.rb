# frozen_string_literal: true

module Api
  module V1
    module Worker
      # Worker self-service: manage serving city, available days, and duty status.
      class AvailabilitiesController < BaseController
        before_action :require_worker!

        # GET /api/v1/worker/availability
        def show
          wp = current_api_user.worker_profile

          render_success(
            availability_payload(wp),
            "Availability schedule retrieved successfully."
          )
        end

        # PATCH/PUT /api/v1/worker/availability
        def update
          p = availability_params
          wp = current_api_user.worker_profile || current_api_user.build_worker_profile

          if p.key?(:available_days)
            wp.available_days = Array(p[:available_days]).map(&:to_s).reject(&:blank?)
          end

          if p.key?(:is_available)
            wp.is_available = ActiveRecord::Type::Boolean.new.cast(p[:is_available])
          end

          if p[:time_slot].present?
            wp.time_slot = p[:time_slot]
          end

          if p[:city_id].present?
            city_record = City.find_by(id: p[:city_id])
            wp.city = city_record if city_record.present?
          elsif p[:city].present?
            city_record = City.find_by("LOWER(name) = ?", p[:city].to_s.strip.downcase)
            wp.city = city_record if city_record.present?
          end

          wp.save!

          city_name = wp.city&.name || p[:city].presence
          if city_name.present?
            addr = current_api_user.default_address || current_api_user.addresses.build(label: "Operating City", line1: "Operational Area", is_default: true)
            addr.city = city_name
            addr.city_id = wp.city_id if wp.city_id.present?
            addr.line1 = "Operational Area" if addr.line1.blank?
            addr.save!
          end

          wp.reload
          current_api_user.reload

          render_success(
            availability_payload(wp),
            "Availability schedule updated successfully."
          )
        rescue ActiveRecord::RecordInvalid => e
          render_unprocessable(e.record.errors.full_messages)
        end

        private

        def availability_payload(wp)
          {
            worker_id:        current_api_user.id,
            worker_name:      current_api_user.name,
            serving_city:     current_api_user.serving_city,
            city_id:          wp&.city_id,
            available_days:   current_api_user.available_days,
            available_days_short: wp&.available_days_short || "—",
            time_slot:        current_api_user.time_slot,
            is_available:     wp&.is_available.nil? ? true : wp.is_available,
            available_today:  current_api_user.available_today?,
            today:            Time.current.strftime("%A"),
            all_days_options: WorkerProfile::DAYS_OF_WEEK
          }
        end

        def availability_params
          params.require(:availability).permit(
            :is_available, :time_slot, :city, :city_id, available_days: []
          )
        rescue ActionController::ParameterMissing
          params.permit(
            :is_available, :time_slot, :city, :city_id, available_days: []
          )
        end
      end
    end
  end
end
