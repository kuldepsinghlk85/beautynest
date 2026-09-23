# frozen_string_literal: true

module Api
  module V1
    class SubcategoriesController < BaseController
      skip_before_action :authenticate_api_user!, only: %i[index show], raise: false
      skip_before_action :require_customer!, only: %i[index show], raise: false
      before_action :set_subcategory, only: :show

      # GET /api/v1/subcategories
      def index
        city_param = params[:city_id].presence || params[:city].presence
        include_services = params[:include_services] != "false"

        scope = Subcategory.active.ordered
                           .includes(:category, services: [:subcategory, :service_city_prices, image_attachment: :blob])

        if params[:category_id].present?
          cat = Category.friendly.find_by(id: params[:category_id]) || Category.friendly.find_by(slug: params[:category_id])
          scope = scope.where(category_id: cat ? cat.id : params[:category_id])
        end

        render json: {
          status: "success",
          data:   scope.map { |sub| sub.as_json_api(include_services: include_services, city: city_param) }
        }
      end

      # GET /api/v1/subcategories/:id
      def show
        city_param = params[:city_id].presence || params[:city].presence
        include_services = params[:include_services] != "false"

        render json: {
          status: "success",
          data:   @subcategory.as_json_api(include_services: include_services, city: city_param)
        }
      end

      private

      def set_subcategory
        @subcategory = Subcategory.friendly.find(params[:id])
        return render_not_found("Subcategory not found.") unless @subcategory.active?
      rescue ActiveRecord::RecordNotFound
        render_not_found("Subcategory not found.")
      end
    end
  end
end
