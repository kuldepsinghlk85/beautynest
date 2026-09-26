# frozen_string_literal: true

class CleanInvalidImageUrls < ActiveRecord::Migration[8.0]
  def up
    # 1. Clean truncated or broken worker avatar URLs
    User.where("avatar_url LIKE '%photo-1573496359142?%'").update_all(
      avatar_url: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80"
    )

    # 2. Clean broken Bleach & De-Tan category image URLs
    Category.where("image_url LIKE '%1f419b48b598%' OR image_url LIKE '%photo-1512290900672%'").update_all(
      image_url: "https://images.unsplash.com/photo-1576426863848-c21f53c60b19?auto=format&fit=crop&w=800&q=80"
    )

    # 3. Clean broken Service image URLs if any
    Service.where("image_url LIKE '%photo-1573496359142?%'").update_all(
      image_url: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=800&q=80"
    )
  end

  def down
    # No rollback needed for sanitized data
  end
end
