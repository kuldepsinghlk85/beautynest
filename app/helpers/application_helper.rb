module ApplicationHelper
  def t_bilingual(en, hi)
    I18n.locale == :hi ? hi : en
  end
  def booking_status_badge(status)
    color, label = case status.to_s.downcase
      when "completed"             then ["success", "Completed"]
      when "accepted", "confirmed" then ["success", "Accepted"]
      when "assigned"              then ["azure", "Assigned"]
      when "pending"               then ["warning", "Pending"]
      when "rejected"              then ["danger", "Rejected"]
      when "cancelled"             then ["danger", "Cancelled"]
      else ["secondary", status.to_s.humanize]
    end

    content_tag(:span, class: "badge bg-#{color}-lt") do
      content_tag(:span, "", class: "status-dot status-#{color} me-1") + label
    end
  end

  def service_status_badge(status)
    color, label, icon = case status.to_s.downcase
      when "completed"   then ["success", "Completed", "ti ti-circle-check"]
      when "in_progress" then ["indigo", "In Progress", "ti ti-player-play"]
      when "pending"     then ["warning", "Pending", "ti ti-clock"]
      when "cancelled"   then ["secondary", "Cancelled", "ti ti-ban"]
      else ["secondary", status.to_s.humanize, "ti ti-help"]
    end

    content_tag(:span, class: "badge bg-#{color}-lt fw-semibold") do
      content_tag(:i, "", class: "#{icon} me-1") + label
    end
  end

  def worker_assignment_badge(booking)
    return content_tag(:span, "—", class: "text-secondary small") unless booking

    if booking.respond_to?(:worker_id) && booking.worker_id.blank?
      content_tag(:span, class: "badge bg-secondary-lt text-secondary") do
        content_tag(:span, "", class: "status-dot status-secondary me-1") + "Unassigned"
      end
    elsif booking.status == "confirmed"
      content_tag(:span, class: "badge bg-success-lt text-success fw-semibold") do
        content_tag(:i, "", class: "ti ti-check me-1") + "Accepted"
      end
    elsif booking.status.in?(%w[cancelled rejected])
      content_tag(:span, class: "badge bg-danger-lt text-danger fw-semibold") do
        content_tag(:i, "", class: "ti ti-x me-1") + "Rejected"
      end
    elsif booking.status == "in_progress"
      content_tag(:span, class: "badge bg-indigo-lt text-indigo fw-semibold") do
        content_tag(:i, "", class: "ti ti-player-play me-1") + "In Progress"
      end
    elsif booking.status == "completed"
      content_tag(:span, class: "badge bg-success-lt text-success fw-semibold") do
        content_tag(:i, "", class: "ti ti-circle-check me-1") + "Completed"
      end
    else
      content_tag(:span, class: "badge bg-warning-lt text-warning fw-semibold") do
        content_tag(:i, "", class: "ti ti-clock me-1") + "Assigned"
      end
    end
  end

  def payment_status_badge(status)
    color = case status.to_s.downcase
      when "completed", "paid" then "success"
      when "pending"           then "warning"
      when "refunded"          then "secondary"
      when "failed"            then "danger"
      else "secondary"
    end
    content_tag(:span, class: "badge bg-#{color}-lt") do
      content_tag(:span, "", class: "status-dot status-#{color} me-1") + status.to_s.humanize
    end
  end

  def worker_status_badge(status)
    color = case status.to_s.downcase
      when "approved" then "success"
      when "pending"  then "warning"
      when "rejected" then "danger"
      else "secondary"
    end
    content_tag(:span, class: "badge bg-#{color}-lt") do
      content_tag(:span, "", class: "status-dot status-#{color} me-1") + status.to_s.humanize
    end
  end

  def worker_tier_capsule_badge(tier)
    tier_record = if tier.is_a?(WorkerTier)
      tier
    elsif tier.respond_to?(:worker_profile) && tier.worker_profile&.worker_tier
      tier.worker_profile.worker_tier
    elsif tier.respond_to?(:worker_tier)
      tier.worker_tier
    end

    slug = tier_record&.slug || (tier.is_a?(String) ? tier.downcase : nil)
    name = tier_record&.name || (tier.is_a?(String) ? tier.capitalize : nil)

    # Strictly Bronze, Silver, or Gold (defaults to Bronze if unspecified or unknown)
    slug = "bronze" unless %w[bronze silver gold].include?(slug)
    name = slug.capitalize

    badge_style = case slug
                  when "gold"
                    "background: rgba(234, 179, 8, 0.18); color: #b45309; border: 1px solid rgba(234, 179, 8, 0.45);"
                  when "silver"
                    "background: rgba(100, 116, 139, 0.18); color: #334155; border: 1px solid rgba(100, 116, 139, 0.4);"
                  else # bronze
                    "background: rgba(249, 115, 22, 0.18); color: #c2410c; border: 1px solid rgba(249, 115, 22, 0.45);"
                  end

    content_tag(:span, class: "badge rounded-pill px-2 py-0 fw-bold", style: "#{badge_style} font-size: 0.68rem; text-transform: uppercase; letter-spacing: 0.04em;") do
      content_tag(:i, "", class: "ti ti-award me-1", style: "font-size: 0.72rem;") + name
    end
  end

  # Live Green Dot (Available Today) vs Red Dot (Unavailable Today) indicator
  def worker_availability_badge(worker)
    is_avail = if worker.respond_to?(:available_today?)
      worker.available_today?
    elsif worker.is_a?(Hash)
      worker[:available_today]
    else
      false
    end

    today_name = Time.current.strftime("%A")

    if is_avail
      content_tag(:span, class: "badge bg-success-lt", title: "Active & Available for appointments today (#{today_name})") do
        content_tag(:span, "", class: "status-dot status-success me-1") + "Available Today"
      end
    else
      content_tag(:span, class: "badge bg-danger-lt", title: "Not available for appointments today (#{today_name})") do
        content_tag(:span, "", class: "status-dot status-danger me-1") + "Unavailable Today"
      end
    end
  end

  def active_status_badge(status)
    if status.to_s.downcase == "active"
      content_tag(:span, class: "badge bg-success-lt") do
        content_tag(:span, "", class: "status-dot status-success me-1") + "Active"
      end
    else
      content_tag(:span, class: "badge bg-secondary-lt") do
        content_tag(:span, "", class: "status-dot status-secondary me-1") + "Inactive"
      end
    end
  end

  def coupon_status_badge(status)
    color = case status.to_s.downcase
      when "active"   then "success"
      when "inactive" then "secondary"
      when "expired"  then "danger"
      else "secondary"
    end
    content_tag(:span, class: "badge bg-#{color}-lt") do
      content_tag(:span, "", class: "status-dot status-#{color} me-1") + status.to_s.humanize
    end
  end

  def review_status_badge(status)
    color = case status.to_s.downcase
      when "published" then "success"
      when "flagged"   then "warning"
      when "hidden"    then "secondary"
      else "secondary"
    end
    content_tag(:span, class: "badge bg-#{color}-lt") do
      content_tag(:span, "", class: "status-dot status-#{color} me-1") + status.to_s.humanize
    end
  end

  def notif_type_badge(type)
    color = case type.to_s.downcase
      when "push"  then "indigo"
      when "email" then "azure"
      when "sms"   then "purple"
      else "secondary"
    end
    content_tag(:span, type.to_s.upcase, class: "badge bg-#{color}-lt")
  end

  def stars_html(rating)
    full  = rating.to_i
    empty = [5 - full, 0].max
    html = '<div class="d-inline-flex align-items-center text-warning" style="font-size:14px; gap:2px;">'
    full.times  { html += '<i class="ti ti-star-filled"></i>' }
    empty.times { html += '<i class="ti ti-star text-muted" style="opacity:0.4;"></i>' }
    html += " <span class=\"text-secondary ms-1 fw-bold fs-5\">#{rating}</span></div>"
    html.html_safe
  end

  def notification_status_badge(status)
    color = status == "sent" ? "success" : "warning"
    content_tag(:span, class: "badge bg-#{color}-lt") do
      content_tag(:span, "", class: "status-dot status-#{color} me-1") + status.to_s.humanize
    end
  end

  def category_badge(category_name)
    name = category_name.to_s.strip
    color = case name.downcase
      when /hair/    then "pink"
      when /skin/    then "teal"
      when /nail/    then "purple"
      when /massage/ then "green"
      when /bridal/  then "red"
      when /wax/     then "yellow"
      when /makeup/  then "cyan"
      else "secondary"
    end
    content_tag(:span, name, class: "badge bg-#{color}-lt")
  end

  def notif_type_badge(channel)
    color, icon = case channel.to_s
      when "push"  then ["azure",   "ti-bell"]
      when "email" then ["indigo",  "ti-mail"]
      when "sms"   then ["success", "ti-message"]
      else              ["secondary", "ti-bell"]
    end
    content_tag(:span, class: "badge bg-#{color}-lt") do
      content_tag(:i, "", class: "ti #{icon} me-1") + channel.to_s.humanize
    end
  end

  def notification_status_badge(status)
    color = case status.to_s
      when "sent"    then "success"
      when "pending" then "warning"
      when "failed"  then "danger"
      else "secondary"
    end
    content_tag(:span, class: "badge bg-#{color}-lt") do
      content_tag(:span, "", class: "status-dot status-#{color} me-1") + status.to_s.humanize
    end
  end

  def header_notification_count
    return 0 unless current_user&.active?
    current_user.notifications.unread.count
  end

  def site_name
    Setting.site_name
  end

  def brand_logo_text(class1: "b1", class2: "b2", style1: nil, style2: nil)
    name = Setting.site_name.to_s.strip
    if name =~ /\A([A-Z][a-z0-9]+)([A-Z].*)\z/
      p1, p2 = $1, $2
    elsif (parts = name.split(/\s+/, 2)).length == 2
      p1, p2 = parts[0], parts[1]
    else
      p1, p2 = name, ""
    end

    s1 = style1 ? " style=\"#{style1}\"" : ""
    s2 = style2 ? " style=\"#{style2}\"" : ""
    c1 = class1 ? " class=\"#{class1}\"" : ""
    c2 = class2 ? " class=\"#{class2}\"" : ""

    if p2.present?
      "<span#{c1}#{s1}>#{ERB::Util.html_escape(p1)}</span><span#{c2}#{s2}>#{ERB::Util.html_escape(p2)}</span>".html_safe
    else
      "<span#{c1}#{s1}>#{ERB::Util.html_escape(p1)}</span>".html_safe
    end
  end

  def audit_live_record_path(audit_log)
    return nil unless audit_log
    case audit_log.auditable_type
    when "Worker"   then admin_worker_path(audit_log.auditable_id)
    when "Customer" then admin_customer_path(audit_log.auditable_id)
    when "Service"  then admin_service_path(audit_log.auditable_id)
    when "Category" then admin_category_path(audit_log.auditable_id)
    when "Coupon"   then admin_coupon_path(audit_log.auditable_id)
    when "Booking"  then admin_booking_path(audit_log.auditable_id)
    when "City"     then admin_city_path(audit_log.auditable_id)
    end
  rescue StandardError
    nil
  end

  def image_url_val?(val)
    return false if val.blank? || val.to_s == "—"
    s = val.to_s.strip
    return true if s.include?("cloudinary.com")
    return true if s.start_with?("data:image/")
    return true if s.include?("/rails/active_storage/")
    return true if s.start_with?("http://", "https://", "/")
    return true if s.match?(/\.(jpeg|jpg|png|gif|webp|svg)(\?.*)?$/i)
    false
  end

  def user_avatar_tag(user_or_data, size: :sm, shape: :circle, class_name: "", img_style: "", fallback_color: nil)
    url = nil
    initials = "U"
    name = ""
    role = nil

    if user_or_data.is_a?(User)
      url = user_or_data.avatar_url
      initials = user_or_data.initials
      name = user_or_data.name
      role = user_or_data.role
    elsif user_or_data.is_a?(Hash)
      url = user_or_data[:avatar_url] || user_or_data["avatar_url"]
      name = user_or_data[:name] || user_or_data["name"] || ""
      initials = user_or_data[:initials] || user_or_data["initials"] || (name.to_s.split.map(&:first).join.upcase.first(2).presence || "U")
      role = user_or_data[:role] || user_or_data["role"]
    elsif user_or_data.respond_to?(:avatar_url)
      url = (user_or_data.avatar_url rescue nil)
      name = user_or_data.respond_to?(:name) ? user_or_data.name.to_s : ""
      initials = user_or_data.respond_to?(:initials) ? user_or_data.initials : (name.split.map(&:first).join.upcase.first(2).presence || "U")
      role = user_or_data.respond_to?(:role) ? user_or_data.role : nil
    elsif user_or_data.is_a?(String) && user_or_data.present?
      name = user_or_data
      initials = name.split.map(&:first).join.upcase.first(2).presence || "U"
    end

    size_class = case size.to_sym
                 when :xs then "avatar-xs"
                 when :sm then "avatar-sm"
                 when :md then "avatar-md"
                 when :lg then "avatar-lg"
                 when :xl then "avatar-xl"
                 else "avatar-sm"
                 end

    shape_class = shape == :circle ? "rounded-circle" : "rounded-2"

    if image_url_val?(url)
      content_tag(:img, nil,
        src: url,
        class: "avatar #{size_class} #{shape_class} #{class_name}".strip,
        style: "object-fit: cover; #{img_style}".strip,
        alt: name.presence || "Avatar"
      )
    else
      color_class = fallback_color.presence || (role == "worker" ? "bg-indigo-lt text-indigo" : "bg-azure-lt text-azure")
      content_tag(:span, initials,
        class: "avatar #{size_class} #{shape_class} #{color_class} fw-bold flex-shrink-0 #{class_name}".strip,
        style: img_style
      )
    end
  end

  # Extracts key initial attribute summary for created records in audit logs
  def audit_created_summary(audit_log)
    return {} unless audit_log&.changes_payload.is_a?(Hash)

    payload = audit_log.changes_payload.except("_metadata")
    meta = audit_log.metadata.is_a?(Hash) ? audit_log.metadata : {}

    candidates = %w[name title code email phone status role service_name category_name amount]
    found = {}

    candidates.each do |c|
      if payload.key?(c)
        val = payload[c].is_a?(Array) ? payload[c].last : payload[c]
        found[c] = val if val.present?
      elsif meta.key?(c)
        found[c] = meta[c] if meta[c].present?
      end
    end

    if found.empty?
      payload.each do |k, v|
        next if k.to_s == "id" || k.to_s.end_with?("_id")
        val = v.is_a?(Array) ? v.last : v
        found[k] = val if val.present?
        break if found.size >= 2
      end
    end

    found
  end

  def audit_created_image(audit_log)
    return nil unless audit_log&.changes_payload.is_a?(Hash)
    payload = audit_log.changes_payload
    img = payload["image_url"] || payload[:image_url]
    val = img.is_a?(Array) ? img.last : img
    image_url_val?(val) ? val : nil
  end

  def render_pagination(collection = @pagination)
    return if collection.nil?

    total = if collection.respond_to?(:total_count)
              collection.total_count
            elsif collection.is_a?(Hash)
              collection[:total_count].to_i
            else
              collection.respond_to?(:count) ? collection.count : collection.size
            end

    return if total.to_i <= 0

    render "admin/shared/pagination", collection: collection
  end

  CATEGORY_EMOJI_MAP = {
    "salon-for-women" => "💆‍♀️",
    "salon-for-men"   => "💈",
    "spa-wellness"    => "🧖",
    "massage-spa"     => "💆",
    "hair"            => "💇",
    "facial-cleanup"  => "✨",
    "waxing"          => "🌸",
    "manicure"        => "💅",
    "pedicure"        => "🦶",
    "bleach-de-tan"   => "🌟",
    "threading"       => "🧵",
    "body-care"       => "🧴",
    "home-cleaning"   => "🏠"
  }.freeze

  def category_emoji(slug)
    CATEGORY_EMOJI_MAP[slug.to_s] || "✨"
  end
end

