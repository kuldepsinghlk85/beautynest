# frozen_string_literal: true

module Admin
  class CategoriesController < BaseController
    before_action :set_category, only: %i[show edit update destroy]

    # GET /admin/categories
    def index
      authorize Category
      scope = policy_scope(Category)
                .includes(:subcategories, image_attachment: :blob)
                .then { |s| apply_filters(s) }
                .ordered
      @categories = paginate(scope, per_page: 10)
      @top_level_categories = Category.active.ordered
    end

    # GET /admin/categories/:id
    def show
      @sub_categories = @category.subcategories.ordered
      @services       = @category.services.includes(image_attachment: :blob).ordered
    end

    # GET /admin/categories/new
    def new
      @category = Category.new
      authorize @category
    end

    # POST /admin/categories
    def create
      @category = Category.new(category_params.except(:image, :remove_image))
      authorize @category

      ActiveRecord::Base.transaction do
        if @category.save
          if params.dig(:category, :image).present?
            @category.handle_image_upload(params[:category][:image], folder: "beauty_connect/categories")
          end
          changes = @category.saved_changes.to_h
          changes["image_url"] = [nil, @category.image_url] if @category.image_url.present?
          AuditLogger.log(
            actor: current_user,
            action: "create",
            record: @category,
            changes: changes,
            request: request
          )
          redirect_to admin_category_path(@category), notice: "Category '#{@category.name}' created successfully."
          return
        end
      end

      render :new, status: :unprocessable_entity
    end

    # GET /admin/categories/:id/edit
    def edit; end

    # PATCH /admin/categories/:id
    def update
      ActiveRecord::Base.transaction do
        old_image_url = @category.image_url
        image_changed = false

        if params.dig(:category, :remove_image) == "1"
          @category.handle_image_upload(nil, remove: true)
          image_changed = true
        elsif params.dig(:category, :image).present?
          @category.handle_image_upload(params[:category][:image], folder: "beauty_connect/categories")
          image_changed = true
        end

        if @category.update(category_params.except(:image, :remove_image))
          changes = @category.saved_changes.to_h
          if image_changed && old_image_url != @category.image_url
            changes["image_url"] = [old_image_url, @category.image_url]
          end

          act = (image_changed && changes.keys == ["image_url"]) ? "image_upload" : "update"
          AuditLogger.log(
            actor: current_user,
            action: act,
            record: @category,
            changes: changes,
            request: request
          ) if changes.present?

          redirect_to admin_category_path(@category), notice: "Category updated."
          return
        end
      end

      render :edit, status: :unprocessable_entity
    end

    # DELETE /admin/categories/:id
    def destroy
      name = @category.name
      AuditLogger.log(
        actor: current_user,
        action: "destroy",
        record: @category,
        record_name: name,
        request: request
      )
      @category.cleanup_cloudinary_image
      @category.destroy!
      redirect_to admin_categories_path, notice: "Category '#{name}' deleted successfully."
    rescue ActiveRecord::RecordNotDestroyed => e
      redirect_to admin_categories_path, alert: "Could not delete category: #{e.record.errors.full_messages.to_sentence}"
    end

    private

    def set_category
      @category = Category.friendly.find(params[:id])
      authorize @category
    end

    def category_params
      params.require(:category).permit(
        :name, :description, :position,
        :featured, :status, :image, :remove_image
      ).tap do |whitelisted|
        whitelisted.delete(:image) if whitelisted[:image].blank?
      end
    end

    def apply_filters(scope)
      scope = scope.where(status: params[:status]) if params[:status].present?
      scope = scope.where(featured: true)          if params[:featured] == "true"
      scope = scope.where("categories.name ILIKE ?", "%#{params[:search]}%") if params[:search].present?
      scope
    end
  end
end
