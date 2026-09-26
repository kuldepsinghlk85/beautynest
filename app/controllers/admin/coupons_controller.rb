# frozen_string_literal: true

module Admin
  class CouponsController < BaseController
    before_action :set_coupon, only: %i[show edit update destroy toggle_status]

    def index
      authorize Coupon
      @all_coupons = policy_scope(Coupon)
      scope = @all_coupons
                .then { |s| apply_filters(s) }
                .order(created_at: :desc)
      @coupons = paginate(scope, per_page: 10)
    end

    def show
      @bookings = @coupon.bookings.includes(:customer, :worker).order(created_at: :desc).limit(10)
    end

    def new
      authorize Coupon
      @coupon = Coupon.new(status: "active", discount_type: "percentage", min_order_amount: 0)
    end

    def create
      authorize Coupon
      @coupon = Coupon.new(coupon_params)
      if @coupon.save
        AuditLogger.log(
          actor: current_user,
          action: "create",
          record: @coupon,
          record_name: "Coupon #{@coupon.code}",
          changes: @coupon.saved_changes,
          request: request
        )
        redirect_to admin_coupon_path(@coupon), notice: "Coupon '#{@coupon.code}' created successfully."
      else
        render :new, status: :unprocessable_entity
      end
    end

    def edit; end

    def update
      if @coupon.update(coupon_params)
        AuditLogger.log(
          actor: current_user,
          action: "update",
          record: @coupon,
          record_name: "Coupon #{@coupon.code}",
          changes: @coupon.saved_changes,
          request: request
        )
        redirect_to admin_coupon_path(@coupon), notice: "Coupon '#{@coupon.code}' updated successfully."
      else
        render :edit, status: :unprocessable_entity
      end
    end

    def destroy
      code = @coupon.code
      AuditLogger.log(
        actor: current_user,
        action: "destroy",
        record: @coupon,
        record_name: "Coupon #{code}",
        request: request
      )
      @coupon.destroy!
      redirect_to admin_coupons_path, notice: "Coupon '#{code}' deleted."
    end

    def toggle_status
      new_status = @coupon.status == "active" ? "inactive" : "active"
      @coupon.update!(status: new_status)
      AuditLogger.log(
        actor: current_user,
        action: "toggle_status",
        record: @coupon,
        record_name: "Coupon #{@coupon.code}",
        changes: @coupon.saved_changes,
        request: request
      )
      redirect_back fallback_location: admin_coupons_path, notice: "Coupon '#{@coupon.code}' marked as #{new_status}."
    end

    private

    def set_coupon
      @coupon = Coupon.find(params[:id])
      authorize @coupon
    end

    def coupon_params
      params.require(:coupon).permit(
        :code, :description, :discount_type, :discount_value,
        :max_discount, :min_order_amount, :valid_from, :valid_until,
        :usage_limit, :status
      )
    end

    def apply_filters(scope)
      scope = scope.where(status: params[:status]) if params[:status].present? && params[:status] != "all"
      scope = scope.where(discount_type: params[:discount_type]) if params[:discount_type].present? && params[:discount_type] != "all"
      if params[:search].present?
        scope = scope.where("code ILIKE ? OR description ILIKE ?", "%#{params[:search]}%", "%#{params[:search]}%")
      end
      scope
    end
  end
end
