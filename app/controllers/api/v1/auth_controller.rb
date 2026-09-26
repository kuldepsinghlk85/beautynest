# frozen_string_literal: true

module Api
  module V1
    class AuthController < BaseController
      skip_before_action :authenticate_api_user!, only: %i[register login refresh]

      # POST /api/v1/auth/register
      def register
        user = User.new(registration_params)
        # Enforce server-side role assignment: public registration is strictly customer
        user.role = "customer"
        user.status = "active"

        if user.save
          access_token, refresh_token = issue_tokens_for(user)
          set_refresh_cookie(refresh_token)
          render_item(
            { token: access_token, user: user.as_json_api },
            message: "Registration successful.",
            status: :created
          )
        else
          render_unprocessable(user.errors.full_messages, "Registration failed.")
        end
      end

      # POST /api/v1/auth/login
      def login
        email = (params[:email].presence || params.dig(:user, :email)).to_s.strip.downcase
        password = (params[:password].presence || params.dig(:user, :password)).to_s

        if email.blank? || password.blank?
          render_unauthorized("Email and password are required.")
          return
        end

        user = User.find_by("LOWER(email) = ?", email)

        unless user&.authenticate(password)
          render_unauthorized("Invalid email or password.")
          return
        end

        unless user.active?
          render_forbidden("Your account is inactive. Please contact support.")
          return
        end

        access_token, refresh_token = issue_tokens_for(user)
        set_refresh_cookie(refresh_token)
        render_item(
          { token: access_token, user: user.as_json_api },
          message: "Login successful.",
          status: :ok
        )
      end

      # POST /api/v1/auth/refresh
      def refresh
        token_input = cookies[:refresh_token].presence ||
                      params[:refresh_token].presence ||
                      params[:token].presence ||
                      params.dig(:auth, :refresh_token).presence ||
                      params.dig(:auth, :token).presence ||
                      extract_bearer_token

        if token_input.blank?
          return render_unauthorized("Refresh token is required.")
        end

        begin
          payload = JwtService.decode(token_input, verify_expiration: true)
        rescue JWT::ExpiredSignature
          clear_refresh_cookie
          return render_unauthorized("Refresh token has expired. Please login again.")
        rescue JWT::DecodeError
          clear_refresh_cookie
          return render_unauthorized("Invalid refresh token.")
        end

        user = User.find_by(id: payload[:sub])

        unless user.present?
          clear_refresh_cookie
          return render_unauthorized("User account not found.")
        end

        unless user.active?
          clear_refresh_cookie
          return render_forbidden("Your account is inactive. Please contact support.")
        end

        access_token, new_refresh_token = issue_tokens_for(user)
        set_refresh_cookie(new_refresh_token)

        render_item(
          {
            token: access_token,
            user: user.as_json_api
          },
          message: "Token refreshed successfully.",
          status: :ok
        )
      end

      # DELETE /api/v1/auth/logout
      def logout
        current_session&.revoke!
        clear_refresh_cookie
        render json: {
          status: "success",
          message: "Logged out successfully.",
          request_id: current_request_id
        }, status: :ok
      end

      # GET /api/v1/auth/me
      def me
        render_item(
          { user: current_api_user.as_json_api },
          status: :ok
        )
      end

      # PATCH/PUT /api/v1/auth/profile
      def update_profile
        user = current_api_user

        # 1. Name update
        user.name = profile_params[:name].to_s.strip if profile_params[:name].present?

        # 2. File upload (accepting :avatar or :image or :file)
        pic = profile_params[:avatar].presence ||
              profile_params[:image].presence ||
              profile_params[:profile_pic].presence ||
              profile_params[:file].presence ||
              params[:avatar].presence ||
              params[:image].presence ||
              params[:profile_pic].presence ||
              params[:file].presence ||
              profile_params[:avatar_url].presence

        remove = params[:remove_image] == "1" || params[:remove_avatar] == "1"

        if pic.present? || remove
          user.handle_avatar_upload(pic, folder: "beauty_connect/avatars", remove: remove)
        end

        if profile_params[:name].blank? && pic.blank? && !remove
          return render_unprocessable(["No update attributes provided. Only 'name' and image file ('avatar' or 'image') can be updated."])
        end

        if user.save
          user.reload
          render_item(
            { user: user.as_json_api },
            message: "Profile updated successfully.",
            status: :ok
          )
        else
          render_unprocessable(user.errors.full_messages, "Failed to update profile.")
        end
      end

      # PATCH/PUT /api/v1/profile/password OR /api/v1/auth/password
      def update_password
        user = current_api_user

        old_pwd = (params[:old_password] || params[:current_password] || params.dig(:user, :old_password) || params.dig(:user, :current_password)).to_s
        new_pwd = (params[:new_password] || params[:password] || params.dig(:user, :new_password) || params.dig(:user, :password)).to_s
        new_pwd_conf = (params[:new_password_confirmation] || params[:password_confirmation] || params.dig(:user, :new_password_confirmation) || params.dig(:user, :password_confirmation) || new_pwd).to_s

        if old_pwd.blank?
          return render_unprocessable(["Old password is required."])
        end

        if new_pwd.blank?
          return render_unprocessable(["New password is required."])
        end

        unless user.authenticate(old_pwd)
          return render_unprocessable(["Old password does not match."])
        end

        if new_pwd.length < 6
          return render_unprocessable(["New password must be at least 6 characters long."])
        end

        if new_pwd == old_pwd
          return render_unprocessable(["New password must be different from your old password."])
        end

        if new_pwd != new_pwd_conf
          return render_unprocessable(["New password and confirmation do not match."])
        end

        user.password = new_pwd
        user.password_confirmation = new_pwd_conf

        if user.save
          render json: {
            status: "success",
            message: "Password updated successfully.",
            request_id: current_request_id
          }, status: :ok
        else
          render_unprocessable(user.errors.full_messages, "Failed to update password.")
        end
      end

      private

      def profile_params
        if params[:user].is_a?(ActionController::Parameters) || params[:user].is_a?(Hash)
          params.require(:user).permit(:name, :image, :avatar, :profile_pic, :file, :avatar_url, :remove_image, :remove_avatar)
        elsif params[:profile].is_a?(ActionController::Parameters) || params[:profile].is_a?(Hash)
          params.require(:profile).permit(:name, :image, :avatar, :profile_pic, :file, :avatar_url, :remove_image, :remove_avatar)
        else
          params.permit(:name, :image, :avatar, :profile_pic, :file, :avatar_url, :remove_image, :remove_avatar)
        end
      end

      def registration_params
        params.require(:user).permit(:name, :email, :phone, :password, :password_confirmation)
      rescue ActionController::ParameterMissing
        # Allow flat JSON payload as well
        params.permit(:name, :email, :phone, :password, :password_confirmation)
      end

      def issue_tokens_for(user)
        token_expires_at = JwtService.access_token_expiration.from_now
        session = user.sessions.create!(
          token_digest: "bearer_#{SecureRandom.hex(8)}",
          expires_at: token_expires_at
        )
        access_payload = {
          sub: user.id,
          jti: session.id,
          name: user.name,
          email: user.email,
          role: user.role,
          status: user.status
        }
        access_token = JwtService.encode(access_payload, token_expires_at)
        session.update!(token_digest: Session.digest(access_token))

        refresh_expires_at = JwtService.refresh_token_expiration.from_now
        refresh_payload = {
          sub: user.id,
          jti: session.id,
          role: user.role,
          token_type: "refresh"
        }
        refresh_token = JwtService.encode(refresh_payload, refresh_expires_at)

        [access_token, refresh_token]
      end

      def set_refresh_cookie(token)
        cookies[:refresh_token] = {
          value: token,
          httponly: true,
          secure: Rails.env.production?,
          same_site: :lax,
          expires: JwtService.refresh_token_expiration.from_now,
          path: "/"
        }
      end

      def clear_refresh_cookie
        cookies.delete(:refresh_token, path: "/", secure: Rails.env.production?, same_site: :lax)
      end
    end
  end
end
