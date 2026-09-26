# frozen_string_literal: true

class SessionsController < ApplicationController
  layout "login"

  # Prevent caching of login pages to avoid stale CSRF tokens
  after_action :set_no_cache_headers, only: %i[new create]

  # Handle stale CSRF tokens gracefully per Control Panel pattern
  rescue_from ActionController::InvalidAuthenticityToken, with: :handle_csrf_error

  def new
    if params[:role] == "customer"
      redirect_to(session.delete(:return_to) || root_path) and return if customer_logged_in?
    elsif params[:role] == "admin"
      redirect_to admin_dashboard_path and return if admin_logged_in?
    elsif admin_logged_in? && !customer_logged_in?
      # If navigating directly to /login without customer intent while admin
      redirect_to admin_dashboard_path and return
    elsif customer_logged_in?
      redirect_to root_path and return
    end
  end

  def dev_auth_admin
    return head :forbidden unless Rails.env.development?
    admin = User.find_by(role: "admin")
    session[:user_id] = admin.id
    session[:admin_user_id] = admin.id
    redirect_to(params[:return_to].presence || admin_dashboard_path)
  end

  def demo_customer_login
    customer = User.customers.active.first || User.customers.first
    unless customer
      flash[:alert] = "No active customer found."
      return redirect_to root_path
    end

    session[:customer_user_id] = customer.id
    session[:user_id] = customer.id unless admin_logged_in?
    @current_customer = customer
    current_cart
    flash[:notice] = "Now operating storefront as Customer: #{customer.name} (#{customer.phone}). Your Admin session remains active in the Admin Panel."
    redirect_to(params[:return_to].presence || root_path)
  end

  def create
    email = params[:email].to_s.strip.downcase
    password = params[:password].to_s

    if email.blank? || password.blank?
      flash.now[:alert] = "Please enter your email and password."
      render :new, status: :unprocessable_entity
      return
    end

    user = User.find_by("LOWER(email) = ?", email)

    unless user&.authenticate(password)
      flash.now[:alert] = "Invalid email or password."
      render :new, status: :unprocessable_entity
      return
    end

    unless user.active?
      flash.now[:alert] = "Your account is inactive. Please contact support."
      render :new, status: :forbidden
      return
    end

    return_to = session[:return_to]
    guest_cart_id = session[:cart_id]

    if user.customer?
      # Customer role: preserve admin session if already signed in
      session[:customer_user_id] = user.id
      session[:user_id] = user.id unless admin_logged_in?
      session[:cart_id] = guest_cart_id if guest_cart_id.present?
      @current_customer = user
      @current_cart = nil
      current_cart
      redirect_to(return_to.presence || root_path, notice: "Welcome back, #{user.name}!")
    else
      # Admin or Worker role
      session[:admin_user_id] = user.id
      session[:user_id] = user.id
      @current_admin = user
      if user.admin?
        redirect_to admin_dashboard_path, notice: "Signed in as Administrator."
      elsif user.worker?
        redirect_to admin_dashboard_path, notice: "Signed in to Worker Portal."
      end
    end
  end

  def destroy
    if params[:role] == "customer"
      session.delete(:customer_user_id)
      session.delete(:cart_id)
      @current_customer = nil
      @current_cart = nil
      redirect_to root_path, notice: "Signed out of customer account."
    elsif params[:role] == "admin"
      session.delete(:admin_user_id)
      session.delete(:user_id) if session[:user_id] == current_admin&.id
      @current_admin = nil
      redirect_to login_path, notice: "Signed out of Admin Panel."
    else
      if request.referer&.include?("/admin") || request.path.start_with?("/admin")
        session.delete(:admin_user_id)
        session.delete(:user_id) if session[:user_id] == current_admin&.id
        @current_admin = nil
        redirect_to login_path, notice: "Signed out of Admin Panel."
      elsif session[:customer_user_id].present?
        session.delete(:customer_user_id)
        session.delete(:cart_id)
        @current_customer = nil
        @current_cart = nil
        redirect_to root_path, notice: "Signed out of customer account."
      else
        reset_session
        redirect_to root_path, notice: "Signed out successfully."
      end
    end
  end

  private

  def set_no_cache_headers
    response.headers["Cache-Control"] = "no-cache, no-store, max-age=0, must-revalidate"
    response.headers["Pragma"] = "no-cache"
    response.headers["Expires"] = "Fri, 01 Jan 1990 00:00:00 GMT"
  end

  def handle_csrf_error
    Rails.logger.warn("[CSRF] Session expired - redirecting to fresh login page")
    flash[:alert] = "Your session has expired. Please try again."
    redirect_to login_path
  end
end
