# frozen_string_literal: true

# Shared filter/sort logic for Service browse endpoints.
# Include in Api::V1::CategoriesController and Api::V1::ServicesController.
module ServiceBrowseable
  extend ActiveSupport::Concern

  private

  ALLOWED_SORTS = %w[price_asc price_desc duration_asc newest].freeze

  def apply_service_filters(scope)
    scope = scope.where(featured: true) if params[:featured] == "true"
    if params[:subcategory_id].present?
      sub = Subcategory.friendly.find_by(id: params[:subcategory_id]) || Subcategory.friendly.find_by(slug: params[:subcategory_id])
      scope = scope.where(subcategory_id: sub ? sub.id : params[:subcategory_id])
    elsif params[:category_id].present?
      cat = Category.friendly.find_by(id: params[:category_id]) || Category.friendly.find_by(slug: params[:category_id])
      sub_ids = Subcategory.where(category_id: cat ? cat.id : params[:category_id]).select(:id)
      scope = scope.where(subcategory_id: sub_ids)
    end
    scope = scope.where("base_price >= ?", params[:min_price].to_f) if params[:min_price].present?
    scope = scope.where("base_price <= ?", params[:max_price].to_f) if params[:max_price].present?
    search_term = params[:q].presence || params[:query].presence || params[:search].presence
    if search_term.present?
      kw = "%#{search_term.to_s.strip}%"
      scope = scope.where("name ILIKE ? OR description ILIKE ?", kw, kw)
    end
    scope = scope.where(tag: params[:tag].to_s.strip.downcase) if params[:tag].present?
    apply_service_sort(scope)
  end

  def apply_service_sort(scope)
    case params[:sort]
    when "price_asc"    then scope.by_price_asc
    when "price_desc"   then scope.by_price_desc
    when "duration_asc" then scope.by_duration
    when "newest"       then scope.by_newest
    else                     scope.ordered
    end
  end
end
