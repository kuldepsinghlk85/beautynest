# frozen_string_literal: true

class PasswordsController < ApplicationController
  layout "login"

  before_action :set_user_by_token, only: %i[edit update]
  before_action :ensure_valid_token, only: %i[edit update]

  def new
    # Render forgot password form
  end

  def create
    email = params[:email].to_s.strip.downcase
    user = User.find_by(email: email)

    if user.present? && user.active?
      token = user.generate_password_reset_token!
      reset_url = "#{request.base_url}/reset_password/#{token}"

      ::UserMailer.password_reset(user, reset_url).deliver_later

      AuditLogger.log(
        actor: user,
        action: "update",
        record: user,
        auditable_type: "PasswordResetRequest",
        record_name: "Password reset requested for #{user.email}",
        request: request
      )
    end

    redirect_to login_path, notice: "If an account with that email exists, we have sent password reset instructions to your inbox."
  end

  def edit
    # Form to enter new password
  end

  def update
    password = params[:password].to_s
    password_confirmation = params[:password_confirmation].to_s

    if password.blank? || password.length < 6
      flash.now[:alert] = "Password must be at least 6 characters long."
      render :edit, status: :unprocessable_entity
      return
    end

    if password != password_confirmation
      flash.now[:alert] = "Password and confirmation do not match."
      render :edit, status: :unprocessable_entity
      return
    end

    if @user.update(password: password, password_confirmation: password_confirmation)
      @user.clear_password_reset_token!

      AuditLogger.log(
        actor: @user,
        action: "update",
        record: @user,
        auditable_type: "PasswordResetSuccess",
        record_name: "Password reset completed for #{@user.email}",
        request: request
      )

      redirect_to login_path, notice: "Your password has been reset successfully! Please sign in with your new password."
    else
      flash.now[:alert] = @user.errors.full_messages.to_sentence
      render :edit, status: :unprocessable_entity
    end
  end

  private

  def set_user_by_token
    @user = User.find_by(reset_password_token: params[:token])
  end

  def ensure_valid_token
    return if @user.present? && @user.password_reset_token_valid?

    redirect_to forgot_password_path, alert: "The password reset link is invalid or has expired. Please request a new one."
  end
end
