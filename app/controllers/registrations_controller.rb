# frozen_string_literal: true

class RegistrationsController < ApplicationController
  layout "login"

  def new
    if customer_logged_in?
      redirect_to root_path and return
    end

    @user = User.new
  end

  def create
    @user = User.new(registration_params)
    @user.role = "customer"
    @user.status = "active"

    if @user.save
      return_to = session[:return_to]
      guest_cart_id = session[:cart_id]

      session[:customer_user_id] = @user.id
      session[:user_id] = @user.id unless admin_logged_in?
      session[:cart_id] = guest_cart_id if guest_cart_id.present?
      @current_customer = @user
      @current_cart = nil

      # Automatically initialize or merge cart for the new customer
      current_cart

      AuditLogger.log(
        actor: @user,
        action: "create",
        record: @user,
        auditable_type: "CustomerRegistration",
        record_name: "Customer Registered: #{@user.name}",
        metadata: {
          email: @user.email,
          phone: @user.phone,
          role: "customer"
        },
        request: request
      )

      target_path = return_to.presence || root_path
      redirect_to target_path, notice: "Welcome to #{Setting.site_name}, #{@user.name}! Your account has been created."
    else
      render :new, status: :unprocessable_entity
    end
  end

  private

  def registration_params
    params.require(:user).permit(:name, :email, :phone, :password, :password_confirmation)
  end
end
