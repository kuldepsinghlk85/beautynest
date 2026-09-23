# frozen_string_literal: true

module Admin
  class ServicesController < BaseController
    before_action :set_category_or_subcategory, only: %i[index new create]
    before_action :set_service,                 only: %i[show edit update destroy]

    # GET /admin/services OR GET /admin/categories/:category_id/services OR GET /admin/subcategories/:subcategory_id/services
    def index
      authorize Service
      base = if @subcategory
               @subcategory.services
             elsif @category
               @category.services
             else
               Service
             end

      scoped = policy_scope(base)
      @service_stats = {
        total:        scoped.count,
        active:       scoped.where(status: "active").count,
        featured:     scoped.where(featured: true).count,
        on_sale:      scoped.where("discount_price IS NOT NULL AND discount_price < base_price").count,
        avg_price:    scoped.average(:base_price)&.round || 0,
        avg_duration: scoped.average(:duration_minutes)&.round || 0
      }

      scope = scoped
                .includes(subcategory: :category, image_attachment: :blob)
                .then { |s| apply_filters(s) }
                .then { |s| apply_sort(s) }
      @services = paginate(scope, per_page: 10)
      @categories = Category.active.ordered
      @subcategories = Subcategory.active.ordered
    end

    # GET /admin/services/:id
    def show
      @service_city_prices = @service.service_city_prices.includes(:city).order(created_at: :desc)
      @active_cities = City.active.ordered
    end

    # GET /admin/services/new
    def new
      @service = Service.new
      if @subcategory
        @service.subcategory = @subcategory
      elsif @category
        @service.category = @category
      end
      authorize @service
      load_form_collections
    end

    # POST /admin/services
    def create
      @service = Service.new(service_params.except(:image, :remove_image))
      @service.subcategory = @subcategory if @subcategory && @service.subcategory_id.blank?
      @service.category = @category if @category && @service.subcategory_id.blank?
      authorize @service

      ActiveRecord::Base.transaction do
        if @service.save
          if params.dig(:service, :image).present?
            @service.handle_image_upload(params[:service][:image], folder: "beauty_connect/services")
          end
          changes = @service.saved_changes.to_h
          changes["image_url"] = [nil, @service.image_url] if @service.image_url.present?
          AuditLogger.log(
            actor: current_user,
            action: "create",
            record: @service,
            changes: changes,
            request: request
          )
          redirect_to admin_service_path(@service), notice: "Service '#{@service.name}' created."
          return
        end
      end

      load_form_collections
      render :new, status: :unprocessable_entity
    end

    # GET /admin/services/:id/edit
    def edit
      load_form_collections
    end

    # PATCH /admin/services/:id
    def update
      ActiveRecord::Base.transaction do
        old_image_url = @service.image_url
        image_changed = false

        if params.dig(:service, :remove_image) == "1"
          @service.handle_image_upload(nil, remove: true)
          image_changed = true
        elsif params.dig(:service, :image).present?
          @service.handle_image_upload(params[:service][:image], folder: "beauty_connect/services")
          image_changed = true
        end

        if @service.update(service_params.except(:image, :remove_image))
          changes = @service.saved_changes.to_h
          if image_changed && old_image_url != @service.image_url
            changes["image_url"] = [old_image_url, @service.image_url]
          end

          act = (image_changed && changes.keys == ["image_url"]) ? "image_upload" : "update"
          AuditLogger.log(
            actor: current_user,
            action: act,
            record: @service,
            changes: changes,
            request: request
          ) if changes.present?

          redirect_to admin_service_path(@service), notice: "Service updated."
          return
        end
      end

      load_form_collections
      render :edit, status: :unprocessable_entity
    end

    # DELETE /admin/services/:id
    def destroy
      name = @service.name
      AuditLogger.log(
        actor: current_user,
        action: "destroy",
        record: @service,
        record_name: name,
        request: request
      )
      @service.cleanup_cloudinary_image
      @service.destroy!
      redirect_to admin_services_path, notice: "Service '#{name}' deleted successfully."
    rescue ActiveRecord::RecordNotDestroyed => e
      redirect_to admin_services_path, alert: "Could not delete service: #{e.record.errors.full_messages.to_sentence}"
    end

    private

    def set_category_or_subcategory
      if params[:subcategory_id].present?
        @subcategory = Subcategory.friendly.find(params[:subcategory_id])
        @category = @subcategory.category
      elsif params[:category_id].present?
        @category = Category.friendly.find(params[:category_id])
      end
    rescue ActiveRecord::RecordNotFound
      @subcategory = nil
      @category = nil
    end

    def set_service
      @service = Service.friendly.find(params[:id])
      authorize @service
    end

    def load_form_collections
      @categories = Category.active.ordered
      @subcategories = Subcategory.active.ordered
    end

    def service_params
      params.require(:service).permit(
        :name, :tag, :description, :about, :benefits_text, :process_text, :subcategory_id, :category_id, :base_price, :discount_price,
        :duration_minutes, :position, :featured, :status, :image, :remove_image,
        benefits: [], process: []
      ).tap do |whitelisted|
        whitelisted.delete(:image) if whitelisted[:image].blank?
      end
    end

    def apply_filters(scope)
      scope = scope.where(status: params[:status])                              if params[:status].present?
      scope = scope.where(tag: params[:tag])                                    if params[:tag].present?
      scope = scope.where(featured: true)                                       if params[:featured] == "true"
      scope = scope.where("services.discount_price IS NOT NULL AND services.discount_price < services.base_price") if params[:on_sale] == "true"
      scope = scope.where(subcategory_id: params[:subcategory_id])              if params[:subcategory_id].present? && @subcategory.nil?
      if params[:category_id].present? && @category.nil? && params[:subcategory_id].blank?
        cat = Category.friendly.find_by(id: params[:category_id]) || Category.friendly.find_by(slug: params[:category_id])
        sub_ids = Subcategory.where(category_id: cat ? cat.id : params[:category_id]).select(:id)
        scope = scope.where(subcategory_id: sub_ids)
      end
      scope = scope.where("services.base_price >= ?", params[:min_price].to_f) if params[:min_price].present?
      scope = scope.where("services.base_price <= ?", params[:max_price].to_f) if params[:max_price].present?
      scope = scope.where("services.name ILIKE ?", "%#{params[:search]}%")     if params[:search].present?
      scope
    end

    def apply_sort(scope)
      case params[:sort]
      when "price_asc"    then scope.by_price_asc
      when "price_desc"   then scope.by_price_desc
      when "duration_asc" then scope.by_duration
      when "newest"       then scope.by_newest
      else                     scope.ordered
      end
    end
  end
end
