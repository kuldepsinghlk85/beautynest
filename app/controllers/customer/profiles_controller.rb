# frozen_string_literal: true

module Customer
  class ProfilesController < BaseController
    before_action :set_user
    before_action :set_metrics

    # GET /profile
    def show
      @addresses = @user.addresses.order(is_default: :desc, created_at: :desc)
      @active_tab = params[:tab].presence || "profile"
      @available_coupons = Coupon.valid_now.limit(4)
      @cities = City.active.ordered
      @new_address = Address.new
    end

    # PATCH /profile
    def update
      avatar_file   = params.dig(:user, :avatar) || params[:avatar]
      remove_avatar = params.dig(:user, :remove_avatar) == "1" || params[:remove_avatar] == "1"

      if @user.update(profile_params)
        if avatar_file.present? || remove_avatar
          @user.handle_avatar_upload(avatar_file, folder: "beauty_connect/avatars", remove: remove_avatar)
        end
        flash[:notice] = "Your profile has been updated successfully."
        redirect_to customer_profile_path(tab: "profile")
      else
        flash.now[:alert] = @user.errors.full_messages.to_sentence
        @active_tab = "profile"
        @addresses = @user.addresses.order(is_default: :desc, created_at: :desc)
        @available_coupons = Coupon.valid_now.limit(4)
        @cities = City.active.ordered
        @new_address = Address.new
        render :show, status: :unprocessable_entity
      end
    end

    # PATCH /profile/password
    def update_password
      current_password = params[:current_password].to_s
      new_password     = params[:new_password].to_s
      new_confirmation = params[:password_confirmation].to_s

      if current_password.blank? || new_password.blank?
        flash[:alert] = "Please provide your current password and a new password."
        return redirect_to customer_profile_path(tab: "security")
      end

      unless @user.authenticate(current_password)
        flash[:alert] = "Your current password does not match our records."
        return redirect_to customer_profile_path(tab: "security")
      end

      if new_password.length < 6
        flash[:alert] = "New password must be at least 6 characters long."
        return redirect_to customer_profile_path(tab: "security")
      end

      if new_password != new_confirmation
        flash[:alert] = "New password and confirmation do not match."
        return redirect_to customer_profile_path(tab: "security")
      end

      if @user.update(password: new_password, password_confirmation: new_confirmation)
        flash[:notice] = "Password changed successfully."
        redirect_to customer_profile_path(tab: "security")
      else
        flash[:alert] = @user.errors.full_messages.to_sentence
        redirect_to customer_profile_path(tab: "security")
      end
    end

    # POST /profile/addresses
    def create_address
      @address = @user.addresses.build(address_params)
      city_record = City.find_by("LOWER(name) = ?", @address.city.to_s.strip.downcase)
      @address.city_record = city_record if city_record.present?

      # If this is the user's first address, make it default automatically
      @address.is_default = true if @user.addresses.count.zero?

      if @address.save
        flash[:notice] = "New address '#{@address.display_label}' saved successfully."
      else
        flash[:alert] = @address.errors.full_messages.to_sentence
      end
      redirect_to customer_profile_path(tab: "addresses")
    end

    # PATCH /profile/addresses/:id
    def update_address
      @address = @user.addresses.find_by(id: params[:id])
      if @address.blank?
        flash[:alert] = "Address not found."
        return redirect_to customer_profile_path(tab: "addresses")
      end

      if @address.update(address_params)
        flash[:notice] = "Address updated successfully."
      else
        flash[:alert] = @address.errors.full_messages.to_sentence
      end
      redirect_to customer_profile_path(tab: "addresses")
    end

    # DELETE /profile/addresses/:id
    def destroy_address
      @address = @user.addresses.find_by(id: params[:id])
      if @address
        label = @address.display_label
        was_default = @address.is_default?
        @address.destroy
        # If default was destroyed, pick another address as default if one exists
        if was_default
          @user.addresses.order(created_at: :desc).first&.update(is_default: true)
        end
        flash[:notice] = "Address '#{label}' deleted successfully."
      else
        flash[:alert] = "Address not found."
      end
      redirect_to customer_profile_path(tab: "addresses")
    end

    # PATCH /profile/addresses/:id/default
    def set_default_address
      @address = @user.addresses.find_by(id: params[:id])
      if @address
        @address.update!(is_default: true)
        flash[:notice] = "'#{@address.display_label}' is now your default address."
      else
        flash[:alert] = "Address not found."
      end
      redirect_to customer_profile_path(tab: "addresses")
    end

    private

    def set_user
      @user = current_customer_user
    end

    def set_metrics
      all_bookings = @user.customer_bookings
      @total_bookings_count = all_bookings.count
      @active_bookings_count = all_bookings.where.not(booking_status: %w[completed cancelled rejected]).count
      @completed_bookings_count = all_bookings.where(booking_status: "completed").count
    end

    def profile_params
      params.require(:user).permit(:name, :email, :phone, :avatar_url)
    end

    def address_params
      params.require(:address).permit(:label, :line1, :line2, :city, :state, :pincode, :is_default)
    end
  end
end
