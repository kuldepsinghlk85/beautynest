# frozen_string_literal: true

class WorkerInvitationAcceptsController < ApplicationController
  before_action :set_invitation
  before_action :check_invitation_status, only: %i[show update]

  layout false

  def show
    @cities = City.active.ordered
    @available_skills = WorkerProfile::SKILL_OPTIONS
    @user = User.new(
      name: @invitation.name,
      email: @invitation.email,
      phone: @invitation.phone
    )
    @profile = WorkerProfile.new(
      bio: @invitation.speciality,
      city: @invitation.city,
      experience_years: 2,
      time_slot: WorkerProfile::DEFAULT_TIME_SLOT,
      available_days: WorkerProfile::DEFAULT_DAYS
    )
  end

  def update
    user_params = params.require(:user).permit(:name, :phone, :password, :password_confirmation)
    profile_params = params.require(:profile).permit(
      :bio, :experience_years, :aadhaar_number, :upi_id, :time_slot, :city_id,
      available_days: [], skills: []
    )

    user = @invitation.accept!(user_params, profile_params)

    if user && user.persisted?
      session[:user_id] = user.id

      AuditLogger.log(
        actor: user,
        action: "create",
        record: user,
        auditable_type: "WorkerOnboarding",
        record_name: "Worker Onboarded: #{user.name}",
        metadata: {
          email: user.email,
          phone: user.phone,
          invitation_id: @invitation.id
        },
        request: request
      )

      redirect_to admin_dashboard_path, notice: "Welcome to #{Setting.site_name}! Your beauty professional account is now active."
    else
      @cities = City.active.ordered
      @available_skills = WorkerProfile::SKILL_OPTIONS
      @user = User.new(user_params.except(:city_id).merge(email: @invitation.email))
      @profile = WorkerProfile.new(profile_params)
      @errors = @invitation.errors.full_messages

      render :show, status: :unprocessable_entity
    end
  end

  private

  def set_invitation
    @invitation = WorkerInvitation.find_by(token: params[:token])
    return if @invitation.present?

    redirect_to login_path, alert: "Invalid or expired invitation link."
  end

  def check_invitation_status
    if @invitation.accepted?
      redirect_to login_path, notice: "This invitation has already been accepted. Please sign in with your credentials."
    elsif @invitation.revoked?
      redirect_to login_path, alert: "This invitation has been revoked by an administrator."
    elsif @invitation.expired?
      redirect_to login_path, alert: "This invitation link has expired. Please contact support or your administrator for a new invite."
    end
  end
end
