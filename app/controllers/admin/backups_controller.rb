# frozen_string_literal: true

module Admin
  class BackupsController < BaseController
    def export
      authorize :backup, :export?, policy_class: BackupPolicy
      data = CsvExportService.full_backup_json
      json_text = JSON.pretty_generate(data)

      AuditLogger.log(
        actor: current_user,
        action: "export_full_backup",
        record: current_user,
        record_name: "Full System Database Backup",
        metadata: {
          total_records: {
            bookings: data[:bookings]&.size || 0,
            workers: data[:workers]&.size || 0,
            customers: data[:customers]&.size || 0
          }
        },
        request: request
      )

      send_data json_text,
                filename: "beautynest-full-database-backup-#{Time.current.strftime('%Y%m%d%H%M')}.json",
                type: "application/json; charset=utf-8",
                disposition: "attachment"
    end

    def import
      authorize :backup, :import?, policy_class: BackupPolicy

      backup_file = params[:backup_file]
      if backup_file.blank?
        redirect_back fallback_location: admin_bookings_path, alert: "Please select a valid JSON backup file to import."
        return
      end

      result = DatabaseImportService.import(backup_file)

      if result[:success]
        AuditLogger.log(
          actor: current_user,
          action: "import_full_backup",
          record: current_user,
          record_name: "Full System Database Backup Restore",
          metadata: {
            total_created: result[:total_created],
            total_skipped: result[:total_skipped],
            details: result[:details]
          },
          request: request
        )

        redirect_back fallback_location: admin_bookings_path,
                      notice: "Backup restored successfully: #{result[:total_created]} missing records added. #{result[:total_skipped]} existing records kept completely untouched without modification."
      else
        redirect_back fallback_location: admin_bookings_path,
                      alert: "Backup import failed: #{result[:error]}"
      end
    rescue StandardError => e
      redirect_back fallback_location: admin_bookings_path,
                    alert: "Backup import error: #{e.message}"
    end
  end
end
