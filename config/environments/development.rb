require "active_support/core_ext/integer/time"

Rails.application.configure do
  config.enable_reloading = true
  config.eager_load = false
  config.consider_all_requests_local = true
  config.server_timing = true
  config.cache_store = :null_store
  config.action_mailer.raise_delivery_errors = false
  config.action_mailer.perform_caching = false
  config.action_mailer.default_url_options = { host: ENV.fetch("APP_HOST", "localhost:3009") }

  if ENV["SMTP_ADDRESS"].present?
    config.action_mailer.delivery_method = :smtp
    config.action_mailer.raise_delivery_errors = true
    config.action_mailer.smtp_settings = {
      address:              ENV["SMTP_ADDRESS"],
      port:                 ENV.fetch("SMTP_PORT", 587).to_i,
      domain:               ENV.fetch("SMTP_DOMAIN", "ethereal.email"),
      user_name:            ENV.fetch("SMTP_USERNAME", "elna.simonis15@ethereal.email"),
      password:             ENV.fetch("SMTP_PASSWORD", "CMQBFykQN8M39bCDXV"),
      authentication:       ENV.fetch("SMTP_AUTH", "plain").to_sym,
      enable_starttls_auto: true
    }
  else
    # Local file delivery: Saves sent HTML emails to tmp/mails/
    config.action_mailer.delivery_method = :file
    config.action_mailer.file_settings = { location: Rails.root.join("tmp/mails") }
    config.action_mailer.raise_delivery_errors = false
  end
  config.active_support.deprecation = :log
  config.active_support.disallowed_deprecation = :raise
  config.active_support.disallowed_deprecation_warnings = []
  config.i18n.raise_on_missing_translations = false
  config.hosts.clear

  # Store uploaded files on Cloudinary when credentials are provided, fallback to local disk
  config.active_storage.service = if ENV["CLOUDINARY_URL"].present? || ENV["CLOUDINARY_CLOUD_NAME"].present?
                                    :cloudinary
                                  else
                                    :local
                                  end
end

