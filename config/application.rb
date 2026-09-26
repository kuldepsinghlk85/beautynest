require_relative "boot"
require "rails/all"
Bundler.require(*Rails.groups)

if defined?(Dotenv)
  dotenv_path = File.expand_path("../.env", __dir__)
  if File.exist?(dotenv_path)
    docker_db_url = ENV["DATABASE_URL"]
    Dotenv.overload(dotenv_path)
    ENV["DATABASE_URL"] = docker_db_url if docker_db_url.present? && docker_db_url.include?("@db:")
  end
end

module BeautyNest
  class Application < Rails::Application
    config.load_defaults 8.0
    config.time_zone = "Asia/Kolkata"
    config.i18n.default_locale = :en
    config.i18n.available_locales = [:en, :hi]
    config.i18n.fallbacks = [I18n.default_locale]
    config.i18n.load_path += Dir[Rails.root.join("config", "locales", "**", "*.{rb,yml}")]
    config.autoload_lib(ignore: %w[assets tasks])
    config.generators do |g|
      g.orm :active_record
      g.test_framework :minitest
    end
  end
end
