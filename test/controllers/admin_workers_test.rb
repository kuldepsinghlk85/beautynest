# frozen_string_literal: true

require "test_helper"

class AdminWorkersTest < ActionDispatch::IntegrationTest
  setup do
    @admin = User.find_or_create_by!(email: "admin_workers_test@BeautyNest.test") do |u|
      u.name = "Admin Workers"
      u.phone = "+919999000066"
      u.password = "Admin@1234"
      u.password_confirmation = "Admin@1234"
      u.role = "admin"
      u.status = "active"
    end

    @worker = User.find_or_create_by!(email: "existing_worker_test@BeautyNest.test") do |u|
      u.name = "Priya Sharma"
      u.phone = "+919876500111"
      u.password = "Worker@1234"
      u.password_confirmation = "Worker@1234"
      u.role = "worker"
      u.status = "active"
    end

    @worker_profile = @worker.worker_profile || @worker.create_worker_profile!(
      bio: "Hair Styling",
      experience_years: 4,
      is_available: true
    )
  end

  test "GET /admin/workers requires login" do
    get "/admin/workers"
    assert_redirected_to login_path
  end

  test "GET /admin/workers renders workforce index" do
    post login_path, params: { email: @admin.email, password: "Admin@1234" }

    get "/admin/workers"
    assert_response :success
    assert_includes response.body, "Service Professionals"
    assert_includes response.body, "Priya Sharma"
  end

  test "GET /admin/workers/new renders onboard worker form" do
    post login_path, params: { email: @admin.email, password: "Admin@1234" }

    get "/admin/workers/new"
    assert_response :success
    assert_includes response.body, "Add / Invite Worker"
    assert_includes response.body, "Operating City"
  end

  test "POST /admin/workers onboard/invites worker with auto-generated password" do
    post login_path, params: { email: @admin.email, password: "Admin@1234" }

    unique_email = "invite_worker_#{SecureRandom.hex(3)}@BeautyNest.test"
    unique_phone = "+9198#{rand(10000000..99999999)}"

    assert_difference -> { User.workers.count }, 1 do
      post "/admin/workers", params: {
        worker: {
          name: "Ananya Roy",
          email: unique_email,
          phone: unique_phone,
          city: "Bangalore",
          speciality: "Skincare & Facial",
          experience_years: 3,
          bio: "Specialist in anti-aging facials",
          password: "", # Blank password triggers auto-generation
          status: "active"
        }
      }
    end

    created_worker = User.find_by!(email: unique_email)
    assert_redirected_to admin_worker_path(created_worker)
    assert_equal "Ananya Roy", created_worker.name
    assert_equal "worker", created_worker.role
    assert created_worker.password_digest.present?

    temp_pw = flash[:notice].to_s[/Temporary Password:\s*(\S+)/, 1]
    assert temp_pw.present?, "Expected flash[:notice] to contain temporary password"
    assert created_worker.authenticate(temp_pw)

    # Verify WorkerProfile was created
    assert_not_nil created_worker.worker_profile
    assert_equal 3, created_worker.worker_profile.experience_years
    assert_equal "Specialist in anti-aging facials", created_worker.worker_profile.bio

    # Verify Address was created
    assert_equal "Bangalore", created_worker.city
  end

  test "POST /admin/workers creates worker with explicit password" do
    post login_path, params: { email: @admin.email, password: "Admin@1234" }

    unique_email = "explicit_worker_#{SecureRandom.hex(3)}@BeautyNest.test"
    unique_phone = "+9197#{rand(10000000..99999999)}"

    assert_difference -> { User.workers.count }, 1 do
      post "/admin/workers", params: {
        worker: {
          name: "Kavita Rao",
          email: unique_email,
          phone: unique_phone,
          city: "Mumbai",
          speciality: "Nail Art",
          experience_years: 5,
          password: "CustomSecretPass123",
          password_confirmation: "CustomSecretPass123",
          status: "active"
        }
      }
    end

    created_worker = User.find_by!(email: unique_email)
    assert created_worker.authenticate("CustomSecretPass123")
  end

  test "POST /admin/workers renders unprocessable_entity on invalid params" do
    post login_path, params: { email: @admin.email, password: "Admin@1234" }

    assert_no_difference -> { User.workers.count } do
      post "/admin/workers", params: {
        worker: {
          name: "",
          email: "invalid_email",
          phone: ""
        }
      }
    end

    assert_response :unprocessable_entity
    assert_includes response.body, "Please correct the following errors"
  end

  test "GET /admin/workers/:id renders worker profile" do
    post login_path, params: { email: @admin.email, password: "Admin@1234" }

    get admin_worker_path(@worker)
    assert_response :success
    assert_includes response.body, "Priya Sharma"
  end

  test "PATCH /admin/workers/:id updates worker and profile details" do
    post login_path, params: { email: @admin.email, password: "Admin@1234" }

    patch admin_worker_path(@worker), params: {
      worker: {
        name: "Priya Sharma-Kapoor",
        city: "Delhi",
        speciality: "Bridal Makeup",
        experience_years: 6,
        status: "active"
      }
    }

    assert_redirected_to admin_worker_path(@worker)
    @worker.reload
    assert_equal "Priya Sharma-Kapoor", @worker.name
    assert_equal "Delhi", @worker.city
    assert_equal 6, @worker.worker_profile.experience_years
    assert_equal "Bridal Makeup", @worker.worker_profile.bio
  end

  test "POST /admin/workers with user-prefixed params still onboards worker cleanly" do
    post login_path, params: { email: @admin.email, password: "Admin@1234" }

    unique_email = "user_param_worker_#{SecureRandom.hex(3)}@BeautyNest.test"
    unique_phone = "+9196#{rand(10000000..99999999)}"

    assert_difference -> { User.workers.count }, 1 do
      post "/admin/workers", params: {
        user: {
          name: "Sonia Verma",
          email: unique_email,
          phone: unique_phone,
          status: "active"
        },
        worker: {
          city: "Pune",
          speciality: "Massage Therapy",
          experience_years: 4,
          bio: "Experienced therapist"
        }
      }
    end

    created_worker = User.find_by!(email: unique_email)
    assert_redirected_to admin_worker_path(created_worker)
    assert_equal "Sonia Verma", created_worker.name
    assert_equal "Pune", created_worker.city
  end

  test "DELETE /admin/workers/:id deletes worker successfully" do
    post login_path, params: { email: @admin.email, password: "Admin@1234" }

    worker_to_delete = User.create!(
      name: "Temporary Worker",
      email: "temp_del_worker_#{SecureRandom.hex(3)}@BeautyNest.test",
      phone: "+9195#{rand(10000000..99999999)}",
      password: "Worker@1234",
      password_confirmation: "Worker@1234",
      role: "worker",
      status: "active"
    )
    worker_to_delete.create_worker_profile!(bio: "Temporary", experience_years: 1, is_available: true)
    worker_to_delete.addresses.create!(label: "City", city: "Jaipur", line1: "Area", is_default: true)

    assert_difference -> { User.workers.count }, -1 do
      delete admin_worker_path(worker_to_delete)
    end

    assert_redirected_to admin_workers_path
    follow_redirect!
    assert_includes response.body, "Worker &#39;Temporary Worker&#39; deleted successfully."
    assert_not User.exists?(id: worker_to_delete.id)
  end

  test "POST /admin/workers with available_days stores schedule and full-day slot" do
    post login_path, params: { email: @admin.email, password: "Admin@1234" }

    unique_email = "schedule_worker_#{SecureRandom.hex(3)}@BeautyNest.test"
    unique_phone = "+9194#{rand(10000000..99999999)}"

    post "/admin/workers", params: {
      worker: {
        name: "Meenakshi Iyer",
        email: unique_email,
        phone: unique_phone,
        city: "Mumbai",
        available_days: ["Monday", "Wednesday", "Friday"],
        is_available: "1",
        status: "active"
      }
    }

    worker = User.find_by!(email: unique_email)
    assert_redirected_to admin_worker_path(worker)
    assert_equal ["Monday", "Wednesday", "Friday"], worker.available_days
    assert_equal "Full Day (Throughout the Day)", worker.time_slot
    assert worker.worker_profile.is_available?
  end

  test "GET /admin/workers renders green dot for available today and red dot for unavailable today" do
    post login_path, params: { email: @admin.email, password: "Admin@1234" }

    today = Time.current.strftime("%A")
    other_day = WorkerProfile::DAYS_OF_WEEK.find { |d| !d.casecmp?(today) }

    # Worker 1: Available today
    w_avail = User.create!(
      name: "Available Today Worker",
      email: "avail_today_#{SecureRandom.hex(3)}@BeautyNest.test",
      phone: "+9193#{rand(10000000..99999999)}",
      password: "Worker@1234",
      password_confirmation: "Worker@1234",
      role: "worker",
      status: "active"
    )
    w_avail.create_worker_profile!(
      bio: "Hair Specialist",
      available_days: [today],
      is_available: true,
      experience_years: 2
    )

    # Worker 2: Unavailable today (omits today)
    w_unavail = User.create!(
      name: "Unavailable Today Worker",
      email: "unavail_today_#{SecureRandom.hex(3)}@BeautyNest.test",
      phone: "+9192#{rand(10000000..99999999)}",
      password: "Worker@1234",
      password_confirmation: "Worker@1234",
      role: "worker",
      status: "active"
    )
    w_unavail.create_worker_profile!(
      bio: "Skin Specialist",
      available_days: [other_day],
      is_available: true,
      experience_years: 3
    )

    get "/admin/workers"
    assert_response :success

    assert_includes response.body, "Available Today"
    assert_includes response.body, "Unavailable Today"
    assert_includes response.body, "status-dot status-success"
    assert_includes response.body, "status-dot status-danger"

    # Test filtering by availability=available_today
    get "/admin/workers", params: { availability: "available_today" }
    assert_response :success
    assert_includes response.body, "Available Today Worker"
    assert_not_includes response.body, "Unavailable Today Worker"

    # Test filtering by availability=unavailable_today
    get "/admin/workers", params: { availability: "unavailable_today" }
    assert_response :success
    assert_includes response.body, "Unavailable Today Worker"
    assert_not_includes response.body, "Available Today Worker"
  end

  test "API Worker can update their own available days and city via /api/v1/worker/profile" do
    _, token = generate_token_for(@worker)

    patch "/api/v1/worker/profile",
          params: {
            profile: {
              city: "Bangalore",
              available_days: ["Tuesday", "Thursday", "Saturday"],
              is_available: true
            }
          },
          headers: { "Authorization" => "Bearer #{token}" }

    assert_response :success
    json = JSON.parse(response.body)
    assert_equal "success", json["status"]
    assert_equal ["Tuesday", "Thursday", "Saturday"], json["data"]["available_days"]
    assert_equal "Bangalore", json["data"]["serving_city"]

    @worker.reload
    assert_equal ["Tuesday", "Thursday", "Saturday"], @worker.available_days
    assert_equal "Bangalore", @worker.serving_city
  end

  test "API Worker can get and update availability via /api/v1/worker/availability" do
    _, token = generate_token_for(@worker)

    get "/api/v1/worker/availability",
        headers: { "Authorization" => "Bearer #{token}" }

    assert_response :success
    json = JSON.parse(response.body)
    assert_equal "success", json["status"]
    assert json["data"].key?("available_days")
    assert json["data"].key?("available_today")
    assert json["data"].key?("time_slot")

    patch "/api/v1/worker/availability",
          params: {
            availability: {
              available_days: ["Monday", "Tuesday", "Wednesday"],
              is_available: false
            }
          },
          headers: { "Authorization" => "Bearer #{token}" }

    assert_response :success
    updated_json = JSON.parse(response.body)
    assert_equal ["Monday", "Tuesday", "Wednesday"], updated_json["data"]["available_days"]
    assert_equal false, updated_json["data"]["is_available"]

    @worker.reload
    assert_equal false, @worker.worker_profile.is_available
    assert_equal ["Monday", "Tuesday", "Wednesday"], @worker.available_days
  end

  test "WorkerProfile.rolling_week starts from today and spans 7 consecutive days" do
    today_name = Date.current.strftime("%A")
    week = WorkerProfile.rolling_week

    assert_equal 7, week.length
    assert_equal today_name, week.first
    assert_equal (Date.current + 1).strftime("%A"), week[1]
    assert_equal (Date.current + 6).strftime("%A"), week.last
  end

  test "WorkerProfile::DAY_CODES provides 2-character abbreviations for all days" do
    WorkerProfile::DAYS_OF_WEEK.each do |day|
      code = WorkerProfile::DAY_CODES[day]
      assert_not_nil code, "Expected 2-char code for #{day}"
      assert_equal 2, code.length, "Expected 2 characters for #{day}, got '#{code}'"
    end
    assert_equal "Mo", WorkerProfile::DAY_CODES["Monday"]
    assert_equal "Tu", WorkerProfile::DAY_CODES["Tuesday"]
    assert_equal "We", WorkerProfile::DAY_CODES["Wednesday"]
    assert_equal "Th", WorkerProfile::DAY_CODES["Thursday"]
    assert_equal "Fr", WorkerProfile::DAY_CODES["Friday"]
    assert_equal "Sa", WorkerProfile::DAY_CODES["Saturday"]
    assert_equal "Su", WorkerProfile::DAY_CODES["Sunday"]
  end

  test "GET /admin/workers renders 2-row grid with 2-char day chips starting from today" do
    post login_path, params: { email: @admin.email, password: "Admin@1234" }

    get "/admin/workers"
    assert_response :success

    # Grid layout for exactly 2 rows (4 columns x 2 rows)
    assert_includes response.body, "grid-template-columns: repeat(4, 25px)"
    assert_includes response.body, "From #{Date.current.strftime('%a')} (Today)"

    # Check that 2-char day codes are rendered
    today_short = WorkerProfile::DAY_CODES[Date.current.strftime("%A")]
    assert_includes response.body, today_short
  end

  test "GET /admin/workers/:id renders rolling 7-day schedule starting from today" do
    post login_path, params: { email: @admin.email, password: "Admin@1234" }

    get admin_worker_path(@worker)
    assert_response :success

    assert_includes response.body, "Weekly Serving Schedule (7 Days)"
    assert_includes response.body, "Rolling 7 days from today"
    today_short = WorkerProfile::DAY_CODES[Date.current.strftime("%A")]
    assert_includes response.body, today_short
  end

  test "GET /admin/workers does not render Time Slot column and renders capsule UI badge for worker tier" do
    gold_tier = WorkerTier.find_or_create_by!(slug: "gold") do |t|
      t.name = "Gold"
      t.price_multiplier = 1.50
    end
    @worker_profile.update!(worker_tier: gold_tier)

    post login_path, params: { email: @admin.email, password: "Admin@1234" }
    get "/admin/workers"
    assert_response :success

    # Ensure "Time Slot" header and column are removed
    assert_not_includes response.body, "<th>Time Slot</th>"
    assert_not_includes response.body, "Time Slot"

    # Ensure capsule UI badge is rendered in front of worker name
    assert_includes response.body, "badge rounded-pill"
    assert_includes response.body, "ti-award"
    assert_includes response.body, "Gold"
  end

  test "GET /admin/workers/new and edit only provide Bronze, Silver, Gold without Standard option" do
    post login_path, params: { email: @admin.email, password: "Admin@1234" }

    get "/admin/workers/new"
    assert_response :success
    assert_not_includes response.body, "Standard Base Pricing"
    assert_not_includes response.body, "No Tier"
    assert_includes response.body, "Bronze"
    assert_includes response.body, "Silver"
    assert_includes response.body, "Gold"

    get edit_admin_worker_path(@worker)
    assert_response :success
    assert_not_includes response.body, "Base Pricing (No Tier)"
    assert_not_includes response.body, "Standard"
    assert_includes response.body, "Bronze"
    assert_includes response.body, "Silver"
    assert_includes response.body, "Gold"
  end

  test "Worker tier capsule badge strictly defaults to Bronze when unspecified, never Standard" do
    @worker_profile.update_column(:worker_tier_id, nil)

    post login_path, params: { email: @admin.email, password: "Admin@1234" }
    get "/admin/workers"
    assert_response :success

    # Ensure "Standard" is never rendered
    assert_not_includes response.body, ">Standard<"
    # Ensure Bronze is rendered as the fallback tier capsule
    assert_includes response.body, "Bronze"
  end
end

