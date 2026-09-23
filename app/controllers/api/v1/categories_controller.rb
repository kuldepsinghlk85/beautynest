# frozen_string_literal: true

module Api
  module V1
    class CategoriesController < BaseController
      include ServiceBrowseable
      skip_before_action :authenticate_api_user!, only: %i[index show], raise: false
      skip_before_action :require_customer!, only: %i[index show], raise: false
      before_action :set_category, only: :show

      # GET /api/v1/categories
      def index
        include_subs = params[:include_subcategories] == "true" || params[:include_subs] == "true"
        city_param = params[:city_id].presence || params[:city].presence

        categories = Category.active.ordered.includes(image_attachment: :blob)
        if include_subs
          categories = categories.includes(
            subcategories: [
              :category,
              { services: [:subcategory, :service_city_prices, image_attachment: :blob] }
            ]
          )
        end

        render json: {
          status: "success",
          data: categories.map { |c| serialize_category(c, include_subs: include_subs, include_services: include_subs, city: city_param) }
        }
      end

      # GET /api/v1/categories/:id
      def show
        subcategories = @category.subcategories.active.ordered
        services = apply_service_filters(@category.services.active)
                     .includes(subcategory: :category, image_attachment: :blob)

        city_param = params[:city_id].presence || params[:city].presence

        render json: {
          status: "success",
          data: {
            **serialize_category(@category, include_subs: false),
            subcategories:  subcategories.map { |sub| sub.as_json_api(include_services: false, city: city_param) },
            sub_categories: subcategories.map { |sub| sub.as_json_api(include_services: false, city: city_param) },
            services:       services.map { |s| s.as_json_api(city: city_param) }
          }
        }
      end

      private

      def set_category
        @category = Category.friendly.find(params[:id])
        return render_not_found("Category not found.") unless @category.active?
      rescue ActiveRecord::RecordNotFound
        render_not_found("Category not found.")
      end

      def serialize_category(cat, include_subs: false, include_services: true, city: nil)
        h = {
          id:            cat.id,
          name:          cat.name,
          slug:          cat.slug,
          description:   cat.description,
          image_url:     cat.image_url,
          featured:      cat.featured,
          position:      cat.position,
          service_count: cat.service_count
        }
        if include_subs
          subs = cat.subcategories.active.ordered.map do |sub|
            sub.as_json_api(include_services: include_services, city: city)
          end
          h[:subcategories]  = subs
          h[:sub_categories] = subs
        end
        h
      end
    end
  end
end
