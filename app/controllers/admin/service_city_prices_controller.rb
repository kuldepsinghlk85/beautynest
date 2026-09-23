# frozen_string_literal: true

module Admin
  class ServiceCityPricesController < BaseController
    before_action :set_service, only: %i[new create]
    before_action :set_service_city_price, only: %i[edit update destroy]

    # GET /admin/service_city_prices
    def index
      authorize ServiceCityPrice
      @service_city_prices = policy_scope(ServiceCityPrice).includes(:service, :city).order(created_at: :desc)
      redirect_to admin_cities_path
    end

    # GET /admin/service_city_prices/new
    def new
      @service_city_price = ServiceCityPrice.new(
        service: @service,
        city_id: params[:city_id],
        base_price: @service&.base_price,
        discount_price: @service&.discount_price
      )
      authorize @service_city_price
      load_form_options
    end

    # POST /admin/services/:service_id/city_prices OR POST /admin/service_city_prices
    def create
      @service_city_price = ServiceCityPrice.new(service_city_price_params)
      @service_city_price.service = @service if @service && @service_city_price.service_id.blank?
      authorize @service_city_price

      if @service_city_price.save
        redirect_to admin_service_path(@service_city_price.service), notice: "Price override for '#{@service_city_price.city.name}' saved."
      else
        @service ||= @service_city_price.service
        load_form_options
        render :new, status: :unprocessable_entity
      end
    end

    # GET /admin/service_city_prices/:id/edit
    def edit
      @service = @service_city_price.service
      load_form_options
    end

    # PATCH /admin/service_city_prices/:id
    def update
      if @service_city_price.update(service_city_price_params)
        redirect_to admin_service_path(@service_city_price.service), notice: "Price override for '#{@service_city_price.city.name}' updated."
      else
        @service = @service_city_price.service
        load_form_options
        render :edit, status: :unprocessable_entity
      end
    end

    # DELETE /admin/service_city_prices/:id
    def destroy
      service = @service_city_price.service
      city_name = @service_city_price.city.name
      @service_city_price.destroy!
      destination = params[:return_to].presence || admin_service_path(service)
      redirect_to destination, notice: "Price override for '#{city_name}' removed (service reset to default price)."
    rescue ActiveRecord::RecordNotDestroyed => e
      destination = params[:return_to].presence || admin_service_path(@service_city_price.service)
      redirect_to destination, alert: "Could not remove price override: #{e.record.errors.full_messages.to_sentence}"
    end

    private

    def set_service
      return if params[:service_id].blank?
      @service = Service.friendly.find(params[:service_id])
    rescue ActiveRecord::RecordNotFound
      @service = nil
    end

    def set_service_city_price
      @service_city_price = ServiceCityPrice.find(params[:id])
      authorize @service_city_price
    end

    def service_city_price_params
      params.require(:service_city_price).permit(
        :service_id, :city_id, :base_price, :discount_price, :status
      )
    end

    def load_form_options
      @services = Service.active.ordered
      @cities   = City.active.ordered
    end
  end
end
