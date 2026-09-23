# frozen_string_literal: true

class AddTagToServices < ActiveRecord::Migration[8.0]
  def up
    add_column :services, :tag, :string, limit: 50
    add_index :services, :tag

    # Backfill existing services based on name/slug
    execute <<-SQL
      UPDATE services
      SET tag = CASE
        WHEN lower(name) LIKE '%facial%' OR lower(name) LIKE '%skin%' OR lower(name) LIKE '%clean%' THEN 'facial'
        WHEN lower(name) LIKE '%nail%' OR lower(name) LIKE '%mani%' OR lower(name) LIKE '%pedi%' THEN 'mani-padi'
        ELSE 'korean-glow'
      END
      WHERE tag IS NULL;
    SQL

    change_column_null :services, :tag, false, 'facial'
  end

  def down
    remove_index :services, :tag if index_exists?(:services, :tag)
    remove_column :services, :tag
  end
end
