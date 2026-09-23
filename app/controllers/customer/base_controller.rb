# frozen_string_literal: true

module Customer
  class BaseController < ApplicationController
    layout "public"
    before_action :require_customer_login

    private

    # Consistent helper for customer controllers
    def current_customer_user
      current_customer || current_user
    end
    helper_method :current_customer_user
  end
end
