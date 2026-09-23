# frozen_string_literal: true

require_dependency Rails.root.join("app/mailers/worker_invitation_mailer.rb") rescue nil

module Admin
  class WorkerInvitationsController < BaseController
    before_action :set_invitation, only: %i[resend revoke]

    def index
      scope = policy_scope(WorkerInvitation).includes(:invited_by, :city).recent

      if params[:status].present?
        case params[:status]
        when "pending"
          scope = scope.where(status: "pending").where("expires_at > ?", Time.current)
        when "expired"
          scope = scope.where("status = 'expired' OR (status = 'pending' AND expires_at <= ?)", Time.current)
        when "accepted", "revoked"
          scope = scope.where(status: params[:status])
        end
      end

      if params[:q].present?
        q = "%#{params[:q].to_s.strip.downcase}%"
        scope = scope.where("LOWER(email) LIKE ? OR LOWER(name) LIKE ? OR phone LIKE ?", q, q, q)
      end

      @invitations = paginate(scope, per_page: 15)
    end

    def new
      authorize WorkerInvitation, :new?, policy_class: WorkerInvitationPolicy
      @cities = City.active.ordered
      @invitation = WorkerInvitation.new
    end

    def create
      authorize WorkerInvitation, :create?, policy_class: WorkerInvitationPolicy
      @invitation = WorkerInvitation.new(invitation_params)
      @invitation.invited_by = current_user

      if @invitation.save
        begin
          WorkerInvitationMailer.invite(@invitation).deliver_now
        rescue StandardError => e
          flash[:alert] = "Invitation created, but SMTP email delivery failed: #{e.message}"
          Rails.logger.error("[WorkerInvitationMailer] Invite mail dispatch failed: #{e.message}")
        end

        AuditLogger.log(
          actor: current_user,
          action: "create",
          record: @invitation,
          auditable_type: "WorkerInvitation",
          record_name: "Worker Invite to #{@invitation.email}",
          metadata: {
            email: @invitation.email,
            name: @invitation.name,
            phone: @invitation.phone,
            speciality: @invitation.speciality,
            city_id: @invitation.city_id
          },
          request: request
        )

        redirect_to admin_worker_invitations_path, notice: "Invitation sent successfully to #{@invitation.email}."
      else
        @cities = City.active.ordered
        render :new, status: :unprocessable_entity
      end
    end

    def resend
      authorize @invitation, :resend?, policy_class: WorkerInvitationPolicy

      if @invitation.accepted?
        redirect_to admin_worker_invitations_path, alert: "This invitation has already been accepted."
      else
        @invitation.resend!

        AuditLogger.log(
          actor: current_user,
          action: "update",
          record: @invitation,
          auditable_type: "WorkerInvitation",
          record_name: "Resend Invite to #{@invitation.email}",
          metadata: { resubmitted_at: Time.current },
          request: request
        )

        redirect_to admin_worker_invitations_path, notice: "Invitation resent to #{@invitation.email}."
      end
    end

    def revoke
      authorize @invitation, :revoke?, policy_class: WorkerInvitationPolicy

      if @invitation.accepted?
        redirect_to admin_worker_invitations_path, alert: "Cannot revoke an already accepted invitation."
      else
        @invitation.revoke!

        AuditLogger.log(
          actor: current_user,
          action: "update",
          record: @invitation,
          auditable_type: "WorkerInvitation",
          record_name: "Revoked Invite to #{@invitation.email}",
          metadata: { status: "revoked" },
          request: request
        )

        redirect_to admin_worker_invitations_path, notice: "Invitation for #{@invitation.email} has been revoked."
      end
    end

    private

    def set_invitation
      @invitation = WorkerInvitation.find(params[:id])
    end

    def invitation_params
      params.require(:worker_invitation).permit(:email, :name, :phone, :city_id, :speciality)
    end
  end
end
