module Admin
  class SettingsController < BaseController
    before_action :load_worker_tiers, only: %i[show edit]

    def show
      authorize :setting, :show?, policy_class: SettingPolicy
    end

    def edit
      authorize :setting, :edit?, policy_class: SettingPolicy
      render :show
    end

    def update
      authorize :setting, :update?, policy_class: SettingPolicy

      if params.key?(:site_name)
        site_name = params[:site_name].to_s.strip
        if site_name.blank?
          redirect_to admin_settings_path, alert: "Site name cannot be blank."
          return
        elsif site_name.length > 100
          redirect_to admin_settings_path, alert: "Site name cannot exceed 100 characters."
          return
        else
          Setting.site_name = site_name
        end
      end

      Setting.set("support_email", params[:support_email]) if params.key?(:support_email)
      Setting.set("support_helpline", params[:support_helpline]) if params.key?(:support_helpline)
      Setting.set("platform_tagline", params[:platform_tagline]) if params.key?(:platform_tagline)

      # Consent Form Settings
      if params.key?(:consent_settings_submitted)
        Setting.set("consent_form_required", params[:consent_form_required].present? ? "true" : "false")
        Setting.set("consent_form_title", params[:consent_form_title]) if params[:consent_form_title].present?
        Setting.set("consent_form_version", params[:consent_form_version]) if params[:consent_form_version].present?
        Setting.set("consent_form_content", params[:consent_form_content]) if params[:consent_form_content].present?
      end

      # Product Sourcing Settings
      if params.key?(:product_settings_submitted)
        Setting.set("product_choice_enabled", params[:product_choice_enabled].present? ? "true" : "false")
        if params[:platform_product_fee].present?
          fee = [params[:platform_product_fee].to_f, 0.0].max
          Setting.set("platform_product_fee", fee.to_s)
        end
        Setting.set("platform_product_fee_note", params[:platform_product_fee_note]) if params[:platform_product_fee_note].present?
      end

      # Worker Tier Multipliers
      if params[:worker_tier_multipliers].present?
        params[:worker_tier_multipliers].each do |tier_id, mult_val|
          tier = WorkerTier.find_by(id: tier_id)
          if tier && mult_val.to_f > 0
            tier.update(price_multiplier: mult_val.to_f)
          end
        end
      end

      redirect_to admin_settings_path, notice: "Platform settings updated successfully."
    end

    private

    def load_worker_tiers
      WorkerTier.ensure_default_tiers! if WorkerTier.none?
      @worker_tiers = WorkerTier.order(:position)
    end
  end
end

