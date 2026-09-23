# frozen_string_literal: true

require "test_helper"

class WorkerInvitationTest < ActiveSupport::TestCase
  def admin_user
    @admin_user ||= User.admins.active.first ||
                    User.create!(
                      name: "Test Admin",
                      email: "admin_test_#{SecureRandom.hex(4)}@beautynest.com",
                      phone: "+9199999#{rand(10000..99999)}",
                      role: "admin",
                      status: "active",
                      password: "Password123!"
                    )
  end

  test "generates secure token and 7-day expiry on creation" do
    invite = WorkerInvitation.create!(
      email: "beautician_#{SecureRandom.hex(4)}@example.com",
      name: "Ritu Verma",
      speciality: "Bridal Makeup",
      invited_by: admin_user
    )

    assert_not_nil invite.token
    assert_equal 64, invite.token.length
    assert_equal "pending", invite.status
    assert invite.expires_at > 6.days.from_now
    assert invite.pending?
  end

  test "validates email presence and format" do
    invite = WorkerInvitation.new(invited_by: admin_user)
    assert_not invite.valid?
    assert_includes invite.errors[:email], "can't be blank"

    invite.email = "invalid-email"
    assert_not invite.valid?
    assert_includes invite.errors[:email], "is not a valid email format"
  end

  test "cannot invite existing active worker" do
    existing_worker = User.workers.first || User.create!(
      name: "Existing Worker",
      email: "worker_exist_#{SecureRandom.hex(4)}@example.com",
      phone: "+9198888#{rand(10000..99999)}",
      role: "worker",
      status: "active",
      password: "Password123!"
    )

    invite = WorkerInvitation.new(
      email: existing_worker.email,
      invited_by: admin_user
    )
    assert_not invite.valid?
    assert_includes invite.errors[:email], "is already registered as an active worker"
  end

  test "revoke! marks status as revoked" do
    invite = WorkerInvitation.create!(
      email: "revoke_test_#{SecureRandom.hex(4)}@example.com",
      invited_by: admin_user
    )

    assert invite.revoke!
    assert_equal "revoked", invite.status
    assert invite.revoked?
    assert_not invite.pending?
  end

  test "accept! creates worker user and worker profile" do
    invite = WorkerInvitation.create!(
      email: "accept_test_#{SecureRandom.hex(4)}@example.com",
      name: "Ananya Roy",
      speciality: "Hair & Skin Spa",
      invited_by: admin_user
    )

    user = invite.accept!(
      {
        name: "Ananya Roy",
        phone: "+9191111#{rand(10000..99999)}",
        password: "SecurePassword123!",
        password_confirmation: "SecurePassword123!"
      },
      {
        aadhaar_number: "123456789012",
        experience_years: 4,
        bio: "Certified Aesthetician & Spa Specialist",
        skills: ["Korean Glass Skin", "Hair Spa"]
      }
    )

    assert_not_nil user
    assert user.persisted?
    assert_equal "worker", user.role
    assert_equal "active", user.status
    assert_equal "Ananya Roy", user.name

    invite.reload
    assert_equal "accepted", invite.status
    assert_not_nil invite.accepted_at

    profile = user.worker_profile
    assert_not_nil profile
    assert_equal "123456789012", profile.aadhaar_number
    assert_equal 4, profile.experience_years
    assert_includes profile.skills, "Korean Glass Skin"
  end
end
