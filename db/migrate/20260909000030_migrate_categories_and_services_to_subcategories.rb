# frozen_string_literal: true

class MigrateCategoriesAndServicesToSubcategories < ActiveRecord::Migration[8.1]
  class MigrationCategory < ActiveRecord::Base
    self.table_name = "categories"
  end

  class MigrationSubcategory < ActiveRecord::Base
    self.table_name = "subcategories"
  end

  class MigrationService < ActiveRecord::Base
    self.table_name = "services"
  end

  def up
    # 1. Add subcategory_id to services if not already present
    unless column_exists?(:services, :subcategory_id)
      add_column :services, :subcategory_id, :uuid
    end

    MigrationCategory.reset_column_information
    MigrationSubcategory.reset_column_information
    MigrationService.reset_column_information

    # 2. Remove foreign keys on categories and services first to avoid FK constraint violations during data migration
    if foreign_key_exists?(:services, :categories)
      remove_foreign_key :services, :categories
    end
    if foreign_key_exists?(:categories, column: :parent_id)
      remove_foreign_key :categories, column: :parent_id
    end

    # 3. Migrate existing category data
    if column_exists?(:categories, :parent_id) && column_exists?(:services, :category_id)
      # Any category that had a parent_id becomes a row in subcategories
      child_categories = MigrationCategory.where.not(parent_id: nil)
      child_categories.find_each do |child|
        slug = child.slug.presence || child.name.to_s.parameterize
        base_slug = slug
        counter = 1
        while MigrationSubcategory.exists?(slug: slug)
          slug = "#{base_slug}-#{counter}"
          counter += 1
        end

        sub = MigrationSubcategory.find_or_create_by!(name: child.name, category_id: child.parent_id) do |s|
          s.slug        = slug
          s.description = child.description
          s.position    = child.position || 0
          s.status      = child.status || "active"
          s.featured    = child.featured || false
        end
        MigrationService.where(category_id: child.id).update_all(subcategory_id: sub.id)
      end

      # For top-level categories that have direct services, create a default subcategory
      top_categories = MigrationCategory.where(parent_id: nil)
      top_categories.find_each do |top|
        direct_services = MigrationService.where(category_id: top.id)
        next if direct_services.none?

        slug = "#{top.slug}-general"
        base_slug = slug
        counter = 1
        while MigrationSubcategory.exists?(slug: slug)
          slug = "#{base_slug}-#{counter}"
          counter += 1
        end

        default_sub = MigrationSubcategory.find_or_create_by!(name: "General", category_id: top.id) do |s|
          s.slug        = slug
          s.description = "General services for #{top.name}"
          s.position    = 0
          s.status      = "active"
          s.featured    = false
        end
        direct_services.update_all(subcategory_id: default_sub.id)
      end

      # Fallback for any service still missing a subcategory
      orphan_services = MigrationService.where(subcategory_id: nil)
      if orphan_services.any?
        top_cat = top_categories.first || MigrationCategory.create!(
          name: "Salon", slug: "salon-default", status: "active", position: 0, featured: false
        )
        fallback_sub = MigrationSubcategory.find_or_create_by!(
          category_id: top_cat.id,
          name: "General Services"
        ) do |s|
          s.slug = "general-services-fallback"
          s.status = "active"
          s.position = 0
          s.featured = false
        end
        orphan_services.update_all(subcategory_id: fallback_sub.id)
      end

      # category_id is currently NOT NULL, so make it nullable first
      change_column_null :services, :category_id, true

      # Unlink category_id on services before deleting child categories
      MigrationService.where.not(subcategory_id: nil).update_all(category_id: nil)

      # Delete the child categories from categories table now that they are subcategories
      child_categories.delete_all
    elsif column_exists?(:services, :subcategory_id)
      # Ensure no service is left with nil subcategory_id
      orphan_services = MigrationService.where(subcategory_id: nil)
      if orphan_services.any?
        top_cat = MigrationCategory.first || MigrationCategory.create!(
          name: "Salon", slug: "salon-default", status: "active", position: 0, featured: false
        )
        fallback_sub = MigrationSubcategory.find_or_create_by!(
          category_id: top_cat.id,
          name: "General Services"
        ) do |s|
          s.slug = "general-services-fallback"
          s.status = "active"
          s.position = 0
          s.featured = false
        end
        orphan_services.update_all(subcategory_id: fallback_sub.id)
      end
    end

    # 4. Enforce constraints on services.subcategory_id
    change_column_null :services, :subcategory_id, false
    add_index :services, :subcategory_id unless index_exists?(:services, :subcategory_id)
    unless foreign_key_exists?(:services, :subcategories)
      add_foreign_key :services, :subcategories, on_delete: :restrict
    end

    # 5. Drop legacy category_id from services
    if column_exists?(:services, :category_id)
      remove_index :services, :category_id if index_exists?(:services, :category_id)
      remove_column :services, :category_id
    end

    # 6. Drop legacy parent_id from categories
    if column_exists?(:categories, :parent_id)
      remove_index :categories, :parent_id if index_exists?(:categories, :parent_id)
      remove_column :categories, :parent_id
    end
  end

  def down
    unless column_exists?(:categories, :parent_id)
      add_column :categories, :parent_id, :uuid
      add_index  :categories, :parent_id
      add_foreign_key :categories, :categories, column: :parent_id, on_delete: :restrict
    end

    unless column_exists?(:services, :category_id)
      add_column :services, :category_id, :uuid
      add_index  :services, :category_id
      add_foreign_key :services, :categories
    end

    # Repopulate category_id on services from subcategory.category_id
    if column_exists?(:services, :subcategory_id)
      MigrationSubcategory.find_each do |sub|
        MigrationService.where(subcategory_id: sub.id).update_all(category_id: sub.category_id)
      end

      remove_foreign_key :services, :subcategories if foreign_key_exists?(:services, :subcategories)
      remove_index :services, :subcategory_id if index_exists?(:services, :subcategory_id)
      remove_column :services, :subcategory_id
    end
  end
end