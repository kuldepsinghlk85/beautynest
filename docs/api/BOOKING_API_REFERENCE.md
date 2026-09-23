# BOOKING API REFERENCE — BeautyNest /api/v1/bookings

Tables: bookings, booking_items, services, users, coupons, reviews

---

## Booking Status Lifecycle

pending → confirmed → in_progress → completed
(cancelled is reachable from: pending, confirmed — NOT from in_progress or completed)

Status transitions allowed per role:
- pending → confirmed: Admin (assigns worker)
- confirmed → in_progress: Worker (marks started)
- in_progress → completed: Worker (marks completed)
- pending → cancelled: Customer, Admin
- confirmed → cancelled: Customer (within cancellation window), Admin

---

## BOOKING-01 · Create Booking
Method: POST /api/v1/bookings
Auth Required: Yes | Role: Customer
Tables Written: bookings, booking_items
Tables Read: services, coupons (if coupon_code provided)

Request Body:
- items (array, required, min 1 item)
  - service_id (integer, required)
  - quantity (integer, optional, default 1, min 1)
- service_address (object, required)
  - line1 (string, required)
  - line2 (string, optional)
  - city (string, required)
  - pincode (string, required, 6 digits)
- scheduled_at (datetime ISO8601, required, must be future)
- notes (string, optional, max 500 chars)
- coupon_code (string, optional)

Validation Rules:
- All service_ids must exist and be active
- scheduled_at must be at least 2 hours in the future
- coupon_code if provided must be valid, active, and meet min_order_amount

FK Relationships Used:
- booking_items.booking_id → bookings.id
- booking_items.service_id → services.id
- bookings.customer_id → users.id (set from JWT)
- bookings.coupon_id → coupons.id (if coupon applied)

Example Request:
POST /api/v1/bookings
{ "items": [ { "service_id": 1, "quantity": 1 }, { "service_id": 7, "quantity": 1 } ], "service_address": { "line1": "Flat 4B, Sunrise Apartments", "line2": "Bandra West", "city": "Mumbai", "pincode": "400050" }, "scheduled_at": "2024-09-02T10:00:00Z", "notes": "Please use organic products.", "coupon_code": "BEAUTY20" }

Success 201:
{ "status": "success", "message": "Booking created successfully.", "data": { "booking": { "id": 47, "booking_code": "BC-4703", "status": "pending", "scheduled_at": "2024-09-02T10:00:00Z", "service_address": { "line1": "Flat 4B, Sunrise Apartments", "line2": "Bandra West", "city": "Mumbai", "pincode": "400050" }, "items": [ { "id": 89, "service_id": 1, "service_title_snapshot": "Haircut & Style", "unit_price": "499.00", "quantity": 1, "total_price": "499.00" }, { "id": 90, "service_id": 7, "service_title_snapshot": "Classic Manicure", "unit_price": "399.00", "quantity": 1, "total_price": "399.00" } ], "subtotal_amount": "898.00", "discount_amount": "179.60", "total_amount": "718.40", "coupon": { "code": "BEAUTY20", "discount_type": "percentage", "discount_value": "20.00" }, "notes": "Please use organic products.", "worker": null, "payment_status": null, "created_at": "2024-08-29T08:00:00Z" } } }

Error 422:
{ "status": "error", "message": "Validation failed.", "errors": { "scheduled_at": ["must be at least 2 hours in the future"], "items[0].service_id": ["Service not found or inactive"] } }

---

## BOOKING-02 · List Customer Bookings
Method: GET /api/v1/bookings
Auth Required: Yes | Role: Customer
Tables Read: bookings, booking_items, users (worker)

Query Parameters:
- status (string, optional: pending, confirmed, in_progress, completed, cancelled)
- date_from (date YYYY-MM-DD, optional)
- date_to (date YYYY-MM-DD, optional)
- page (integer, default 1)
- per_page (integer, default 10, max 50)
- sort (string: "scheduled_at_desc" default, "scheduled_at_asc", "created_at_desc")

Success 200:
{ "status": "success", "data": { "bookings": [ { "id": 47, "booking_code": "BC-4703", "status": "pending", "scheduled_at": "2024-09-02T10:00:00Z", "total_amount": "718.40", "items_count": 2, "first_service": "Haircut & Style", "worker": null } ] }, "meta": { "total_count": 12, "page": 1, "per_page": 10, "total_pages": 2 } }

---

## BOOKING-03 · Get Booking Details
Method: GET /api/v1/bookings/:id
Auth Required: Yes | Role: Customer
Tables Read: bookings, booking_items, users (worker), payments, reviews

Path Parameters:
- id: Booking ID (integer) or booking_code (string like BC-4703)

Success 200:
{ "status": "success", "data": { "booking": { "id": 47, "booking_code": "BC-4703", "status": "completed", "scheduled_at": "2024-09-02T10:00:00Z", "service_address": { "line1": "Flat 4B", "city": "Mumbai", "pincode": "400050" }, "items": [ { "id": 89, "service_title_snapshot": "Haircut & Style", "unit_price": "499.00", "quantity": 1, "total_price": "499.00" } ], "subtotal_amount": "499.00", "discount_amount": "0.00", "total_amount": "499.00", "notes": null, "worker": { "id": 1, "name": "Sunita Devi", "specialty": "Hair Styling", "rating_avg": "4.9" }, "payment": { "id": 22, "payment_code": "PAY-8821", "amount": "499.00", "payment_method": "upi", "status": "completed" }, "status_history": [ { "status": "pending", "changed_at": "2024-08-29T08:00:00Z", "note": "Booking created" }, { "status": "confirmed", "changed_at": "2024-08-29T09:00:00Z", "note": "Worker assigned" } ], "review": null, "review_eligible": true, "confirmed_at": "2024-08-29T09:00:00Z", "completed_at": "2024-09-02T11:00:00Z", "created_at": "2024-08-29T08:00:00Z" } } }

Error 404:
{ "status": "error", "message": "Booking not found.", "errors": {} }

Error 403:
{ "status": "error", "message": "You are not authorized to view this booking.", "errors": {} }

---

## BOOKING-04 · Cancel Booking
Method: POST /api/v1/bookings/:id/cancel
Auth Required: Yes | Role: Customer
Tables Written: bookings (status, cancelled_at, status_history JSONB appended)

Allowed from: pending, confirmed (not in_progress, completed, or already cancelled)

Request Body:
- reason (string, optional)

Success 200:
{ "status": "success", "message": "Booking BC-4703 has been cancelled.", "data": { "booking": { "id": 47, "booking_code": "BC-4703", "status": "cancelled", "cancelled_at": "2024-08-30T10:00:00Z" } } }

Error 422:
{ "status": "error", "message": "Booking cannot be cancelled at this stage.", "errors": { "status": ["must be pending or confirmed to cancel"] } }

---

## BOOKING-05 · Apply Coupon to Booking
Method: POST /api/v1/bookings/:id/apply_coupon
Auth Required: Yes | Role: Customer
Tables Read: coupons, bookings | Tables Written: bookings

Only allowed when status = 'pending'

Request Body:
- coupon_code (string, required)

Success 200:
{ "status": "success", "message": "Coupon applied.", "data": { "booking": { "id": 47, "coupon": { "code": "BEAUTY20", "discount_type": "percentage", "discount_value": "20.00" }, "subtotal_amount": "898.00", "discount_amount": "179.60", "total_amount": "718.40" } } }

Error 422:
{ "status": "error", "message": "Coupon is invalid or expired.", "errors": { "coupon_code": ["is invalid or has expired"] } }

---

## BOOKING-06 · Remove Coupon from Booking
Method: DELETE /api/v1/bookings/:id/coupon
Auth Required: Yes | Role: Customer
Tables Written: bookings (coupon_id set to null, discount recalculated)

Only allowed when status = 'pending'

Success 200:
{ "status": "success", "message": "Coupon removed.", "data": { "booking": { "id": 47, "coupon": null, "subtotal_amount": "898.00", "discount_amount": "0.00", "total_amount": "898.00" } } }

---

## BOOKING-07 · Get Booking Price Summary
Method: GET /api/v1/bookings/:id/summary
Auth Required: Yes | Role: Customer
Tables Read: bookings, booking_items, coupons

Success 200:
{ "status": "success", "data": { "summary": { "items": [ { "service_title_snapshot": "Haircut & Style", "quantity": 1, "unit_price": "499.00", "total_price": "499.00" } ], "subtotal_amount": "499.00", "coupon_code": "BEAUTY20", "discount_amount": "99.80", "total_amount": "399.20" } } }

---

## BOOKING-08 · Check Review Eligibility
Method: GET /api/v1/bookings/:id/review_eligibility
Auth Required: Yes | Role: Customer
Tables Read: bookings, reviews

Success 200:
{ "status": "success", "data": { "eligible": true, "reason": null, "existing_review": null } }

Ineligible response:
{ "status": "success", "data": { "eligible": false, "reason": "Booking is not yet completed.", "existing_review": null } }

---

## BOOKING-09 · Submit Review
Method: POST /api/v1/bookings/:id/review
Auth Required: Yes | Role: Customer
Tables Read: bookings (must be completed, worker_id must be set)
Tables Written: reviews, worker_profiles (rating_avg, rating_count recalculated)

FK Used: reviews.booking_id → bookings.id (UNIQUE), reviews.customer_id → users.id, reviews.worker_id → users.id

Request Body:
- rating (integer, required, 1-5)
- comment (string, optional, max 1000 chars)

Success 201:
{ "status": "success", "message": "Review submitted. Thank you!", "data": { "review": { "id": 12, "booking_id": 47, "booking_code": "BC-4703", "worker": { "id": 1, "name": "Sunita Devi" }, "rating": 5, "comment": "Absolutely brilliant! Will book again!", "status": "published", "created_at": "2024-09-02T12:00:00Z" } } }

Error 422:
{ "status": "error", "message": "You have already submitted a review for this booking.", "errors": { "booking_id": ["already has a review"] } }

Error 422:
{ "status": "error", "message": "Booking must be completed before submitting a review.", "errors": { "status": ["booking is not completed"] } }

---

## BOOKING-10 · Get Review
Method: GET /api/v1/bookings/:id/review
Auth Required: Yes | Role: Customer
Tables Read: reviews

Success 200:
{ "status": "success", "data": { "review": { "id": 12, "rating": 5, "comment": "Absolutely brilliant!", "status": "published", "created_at": "2024-09-02T12:00:00Z" } } }

Error 404:
{ "status": "error", "message": "No review found for this booking.", "errors": {} }

---

## BOOKING-11 · List Customer Reviews
Method: GET /api/v1/me/reviews
Auth Required: Yes | Role: Customer
Tables Read: reviews, bookings, users (workers)

Query Parameters:
- page (integer, default 1)
- per_page (integer, default 10, max 50)

Success 200:
{ "status": "success", "data": { "reviews": [ { "id": 12, "booking_code": "BC-4703", "worker": { "id": 1, "name": "Sunita Devi", "specialty": "Hair Styling" }, "rating": 5, "comment": "Absolutely brilliant!", "status": "published", "created_at": "2024-09-02T12:00:00Z" } ] }, "meta": { "total_count": 8, "page": 1, "per_page": 10, "total_pages": 1 } }

---

## Worker Booking APIs

## BOOKING-12 · List Worker Assigned Bookings
Method: GET /api/v1/worker/bookings
Auth Required: Yes | Role: Worker
Tables Read: bookings, booking_items, users (customers)

Query Parameters:
- status (string, optional: pending, confirmed, in_progress, completed, cancelled)
- date_from (date YYYY-MM-DD, optional)
- date_to (date YYYY-MM-DD, optional)
- page (integer, default 1)
- per_page (integer, default 10, max 50)

Success 200:
{ "status": "success", "data": { "bookings": [ { "id": 47, "booking_code": "BC-4703", "status": "confirmed", "scheduled_at": "2024-09-02T10:00:00Z", "total_amount": "499.00", "items_count": 1, "first_service": "Haircut & Style", "customer": { "id": 1, "name": "Priya Sharma", "phone": "+919876543210" } } ] }, "meta": { "total_count": 5, "page": 1, "per_page": 10, "total_pages": 1 } }

---

## BOOKING-13 · Get Worker Booking Details
Method: GET /api/v1/worker/bookings/:id
Auth Required: Yes | Role: Worker
Tables Read: bookings, booking_items, users, payments

Success 200:
{ "status": "success", "data": { "booking": { "id": 47, "booking_code": "BC-4703", "status": "confirmed", "scheduled_at": "2024-09-02T10:00:00Z", "service_address": { "line1": "Flat 4B, Sunrise Apartments", "line2": "Bandra West", "city": "Mumbai", "pincode": "400050" }, "items": [ { "service_title_snapshot": "Haircut & Style", "unit_price": "499.00", "quantity": 1, "total_price": "499.00" } ], "total_amount": "499.00", "notes": "Please use organic products.", "customer": { "id": 1, "name": "Priya Sharma", "phone": "+919876543210" }, "status_history": [ { "status": "pending", "changed_at": "2024-08-29T08:00:00Z" }, { "status": "confirmed", "changed_at": "2024-08-29T09:00:00Z" } ], "confirmed_at": "2024-08-29T09:00:00Z" } } }

---

## BOOKING-14 · Update Booking Status (Worker)
Method: PATCH /api/v1/worker/bookings/:id/status
Auth Required: Yes | Role: Worker
Tables Written: bookings (status, status_history JSONB appended, relevant timestamp)

Allowed transitions for Worker:
- confirmed → in_progress (worker starts service)
- in_progress → completed (worker completes service)

Request Body:
- status (string, required: "in_progress" or "completed")
- note (string, optional)

Success 200:
{ "status": "success", "message": "Booking status updated to In Progress.", "data": { "booking": { "id": 47, "booking_code": "BC-4703", "status": "in_progress", "started_at": "2024-09-02T10:05:00Z" } } }

Error 422:
{ "status": "error", "message": "Invalid status transition.", "errors": { "status": ["cannot transition from 'pending' to 'completed'"] } }

Error 403:
{ "status": "error", "message": "You can only update bookings assigned to you.", "errors": {} }

---

## Booking Status Transition Reference

| Current Status | Action | New Status | Role | Endpoint |
|---|---|---|---|---|
| (new) | Create booking | pending | Customer | POST /api/v1/bookings |
| pending | Admin assigns worker | confirmed | Admin | Admin panel |
| confirmed | Worker starts service | in_progress | Worker | PATCH /api/v1/worker/bookings/:id/status |
| in_progress | Worker completes | completed | Worker | PATCH /api/v1/worker/bookings/:id/status |
| pending | Cancel | cancelled | Customer/Admin | POST /api/v1/bookings/:id/cancel |
| confirmed | Cancel | cancelled | Customer/Admin | POST /api/v1/bookings/:id/cancel |
| completed | Submit review | (review created) | Customer | POST /api/v1/bookings/:id/review |

Total Booking Endpoints: 14
