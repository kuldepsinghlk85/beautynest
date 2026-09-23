# PAYMENT API REFERENCE — BeautyNest /api/v1

Tables: payments, bookings, users

---

## Payment Method Enum
Values: upi, credit_card, debit_card, net_banking, cash

## Payment Status Enum
Values: pending, completed, failed, refunded

## Payment Flow
1. Customer creates booking → booking status = pending
2. Customer initiates payment → POST /api/v1/bookings/:id/payment → payment record created, status = pending
3. Customer completes payment on gateway → gateway calls webhook or customer posts verification
4. Payment verified → status = completed
5. If cancelled booking → refund initiated → refund_status = full/partial, status = refunded

Note: No specific payment gateway is mandated by the project requirements.
The payment flow is designed to be gateway-agnostic.
Gateway integration (Razorpay, PayU, etc.) is a future implementation decision.

---

## PAYMENT-01 · Initiate Payment
Method: POST /api/v1/bookings/:id/payment
Auth Required: Yes | Role: Customer
Tables Read: bookings (must exist, customer must own it, status must be pending)
Tables Written: payments

FK Used:
- payments.booking_id → bookings.id
- payments.customer_id → users.id (from JWT)

Request Body:
- payment_method (string, required: upi, credit_card, debit_card, net_banking, cash)

Validation:
- Booking must exist and belong to the authenticated customer
- Booking status must be pending
- No existing payment record for this booking (UNIQUE on payments.booking_id)

Example Request:
POST /api/v1/bookings/47/payment
{ "payment_method": "upi" }

Success 201:
{ "status": "success", "message": "Payment initiated.", "data": { "payment": { "id": 22, "payment_code": "PAY-8821", "booking_id": 47, "booking_code": "BC-4703", "amount": "718.40", "payment_method": "upi", "status": "pending", "transaction_ref": null, "created_at": "2024-08-29T08:10:00Z" }, "gateway_payload": { "note": "In production, this contains gateway-specific initiation data (e.g. Razorpay order_id, PayU txnid). Exact structure depends on gateway selected at implementation time." } } }

Error 422:
{ "status": "error", "message": "Payment already exists for this booking.", "errors": { "booking_id": ["already has a payment record"] } }

Error 422:
{ "status": "error", "message": "Booking is not in a payable state.", "errors": { "status": ["booking must be pending to initiate payment"] } }

---

## PAYMENT-02 · Verify Payment (Gateway Callback)
Method: POST /api/v1/bookings/:id/payment/verify
Auth Required: Yes | Role: Customer
Tables Written: payments (status, transaction_ref, gateway_response)

Called after customer completes payment on gateway and the app receives a callback.

Request Body:
- transaction_ref (string, required) — Gateway transaction/order reference
- gateway_response (object, optional) — Raw gateway payload for storage

Success 200:
{ "status": "success", "message": "Payment verified and completed.", "data": { "payment": { "id": 22, "payment_code": "PAY-8821", "amount": "718.40", "status": "completed", "transaction_ref": "pay_GHJ789XYZ123", "created_at": "2024-08-29T08:10:00Z" }, "booking": { "id": 47, "booking_code": "BC-4703", "status": "pending" } } }

Error 422:
{ "status": "error", "message": "Payment verification failed.", "errors": { "transaction_ref": ["could not be verified"] } }

---

## PAYMENT-03 · Mark Payment Failed
Method: POST /api/v1/bookings/:id/payment/failure
Auth Required: Yes | Role: Customer
Tables Written: payments (status = failed)

Called when customer cancels or gateway returns failure.

Request Body:
- reason (string, optional)

Success 200:
{ "status": "success", "message": "Payment marked as failed.", "data": { "payment": { "id": 22, "status": "failed" } } }

---

## PAYMENT-04 · Get Payment Status
Method: GET /api/v1/bookings/:id/payment
Auth Required: Yes | Role: Customer
Tables Read: payments, bookings

Success 200:
{ "status": "success", "data": { "payment": { "id": 22, "payment_code": "PAY-8821", "booking_id": 47, "booking_code": "BC-4703", "amount": "718.40", "payment_method": "upi", "status": "completed", "transaction_ref": "pay_GHJ789XYZ123", "refunded_amount": "0.00", "refund_status": null, "refunded_at": null, "created_at": "2024-08-29T08:10:00Z" } } }

Error 404:
{ "status": "error", "message": "No payment found for this booking.", "errors": {} }

---

## PAYMENT-05 · Get Refund Status
Method: GET /api/v1/bookings/:id/payment/refund
Auth Required: Yes | Role: Customer
Tables Read: payments

Success 200 (refund pending):
{ "status": "success", "data": { "refund": { "payment_id": 22, "payment_code": "PAY-8821", "original_amount": "499.00", "refunded_amount": "499.00", "refund_status": "full", "refunded_at": null, "note": "Refund is being processed. Typically takes 3-5 business days." } } }

Success 200 (refund completed):
{ "status": "success", "data": { "refund": { "payment_id": 22, "original_amount": "499.00", "refunded_amount": "499.00", "refund_status": "full", "refunded_at": "2024-08-29T14:00:00Z" } } }

Success 200 (no refund):
{ "status": "success", "data": { "refund": null } }

---

## PAYMENT-06 · Customer Payment History
Method: GET /api/v1/me/payments
Auth Required: Yes | Role: Customer
Tables Read: payments, bookings

Query Parameters:
- status (string, optional: pending, completed, failed, refunded)
- date_from (date YYYY-MM-DD, optional)
- date_to (date YYYY-MM-DD, optional)
- page (integer, default 1)
- per_page (integer, default 10, max 50)

Success 200:
{ "status": "success", "data": { "payments": [ { "id": 22, "payment_code": "PAY-8821", "booking_code": "BC-4703", "amount": "718.40", "payment_method": "upi", "status": "completed", "transaction_ref": "pay_GHJ789XYZ123", "created_at": "2024-08-29T08:10:00Z" } ] }, "meta": { "total_count": 12, "page": 1, "per_page": 10, "total_pages": 2 } }

---

## PAYMENT-07 · Worker Payment Summary
Method: GET /api/v1/worker/earnings
Auth Required: Yes | Role: Worker
Tables Read: bookings, booking_items, payments

Returns summary of completed bookings and associated payment amounts for the worker.

Query Parameters:
- date_from (date YYYY-MM-DD, optional)
- date_to (date YYYY-MM-DD, optional)
- page (integer, default 1)
- per_page (integer, default 10)

Success 200:
{ "status": "success", "data": { "summary": { "total_completed_jobs": 284, "total_earnings_amount": "142000.00", "this_month_jobs": 24, "this_month_earnings": "12400.00" }, "jobs": [ { "booking_code": "BC-4702", "completed_at": "2024-08-28T11:00:00Z", "services": ["Haircut & Style"], "total_amount": "499.00" } ] }, "meta": { "total_count": 284, "page": 1, "per_page": 10, "total_pages": 29 } }

Total Payment Endpoints: 7
