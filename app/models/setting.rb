# frozen_string_literal: true

class Setting < ApplicationRecord
  DEFAULT_SITE_NAME = "BeautyNest"

  validates :key, presence: true, length: { maximum: 100 }, uniqueness: { case_sensitive: false }

  def self.get(key, default = nil)
    record = find_by(key: key.to_s.strip.downcase)
    record&.value.presence || default
  end

  def self.set(key, val)
    record = find_or_initialize_by(key: key.to_s.strip.downcase)
    record.value = val.to_s.strip
    record.save!
    record.value
  end

  def self.site_name
    get("site_name", DEFAULT_SITE_NAME)
  end

  def self.site_name=(val)
    set("site_name", val)
  end

  # ── Consent Form Settings ───────────────────────────────────────────────────
  DEFAULT_CONSENT_TITLE = "Customer Service & Hygiene Consent Form"
  DEFAULT_CONSENT_VERSION = "v1.0"
  DEFAULT_CONSENT_CONTENT = <<~TEXT.strip
    1. Health & Hygiene Agreement: I confirm that I and everyone in the immediate service area are free from contagious health conditions or symptoms.
    2. Skin Sensitivity & Allergies: I will inform the beauty professional of any known skin allergies, chemical sensitivities, or medical conditions prior to service initiation.
    3. Service Premises: I will provide a clean, safe, and well-lit space with access to water and electricity for the specialist to perform the treatments.
    4. Product Sourcing: If I elect to provide my own products, the platform and specialist bear no liability for adverse reactions or outcome variances resulting from customer-provided materials. If using platform products, all products are verified salon-grade and sanitized.
    5. Cancellation & Safety: The specialist reserves the right to decline or suspend service if safety or hygiene conditions are compromised.
  TEXT

  def self.consent_form_required?
    get("consent_form_required", "false") == "true"
  end

  def self.consent_form_title
    get("consent_form_title", DEFAULT_CONSENT_TITLE)
  end

  def self.consent_form_version
    get("consent_form_version", DEFAULT_CONSENT_VERSION)
  end

  def self.consent_form_content
    get("consent_form_content", DEFAULT_CONSENT_CONTENT)
  end

  # ── Product Sourcing Settings ───────────────────────────────────────────────
  DEFAULT_PLATFORM_PRODUCT_FEE = "150.0"
  DEFAULT_PRODUCT_FEE_NOTE = "Includes premium salon-grade cosmetics, single-use sterilized kits, and professional tools."

  def self.product_choice_enabled?
    get("product_choice_enabled", "true") == "true"
  end

  def self.platform_product_fee
    get("platform_product_fee", DEFAULT_PLATFORM_PRODUCT_FEE).to_f
  end

  def self.platform_product_fee_note
    get("platform_product_fee_note", DEFAULT_PRODUCT_FEE_NOTE)
  end
end
