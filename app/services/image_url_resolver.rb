require "uri"
require "digest"
require "active_support/core_ext/object/blank"

class ImageUrlResolver
  # Application-controlled local fallback assets
  FALLBACK_BEAUTICIAN = "/images/default-beautician.svg"
  FALLBACK_AVATAR     = "/images/default-avatar.svg"
  FALLBACK_CATEGORY   = "/images/default-category.svg"
  FALLBACK_SERVICE    = "/images/default-service.svg"

  # Known invalid or broken external asset URL patterns
  INVALID_PATTERNS = [
    %r{images\.unsplash\.com/photo-1573496359142(?:\?|$)},       # truncated photo-1573496359142 without hash
    %r{images\.unsplash\.com/photo-1512290900672-1f419b48b598},  # broken bleach image
    %r{images\.unsplash\.com/photo-1512290903671-2432513be844}   # broken candidate
  ].freeze

  # High-resolution verified external CDN fallbacks (tested & verified 200 OK)
  VERIFIED_WORKER_FALLBACKS = [
    "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80",
    "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80",
    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
    "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=400&q=80",
    "https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?auto=format&fit=crop&w=400&q=80",
    "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=400&q=80",
    "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=400&q=80",
    "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=400&q=80",
    "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80"
  ].freeze

  class << self
    # Resolves an image for a record (User, Category, Service) or raw URL string
    def resolve(source, type: :beautician, record: nil)
      cache_key = build_cache_key(source, type, record)

      if cache_key
        Rails.cache.fetch(cache_key, expires_in: 21_600) do
          resolve_uncached(source, type: type, record: record)
        end
      else
        resolve_uncached(source, type: type, record: record)
      end
    end

    def resolve_for_service(service)
      return FALLBACK_SERVICE if service.nil?
      resolve(service.image_url, type: :service, record: service)
    end

    def resolve_for_beautician(worker)
      return FALLBACK_BEAUTICIAN if worker.nil?
      resolve(worker.display_avatar_url, type: :beautician, record: worker)
    end

    # Validates if an external URL is well-formed, HTTPS, and not a known broken URL
    def valid_url?(url)
      return false if url.blank?

      # 1. Syntactic check
      uri = URI.parse(url.to_s.strip)
      return false unless uri.is_a?(URI::HTTPS) || uri.is_a?(URI::HTTP)
      return false if uri.host.blank?

      # 2. Known invalid pattern check
      return false if known_invalid?(url)

      # 3. Specific Unsplash check: Unsplash photo URLs must have photo-id with hash
      if uri.host.to_s.include?("unsplash.com")
        path = uri.path.to_s
        if path.start_with?("/photo-")
          id_part = path.sub("/photo-", "")
          # Valid Unsplash photo ID must have a hyphen-separated hash (e.g. 1573496359142-b8d87734a5a2)
          return false unless id_part.include?("-")
        end
      end

      true
    rescue URI::InvalidURIError
      false
    end

    def known_invalid?(url)
      INVALID_PATTERNS.any? { |pattern| pattern.match?(url.to_s) }
    end

    def fallback_for(type)
      case type.to_sym
      when :beautician, :worker then FALLBACK_BEAUTICIAN
      when :category            then FALLBACK_CATEGORY
      when :service             then FALLBACK_SERVICE
      else                           FALLBACK_AVATAR
      end
    end

    private

    def resolve_uncached(source, type:, record:)
      rec = record || ((defined?(ApplicationRecord) && source.is_a?(ApplicationRecord)) ? source : (source.respond_to?(:id) ? source : nil))

      # 1. Prefer ActiveStorage attachments for application-owned images
      if rec.respond_to?(:avatar) && rec.avatar.respond_to?(:attached?) && rec.avatar.attached?
        begin
          return rec.avatar.url
        rescue StandardError => e
          Rails.logger.warn("[ImageUrlResolver] Failed to resolve ActiveStorage avatar URL: #{e.message}")
        end
      end

      if rec.respond_to?(:image) && rec.image.respond_to?(:attached?) && rec.image.attached?
        begin
          return rec.image.url
        rescue StandardError => e
          Rails.logger.warn("[ImageUrlResolver] Failed to resolve ActiveStorage image URL: #{e.message}")
        end
      end

      # 2. Extract URL string from source (Record or String or Hash)
      url = extract_url(source)

      # 3. Validate URL
      if url.present? && valid_url?(url)
        return url
      end

      # 4. Fallback selection
      if type.to_sym == :beautician || type.to_sym == :worker
        seed = record_seed(rec || source)
        if seed
          return VERIFIED_WORKER_FALLBACKS[seed % VERIFIED_WORKER_FALLBACKS.size]
        end
      end

      fallback_for(type)
    end

    def extract_url(source)
      if source.is_a?(String)
        source.strip
      elsif source.respond_to?(:has_attribute?)
        if source.has_attribute?(:avatar_url)
          source.read_attribute(:avatar_url).presence
        elsif source.has_attribute?(:image_url)
          source.read_attribute(:image_url).presence
        elsif source.has_attribute?(:icon)
          source.read_attribute(:icon).presence
        end
      elsif source.respond_to?(:avatar_url)
        source.avatar_url.presence
      elsif source.respond_to?(:image_url)
        source.image_url.presence
      elsif source.is_a?(Hash)
        source[:avatar_url] || source["avatar_url"] || source[:image_url] || source["image_url"] || source[:url] || source["url"]
      end
    end

    def record_seed(obj)
      if obj.respond_to?(:id) && obj.id.present?
        obj.id.to_s.hash.abs
      elsif obj.is_a?(Hash) && (obj[:id] || obj["id"])
        (obj[:id] || obj["id"]).to_s.hash.abs
      end
    end

    def build_cache_key(source, type, record)
      rec = record || ((defined?(ApplicationRecord) && source.is_a?(ApplicationRecord)) ? source : nil)
      if rec && rec.respond_to?(:id) && rec.id.present?
        updated = rec.respond_to?(:updated_at) && rec.updated_at ? rec.updated_at.to_i : 0
        "img_res:#{rec.class.name}:#{rec.id}:#{updated}:#{type}"
      elsif source.is_a?(String) && source.present?
        "img_res:str:#{Digest::MD5.hexdigest(source)}:#{type}"
      end
    end
  end
end
