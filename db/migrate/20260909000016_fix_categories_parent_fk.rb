# frozen_string_literal: true

# DBML specifies delete: restrict for parent_id to prevent orphaned sub-categories.
# The original migration used cascade — correct it here.
class FixCategoriesParentFk < ActiveRecord::Migration[8.1]
  def change
    remove_foreign_key :categories, column: :parent_id
    add_foreign_key    :categories, :categories, column: :parent_id, on_delete: :restrict
  end
end
