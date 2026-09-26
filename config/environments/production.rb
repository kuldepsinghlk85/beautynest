require "active_support/core_ext/integer/time"

Rails.application.configure do
  config.cache_classes = true
  config.eager_load = true
  config.consider_all_requests_local = false
  config.public_file_server.enabled = ENV["RAILS_SERVE_STATIC_FILES"].present?
  config.active_support.deprecation = :notify
  config.log_level = :info
  config.i18n.fallbacks = true
  config.active_support.report_deprecations = false
  config.log_formatter = ::Logger::Formatter.new

  # All uploads in production go to Cloudinary.
  config.active_storage.service = :cloudinary

  # ActionMailer SMTP Configuration
  config.action_mailer.raise_delivery_errors = true
  config.action_mailer.perform_caching = false
  config.action_mailer.default_url_options = {
    host: ENV.fetch("APP_HOST", "localhost:3000"),
    protocol: ENV.fetch("APP_PROTOCOL", "https")
  }

  if ENV["SMTP_ADDRESS"].present?
    config.action_mailer.delivery_method = :smtp
    config.action_mailer.smtp_settings = {
      address:              ENV["SMTP_ADDRESS"],
      port:                 ENV.fetch("SMTP_PORT", 587).to_i,
      domain:               ENV.fetch("SMTP_DOMAIN", "example.com"),
      user_name:            ENV["SMTP_USERNAME"],
      password:             ENV["SMTP_PASSWORD"],
      authentication:       ENV.fetch("SMTP_AUTH", "plain").to_sym,
      enable_starttls_auto: ActiveRecord::Type::Boolean.new.cast(ENV.fetch("SMTP_STARTTLS", "true"))
    }
  else
    config.action_mailer.delivery_method = :file
  end
end

