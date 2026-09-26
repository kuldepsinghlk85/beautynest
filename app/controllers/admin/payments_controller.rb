# frozen_string_literal: true

module Admin
  class PaymentsController < BaseController
    before_action :set_payment, only: %i[show edit update]

    def index
      authorize Payment
      scope = policy_scope(Payment)
                .includes(booking: %i[customer worker])
                .then { |s| apply_filters(s) }
      respond_to do |format|
        format.html do
          @payments = paginate(scope, per_page: 10)
        end
        format.csv do
          AuditLogger.log(
            actor: current_user,
            action: "export_payments_csv",
            record: current_user,
            record_name: "Payment Ledger CSV Export",
            metadata: { count: scope.count },
            request: request
          )
          send_data CsvExportService.payments_csv(scope),
                    filename: "payments-ledger-#{Time.current.strftime('%Y%m%d%H%M')}.csv",
                    type: "text/csv; charset=utf-8",
                    disposition: "attachment"
        end
      end
    end

    def show
      @booking = @payment.booking
    end

    def new
      authorize Payment
      @payment  = Payment.new
      @bookings = Booking.includes(:customer).order(created_at: :desc).limit(200)
    end

    def create
      authorize Payment
      @payment = Payment.new(payment_params)
      if @payment.save
        redirect_to admin_payment_path(@payment), notice: "Payment recorded."
      else
        @bookings = Booking.includes(:customer).order(created_at: :desc).limit(200)
        render :new, status: :unprocessable_entity
      end
    end

    def edit; end

    def update
      if @payment.update(payment_params)
        redirect_to admin_payment_path(@payment), notice: "Payment updated."
      else
        render :edit, status: :unprocessable_entity
      end
    end

    private

    def set_payment
      @payment = Payment.includes(booking: %i[customer worker]).find(params[:id])
      authorize @payment
    end

    def payment_params
      params.require(:payment).permit(:booking_id, :amount, :method, :status, :transaction_ref, :paid_at)
    end

    def apply_filters(scope)
      scope = scope.where(status: params[:status])   if params[:status].present?
      scope = scope.where(method: params[:method])   if params[:method].present?
      scope
    end
  end
end
