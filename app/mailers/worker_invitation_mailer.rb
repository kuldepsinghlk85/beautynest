# frozen_string_literal: true

class WorkerInvitationMailer < ApplicationMailer
  def invite(invitation)
    @invitation = invitation
    @invited_by = invitation.invited_by
    @accept_url = worker_invitation_accept_url(token: invitation.token)
    @site_name  = Setting.site_name.presence || "Beauty Nest"

    mail(
      to: @invitation.email,
      subject: "You're Invited to Join #{@site_name} as a Beauty Professional"
    )
  end
end
