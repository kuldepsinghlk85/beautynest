# frozen_string_literal: true

module Api
  module V1
    class CitiesController < BaseController
      skip_before_action :authenticate_api_user!, only: %i[index show], raise: false
      skip_before_action :require_customer!, only: %i[index show], raise: false
      before_action :set_city, only: :show

      # GET /api/v1/cities
      def index
        cities = City.active.ordered

        render json: {
          status: "success",
          data:   cities.map do |c|
            {
              id:    c.id,
              name:  c.name,
              slug:  c.slug,
              state: c.state
            }
          end
        }
      end

      # GET /api/v1/cities/:id
      def show
        render json: {
          status: "success",
          data: {
            id:    @city.id,
            name:  @city.name,
            slug:  @city.slug,
            state: @city.state
          }
        }
      end

      private

      def set_city
        @city = City.friendly.find(params[:id])
        return render_not_found("City not found.") unless @city.active?
      rescue ActiveRecord::RecordNotFound
        render_not_found("City not found.")
      end
    end
  end
end
