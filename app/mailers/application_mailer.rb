# frozen_string_literal: true

class ApplicationMailer < ActionMailer::Base
  default from: ENV.fetch("SMTP_FROM_EMAIL", ENV.fetch("SMTP_USERNAME", "no-reply@beautynest.com"))
  layout "mailer"
end
