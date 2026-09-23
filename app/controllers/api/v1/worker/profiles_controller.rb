# frozen_string_literal: true

module Api
  module V1
    module Worker
      # Worker profile: read own profile + aggregate earning stats.
      class ProfilesController < BaseController
        before_action :require_worker!

        # GET /api/v1/worker/profile
        def show
          completed = current_api_user.worker_bookings.where(service_status: "completed")
          wp = current_api_user.worker_profile

          profile_data = current_api_user.as_json_api.merge(
            bio: wp&.bio,
            experience_years: wp&.experience_years || 0,
            city_id: wp&.city_id,
            serving_city: current_api_user.serving_city,
            available_days: current_api_user.available_days,
            time_slot: current_api_user.time_slot,
            is_available: wp&.is_available.nil? ? true : wp.is_available,
            available_today: current_api_user.available_today?,
            rating_avg: wp&.rating_avg&.to_f || 0.0,
            rating_count: wp&.rating_count || 0
          )

          render_success(
            profile_data.merge(
              profile: profile_data,
              user: profile_data,
              stats: {
                total_bookings: current_api_user.worker_bookings.count,
                completed_bookings: completed.count,
                total_earnings: completed.sum(:total_amount).to_f
              }
            ),
            "Profile retrieved successfully."
          )
        end

        # PATCH /api/v1/worker/profile
        def update
          p = profile_params
          user_attrs = p.slice(:name, :phone)
          profile_attrs = p.slice(:bio, :is_available, :experience_years, :time_slot)

          # Avatar file upload / removal / direct URL update
          pic = p[:avatar].presence ||
                p[:image].presence ||
                p[:profile_pic].presence ||
                p[:file].presence ||
                params[:avatar].presence ||
                params[:image].presence ||
                params[:profile_pic].presence ||
                params[:file].presence ||
                p[:avatar_url].presence ||
                params[:avatar_url].presence

          remove = params[:remove_image] == "1" || params[:remove_avatar] == "1" || p[:remove_image] == "1" || p[:remove_avatar] == "1"

          if pic.present? || remove
            current_api_user.handle_avatar_upload(pic, folder: "beauty_connect/avatars", remove: remove)
          end

          if user_attrs.present? && !current_api_user.update(user_attrs)
            return render_unprocessable(current_api_user.errors.full_messages)
          end

          wp = current_api_user.worker_profile || current_api_user.build_worker_profile

          if p.key?(:available_days)
            profile_attrs[:available_days] = Array(p[:available_days]).map(&:to_s).reject(&:blank?)
          end

          if p[:city_id].present?
            city_record = City.find_by(id: p[:city_id])
            profile_attrs[:city] = city_record if city_record.present?
          elsif p[:city].present?
            city_record = City.find_by("LOWER(name) = ?", p[:city].to_s.strip.downcase)
            profile_attrs[:city] = city_record if city_record.present?
          end

          if profile_attrs.present?
            wp.assign_attributes(profile_attrs)
            wp.save!
          end

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

          profile_data = current_api_user.as_json_api.merge(
            bio: wp.bio,
            experience_years: wp.experience_years || 0,
            city_id: wp.city_id,
            serving_city: current_api_user.serving_city,
            available_days: current_api_user.available_days,
            time_slot: current_api_user.time_slot,
            is_available: wp.is_available,
            available_today: current_api_user.available_today?,
            rating_avg: wp.rating_avg&.to_f || 0.0,
            rating_count: wp.rating_count || 0
          )

          render_success(profile_data, "Profile updated successfully.")
        rescue ActiveRecord::RecordInvalid => e
          render_unprocessable(e.record.errors.full_messages)
        end

        private

        ALLOWED_PROFILE_FIELDS = [
          :name, :phone, :avatar_url, :avatar, :image, :profile_pic, :file, :remove_avatar, :remove_image,
          :bio, :is_available, :experience_years,
          :city, :city_id, :time_slot, available_days: []
        ].freeze

        def profile_params
          if params[:profile].is_a?(ActionController::Parameters) || params[:profile].is_a?(Hash)
            params.require(:profile).permit(ALLOWED_PROFILE_FIELDS)
          elsif params[:worker].is_a?(ActionController::Parameters) || params[:worker].is_a?(Hash)
            params.require(:worker).permit(ALLOWED_PROFILE_FIELDS)
          elsif params[:user].is_a?(ActionController::Parameters) || params[:user].is_a?(Hash)
            params.require(:user).permit(ALLOWED_PROFILE_FIELDS)
          else
            params.permit(ALLOWED_PROFILE_FIELDS)
          end
        end
      end
    end
  end
end
