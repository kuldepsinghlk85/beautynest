# frozen_string_literal: true

class ApplicationController < ActionController::Base
  helper_method :current_user, :current_admin, :current_worker, :current_customer,
                :current_admin_email, :admin_logged_in?, :worker_logged_in?, :customer_logged_in?, :user_logged_in?,
                :site_name, :current_cart, :current_locale, :hindi?, :english?

  protect_from_forgery with: :exception, unless: -> { request.options? || request.format.json? || request.headers["Accept"]&.include?("application/json") }
  skip_before_action :verify_authenticity_token, if: -> { request.options? || request.format.json? || request.headers["Accept"]&.include?("application/json") }, raise: false
  before_action :set_locale
  before_action :set_cors_headers

  def switch_locale
    requested_locale = params[:locale].to_s.strip.to_sym
    if I18n.available_locales.include?(requested_locale)
      session[:locale] = requested_locale
      I18n.locale = requested_locale
    end
    redirect_back fallback_location: root_path
  end

  def current_locale
    I18n.locale
  end

  def hindi?
    I18n.locale == :hi
  end

  def english?
    I18n.locale == :en
  end

  def cors_preflight_check
    set_cors_headers
    head :no_content
  end

  def set_cors_headers
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, PATCH, DELETE, OPTIONS, HEAD"
    response.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization, X-Requested-With, Accept, Origin"
  end

  def site_name
    Setting.site_name
  end

  private

  def set_locale
    loc = params[:locale].presence || session[:locale].presence || I18n.default_locale
    loc_sym = loc.to_s.strip.to_sym
    I18n.locale = I18n.available_locales.include?(loc_sym) ? loc_sym : I18n.default_locale
    session[:locale] = I18n.locale
  end

  def current_admin
    @current_admin ||= User.find_by(id: session[:admin_user_id] || (session[:user_id] if session[:customer_user_id].blank?), status: "active", role: %w[admin worker]) if (session[:admin_user_id] || session[:user_id]).present?
  end

  def current_customer
    return @current_customer if defined?(@current_customer) && @current_customer.present?

    if session[:customer_user_id].present?
      @current_customer = User.find_by(id: session[:customer_user_id], status: "active", role: "customer")
    elsif session[:user_id].present? && session[:admin_user_id].blank?
      u = User.find_by(id: session[:user_id], status: "active")
      @current_customer = u if u&.customer?
    else
      @current_customer = nil
    end
    @current_customer
  end

  def current_worker
    current_admin if current_admin&.worker?
  end

  def current_user
    if request.path.start_with?("/admin") || (self.class.respond_to?(:module_parent_name) && self.class.module_parent_name == "Admin")
      current_admin
    elsif request.path.start_with?("/customer") || (self.class.respond_to?(:module_parent_name) && self.class.module_parent_name == "Customer")
      current_customer
    else
      current_customer || current_admin
    end
  end

  def current_admin_email
    current_admin&.email
  end

  def user_logged_in?
    current_user.present?
  end

  def admin_logged_in?
    current_admin.present? && current_admin.admin?
  end

  def worker_logged_in?
    current_admin.present? && current_admin.worker?
  end

  def customer_logged_in?
    current_customer.present? && current_customer.customer?
  end

  def current_cart
    return @current_cart if @current_cart.present?

    if current_customer.present?
      @current_cart = current_customer.active_cart
      if session[:cart_id].present? && session[:cart_id] != @current_cart.id
        guest_cart = Cart.find_by(id: session[:cart_id])
        if guest_cart && guest_cart.user_id.nil?
          guest_cart.cart_items.each do |item|
            existing = @current_cart.cart_items.find_by(service_id: item.service_id)
            if existing
              existing.update(quantity: existing.quantity + item.quantity)
            else
              @current_cart.cart_items.create(
                service_id: item.service_id,
                quantity: item.quantity,
                booking_date: item.booking_date,
                time_slot: item.time_slot,
                worker_id: item.worker_id,
                city_id: item.city_id,
                scheduled_at: item.scheduled_at
              )
            end
          end
          @current_cart.update(
            worker_id: @current_cart.worker_id.presence || guest_cart.worker_id,
            city_id: @current_cart.city_id.presence || guest_cart.city_id,
            booking_date: @current_cart.booking_date.presence || guest_cart.booking_date,
            time_slot: @current_cart.time_slot.presence || guest_cart.time_slot,
            coupon_id: @current_cart.coupon_id.presence || guest_cart.coupon_id
          )
          @current_cart.cart_items.reload
          guest_cart.destroy
          session.delete(:cart_id)
        end
      end
    elsif session[:cart_id].present?
      @current_cart = Cart.find_by(id: session[:cart_id])
    end

    @current_cart ||= Cart.create!
    session[:cart_id] = @current_cart.id
    @current_cart
  end

  def require_login
    if current_admin.blank?
      flash[:alert] = "You must be signed in as administrator or staff to access this area."
      redirect_to login_path(role: "admin")
    end
  end

  def require_customer_login
    if current_customer.blank?
      session[:return_to] = request.get? ? request.fullpath : checkout_page_path
      flash[:alert] = if request.path.start_with?("/checkout")
                        "Please sign in or create an account to proceed with your booking."
                      else
                        "Please sign in to access your profile and bookings."
                      end
      redirect_to login_path(role: "customer")
    end
  end
end

