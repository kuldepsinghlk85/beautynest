# frozen_string_literal: true

module Api
  module V1
    class ServicesController < BaseController
      include ServiceBrowseable
      skip_before_action :authenticate_api_user!, only: %i[index show search], raise: false
      skip_before_action :require_customer!, only: %i[index show search], raise: false
      before_action :set_service, only: :show

      # GET /api/v1/services OR GET /api/v1/categories/:category_id/services
      # Supports: ?category_id, ?subcategory_id, ?city_id, ?city, ?featured, ?min_price, ?max_price, ?search, ?q, ?sort
      def index
        city_param = params[:city_id].presence || params[:city].presence
        services = apply_service_filters(Service.active)
                     .includes(:reviews, :service_city_prices, subcategory: :category, image_attachment: :blob)

        render json: {
          status: "success",
          data:   services.map { |s| s.as_json_api(city: city_param) }
        }
      end

      # GET /api/v1/services/search OR GET /api/v1/search
      # Debounced live search endpoint for mobile & web search bars.
      # Query params:
      #   - q or query: search keyword (matches service name, description, tags, category, subcategory)
      #   - city_id or city: for city-specific pricing
      #   - category_id: optional category filter
      #   - subcategory_id: optional subcategory filter
      #   - limit: maximum results (default: 20, max: 50)
      #   - popular: when q is blank, if true returns featured services
      def search
        query = (params[:q].presence || params[:query].presence || params[:search].presence).to_s.strip
        city_param = params[:city_id].presence || params[:city].presence
        limit = [(params[:limit].presence || 20).to_i, 1].max
        limit = 50 if limit > 50

        if query.blank?
          if params[:popular] == "true" || params[:featured] == "true"
            services = Service.active.featured
                              .includes(:reviews, :service_city_prices, subcategory: :category, image_attachment: :blob)
                              .limit(limit)
            return render json: {
              status: "success",
              query: "",
              total_results: services.size,
              data: services.map { |s| s.as_json_api(city: city_param) }
            }
          else
            return render json: {
              status: "success",
              query: "",
              total_results: 0,
              data: []
            }
          end
        end

        kw = "%#{query}%"
        scope = Service.active
                       .joins(:subcategory)
                       .joins("LEFT JOIN categories ON categories.id = subcategories.category_id")
                       .where(
                         "services.name ILIKE :kw OR services.description ILIKE :kw OR services.tag ILIKE :kw OR subcategories.name ILIKE :kw OR categories.name ILIKE :kw",
                         kw: kw
                       )

        if params[:category_id].present?
          cat = Category.friendly.find_by(id: params[:category_id]) || Category.friendly.find_by(slug: params[:category_id])
          scope = scope.where(subcategories: { category_id: cat ? cat.id : params[:category_id] })
        end

        if params[:subcategory_id].present?
          sub = Subcategory.friendly.find_by(id: params[:subcategory_id]) || Subcategory.friendly.find_by(slug: params[:subcategory_id])
          scope = scope.where(subcategory_id: sub ? sub.id : params[:subcategory_id])
        end

        total_count = scope.count

        quoted_prefix = ActiveRecord::Base.connection.quote(query + "%")
        services = scope.includes(:reviews, :service_city_prices, subcategory: :category, image_attachment: :blob)
                        .order(
                          Arel.sql("CASE WHEN services.name ILIKE #{quoted_prefix} THEN 0 ELSE 1 END"),
                          :position,
                          :name
                        )
                        .limit(limit)

        render json: {
          status: "success",
          query: query,
          total_results: total_count,
          data: services.map { |s| s.as_json_api(city: city_param) }
        }
      end

      # GET /api/v1/services/:id
      def show
        city_param = params[:city_id].presence || params[:city].presence
        render json: {
          status: "success",
          data:   @service.as_json_api(city: city_param, include_details: true)
        }
      end

      private

      def set_service
        @service = Service.friendly.find(params[:id])
        return render_not_found("Service not found.") unless @service.active?
      rescue ActiveRecord::RecordNotFound
        render_not_found("Service not found.")
      end
    end
  end
end
