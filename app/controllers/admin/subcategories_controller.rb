# frozen_string_literal: true

module Admin
  class SubcategoriesController < BaseController
    before_action :set_category, only: %i[index new create]
    before_action :set_subcategory, only: %i[show edit update destroy]

    # GET /admin/subcategories OR GET /admin/categories/:category_id/subcategories
    def index
      authorize Subcategory
      base = policy_scope(@category ? @category.subcategories : Subcategory)
      scope = base
                .includes(:category)
                .then { |s| apply_filters(s) }
                .ordered
      @subcategories = paginate(scope, per_page: 10)
      @categories = Category.active.ordered
    end

    # GET /admin/subcategories/:id
    def show
      @services = @subcategory.services.includes(image_attachment: :blob).ordered
    end

    # GET /admin/subcategories/new
    def new
      @subcategory = Subcategory.new(category: @category)
      authorize @subcategory
      @categories = Category.active.ordered
    end

    # POST /admin/subcategories
    def create
      @subcategory = Subcategory.new(subcategory_params)
      @subcategory.category = @category if @category && @subcategory.category_id.blank?
      authorize @subcategory

      if @subcategory.save
        AuditLogger.log(
          actor: current_user,
          action: "create",
          record: @subcategory,
          changes: @subcategory.saved_changes,
          request: request
        )
        redirect_to admin_subcategory_path(@subcategory), notice: "Subcategory '#{@subcategory.name}' created successfully."
      else
        @categories = Category.active.ordered
        render :new, status: :unprocessable_entity
      end
    end

    # GET /admin/subcategories/:id/edit
    def edit
      @categories = Category.active.ordered
    end

    # PATCH /admin/subcategories/:id
    def update
      if @subcategory.update(subcategory_params)
        AuditLogger.log(
          actor: current_user,
          action: "update",
          record: @subcategory,
          changes: @subcategory.saved_changes,
          request: request
        )
        redirect_to admin_subcategory_path(@subcategory), notice: "Subcategory updated successfully."
      else
        @categories = Category.active.ordered
        render :edit, status: :unprocessable_entity
      end
    end

    # DELETE /admin/subcategories/:id
    def destroy
      name = @subcategory.name
      AuditLogger.log(
        actor: current_user,
        action: "destroy",
        record: @subcategory,
        record_name: name,
        request: request
      )
      @subcategory.destroy!
      redirect_to admin_subcategories_path, notice: "Subcategory '#{name}' deleted successfully."
    rescue ActiveRecord::RecordNotDestroyed => e
      redirect_to admin_subcategory_path(@subcategory), alert: "Could not delete subcategory: #{e.record.errors.full_messages.to_sentence}"
    end

    private

    def set_category
      return if params[:category_id].blank?
      @category = Category.friendly.find(params[:category_id])
    rescue ActiveRecord::RecordNotFound
      @category = nil
    end

    def set_subcategory
      @subcategory = Subcategory.friendly.find(params[:id])
      authorize @subcategory
    end

    def subcategory_params
      params.require(:subcategory).permit(
        :name, :category_id, :description, :position, :status, :featured
      )
    end

    def apply_filters(scope)
      scope = scope.where(status: params[:status]) if params[:status].present?
      scope = scope.where(featured: true) if params[:featured] == "true"
      if params[:category_id].present? && @category.nil?
        scope = scope.where(category_id: params[:category_id])
      end
      if params[:search].present?
        scope = scope.where("subcategories.name ILIKE ?", "%#{params[:search]}%")
      end
      scope
    end
  end
end
