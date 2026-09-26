# frozen_string_literal: true

module Admin
  class CitiesController < BaseController
    before_action :set_city, only: %i[show edit update destroy]

    # GET /admin/cities
    def index
      authorize City
      scope = policy_scope(City)
                .includes(:service_city_prices)
                .then { |s| apply_filters(s) }
                .ordered
      @cities = paginate(scope, per_page: 10)
    end

    # GET /admin/cities/:id
    def show
      @service_city_prices = @city.service_city_prices
                                  .includes(:service)
                                  .order(created_at: :desc)
    end

    # GET /admin/cities/new
    def new
      @city = City.new
      authorize @city
      load_available_services
    end

    # POST /admin/cities
    def create
      @city = City.new(city_params)
      authorize @city

      if @city.save
        AuditLogger.log(
          actor: current_user,
          action: "create",
          record: @city,
          auditable_type: "City",
          record_name: "City #{@city.name}",
          changes: @city.saved_changes,
          request: request
        )
        overrides_count = @city.service_city_prices.count
        msg = "City '#{@city.name}' created successfully."
        msg += " #{overrides_count} price override(s) configured." if overrides_count.positive?
        redirect_to admin_city_path(@city), notice: msg
      else
        load_available_services
        render :new, status: :unprocessable_entity
      end
    end

    # GET /admin/cities/:id/edit
    def edit
      @service_city_prices = @city.service_city_prices.includes(:service).order(created_at: :asc)
      load_available_services
    end

    # PATCH /admin/cities/:id
    def update
      if @city.update(city_params)
        AuditLogger.log(
          actor: current_user,
          action: "update",
          record: @city,
          auditable_type: "City",
          record_name: "City #{@city.name}",
          changes: @city.saved_changes,
          request: request
        )
        redirect_to admin_city_path(@city), notice: "City '#{@city.name}' updated successfully."
      else
        @service_city_prices = @city.service_city_prices.includes(:service).order(created_at: :asc)
        load_available_services
        render :edit, status: :unprocessable_entity
      end
    end

    # DELETE /admin/cities/:id
    def destroy
      name = @city.name
      AuditLogger.log(
        actor: current_user,
        action: "destroy",
        record: @city,
        auditable_type: "City",
        record_name: "City #{name}",
        request: request
      )
      @city.destroy!
      redirect_to admin_cities_path, notice: "City '#{name}' deleted successfully."
    rescue ActiveRecord::RecordNotDestroyed => e
      redirect_to admin_city_path(@city), alert: "Could not delete city: #{e.record.errors.full_messages.to_sentence}"
    end

    private

    def set_city
      @city = City.friendly.find(params[:id])
      authorize @city
    end

    def city_params
      params.require(:city).permit(
        :name, :state, :status,
        service_city_prices_attributes: %i[
          id service_id base_price discount_price status _destroy
        ]
      )
    end

    def load_available_services
      @available_services = Service.active.ordered.includes(:subcategory)
    end

    def apply_filters(scope)
      scope = scope.where(status: params[:status]) if params[:status].present?
      if params[:search].present?
        kw = "%#{params[:search]}%"
        scope = scope.where("cities.name ILIKE ? OR cities.state ILIKE ?", kw, kw)
      end
      scope
    end
  end
end
