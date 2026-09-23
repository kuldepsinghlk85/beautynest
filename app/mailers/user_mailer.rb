# frozen_string_literal: true

class UserMailer < ApplicationMailer
  def password_reset(user, reset_url)
    @user = user
    @reset_url = reset_url
    @site_name = Setting.site_name.presence || "Beauty Nest"

    mail(
      to: @user.email,
      subject: "Reset Your #{@site_name} Account Password"
    )
  end
end
