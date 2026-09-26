# frozen_string_literal: true

class AddImageUrlToCategoriesAndServices < ActiveRecord::Migration[8.1]
  def change
    add_column :categories, :image_url, :text
    add_column :services, :image_url, :text
    add_column :users, :avatar_url, :text
  end
end
