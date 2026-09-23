# frozen_string_literal: true

module Admin
  class DashboardController < BaseController
    def index
      skip_policy_scope

      if current_user.admin?
        @stats = Rails.cache.fetch("admin_dashboard_stats_#{Time.current.strftime('%Y%m%d%H%M')}", expires_in: 2.minutes) do
          compute_admin_stats
        end
        @recent_bookings = Booking.includes(:customer, :worker, :booking_items, :payments)
                                  .order(created_at: :desc)
                                  .limit(8)
      else
        @stats = compute_worker_stats(current_user)
        @recent_bookings = current_user.worker_bookings
                                       .includes(:customer, :worker, :booking_items, :payments)
                                       .order(created_at: :desc)
                                       .limit(8)
      end
    end

    private

    def compute_admin_stats
      now = Time.current
      start_of_month = now.beginning_of_month
      start_6_months_ago = 5.months.ago.beginning_of_month

      # KPI Aggregates
      total_customers = User.customers.count
      new_customers_this_month = User.customers.where("created_at >= ?", start_of_month).count
      total_workers = User.workers.count
      active_workers = User.workers.active.count
      total_bookings = Booking.count
      bookings_this_month = Booking.where("created_at >= ?", start_of_month).count

      completed_scope = Booking.where(service_status: "completed")
      gross_revenue_amount = completed_scope.sum(:total_amount).to_i
      revenue_this_month_amount = completed_scope.where("created_at >= ?", start_of_month).sum(:total_amount).to_i

      # 6-Month Rolling Time Series in SQL
      months = 5.downto(0).map { |i| (now - i.months).beginning_of_month }
      monthly_labels = months.map { |m| m.strftime("%b") }

      monthly_bookings_map = Booking.where("created_at >= ?", start_6_months_ago)
                                    .group("DATE_TRUNC('month', created_at)")
                                    .count

      monthly_revenue_map = completed_scope.where("created_at >= ?", start_6_months_ago)
                                           .group("DATE_TRUNC('month', created_at)")
                                           .sum(:total_amount)

      monthly_bookings = months.map do |m|
        monthly_bookings_map.find { |k, _| k.to_date == m.to_date }&.last || 0
      end

      monthly_revenue = months.map do |m|
        (monthly_revenue_map.find { |k, _| k.to_date == m.to_date }&.last || 0).to_i
      end

      # Status Breakdown
      completed_count = completed_scope.count
      active_count = Booking.where(service_status: "in_progress")
                            .or(Booking.where(booking_status: %w[assigned confirmed accepted]).where.not(service_status: %w[completed cancelled]))
                            .count
      pending_count = Booking.where(booking_status: "pending", service_status: "pending").count
      cancelled_count = Booking.where(booking_status: %w[cancelled rejected])
                               .or(Booking.where(service_status: "cancelled"))
                               .count

      {
        total_customers: total_customers,
        new_customers_this_month: new_customers_this_month,
        total_workers: total_workers,
        active_workers: active_workers,
        approved_workers: active_workers,
        total_bookings: total_bookings,
        bookings_this_month: bookings_this_month,
        gross_revenue: "₹#{helpers.number_with_delimiter(gross_revenue_amount)}",
        total_revenue: "₹#{helpers.number_with_delimiter(gross_revenue_amount)}",
        revenue_this_month: "₹#{helpers.number_with_delimiter(revenue_this_month_amount)}",
        monthly_labels: monthly_labels,
        monthly_bookings: monthly_bookings,
        monthly_revenue: monthly_revenue,
        booking_breakdown: {
          completed: completed_count,
          active: active_count,
          pending: pending_count,
          cancelled: cancelled_count
        },
        completed_bookings: completed_count,
        active_bookings: active_count,
        pending_bookings: pending_count,
        cancelled_bookings: cancelled_count
      }
    end

    def compute_worker_stats(worker)
      now = Time.current
      start_of_month = now.beginning_of_month
      start_6_months_ago = 5.months.ago.beginning_of_month

      worker_bookings = worker.worker_bookings
      associated_cust = worker.associated_customers

      total_customers = associated_cust.count
      new_customers_this_month = associated_cust.where("users.created_at >= ?", start_of_month).count
      total_bookings = worker_bookings.count
      bookings_this_month = worker_bookings.where("created_at >= ?", start_of_month).count

      completed_scope = worker_bookings.where(service_status: "completed")
      earnings_amount = completed_scope.sum(:total_amount).to_i
      earnings_this_month = completed_scope.where("created_at >= ?", start_of_month).sum(:total_amount).to_i

      months = 5.downto(0).map { |i| (now - i.months).beginning_of_month }
      monthly_labels = months.map { |m| m.strftime("%b") }

      monthly_bookings_map = worker_bookings.where("created_at >= ?", start_6_months_ago)
                                            .group("DATE_TRUNC('month', created_at)")
                                            .count

      monthly_revenue_map = completed_scope.where("created_at >= ?", start_6_months_ago)
                                           .group("DATE_TRUNC('month', created_at)")
                                           .sum(:total_amount)

      monthly_bookings = months.map do |m|
        monthly_bookings_map.find { |k, _| k.to_date == m.to_date }&.last || 0
      end

      monthly_revenue = months.map do |m|
        (monthly_revenue_map.find { |k, _| k.to_date == m.to_date }&.last || 0).to_i
      end

      completed_count = completed_scope.count
      active_count = worker_bookings.where(service_status: "in_progress")
                                    .or(worker_bookings.where(booking_status: %w[assigned confirmed accepted]).where.not(service_status: %w[completed cancelled]))
                                    .count
      pending_count = worker_bookings.where(booking_status: "pending", service_status: "pending").count
      cancelled_count = worker_bookings.where(booking_status: %w[cancelled rejected])
                                       .or(worker_bookings.where(service_status: "cancelled"))
                                       .count

      {
        total_customers: total_customers,
        new_customers_this_month: new_customers_this_month,
        total_workers: 1,
        active_workers: 1,
        approved_workers: 1,
        total_bookings: total_bookings,
        bookings_this_month: bookings_this_month,
        gross_revenue: "₹#{helpers.number_with_delimiter(earnings_amount)}",
        total_revenue: "₹#{helpers.number_with_delimiter(earnings_amount)}",
        revenue_this_month: "₹#{helpers.number_with_delimiter(earnings_this_month)}",
        monthly_labels: monthly_labels,
        monthly_bookings: monthly_bookings,
        monthly_revenue: monthly_revenue,
        booking_breakdown: {
          completed: completed_count,
          active: active_count,
          pending: pending_count,
          cancelled: cancelled_count
        },
        completed_bookings: completed_count,
        active_bookings: active_count,
        pending_bookings: pending_count,
        cancelled_bookings: cancelled_count
      }
    end
  end
end

