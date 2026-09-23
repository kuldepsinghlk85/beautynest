# frozen_string_literal: true

require "pundit"

module Admin
  class BaseController < ApplicationController
    include Pundit::Authorization

    before_action :require_login

    after_action :verify_authorized, except: :index
    after_action :verify_policy_scoped, only: :index

    rescue_from ActiveRecord::RecordNotFound, with: :record_not_found
    rescue_from Pundit::NotAuthorizedError, with: :pundit_not_authorized

    layout "application"

    private

    def pundit_user
      current_user
    end

    def record_not_found
      if request.format.json?
        render json: { status: "error", message: "Record not found." }, status: :not_found
      else
        redirect_back fallback_location: admin_dashboard_path, alert: "The requested record was not found or has already been deleted."
      end
    end

    def pundit_not_authorized
      if request.format.json?
        render json: { status: "error", message: "You are not authorized to perform this action." }, status: :forbidden
      else
        redirect_to admin_dashboard_path, alert: "You are not authorized to perform this action."
      end
    end

    def paginate(scope, per_page: 10)
      per = [params[:per_page].presence&.to_i || per_page, 1].max
      page_num = [params[:page].presence&.to_i || 1, 1].max

      paginated = if scope.respond_to?(:page)
                    scope.page(page_num).per(per)
                  else
                    Kaminari.paginate_array(scope.to_a).page(page_num).per(per)
                  end

      @pagination = paginated
      paginated
    end
  end
end
