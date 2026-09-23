# WORKER API REFERENCE — BeautyNest /api/v1/worker

Tables: users, worker_profiles, worker_availabilities, bookings, booking_items, payments, reviews, notifications

Auth: JWT Bearer Token required
Role: worker

---

## Worker Profile APIs

## WORKER-01 · Get Worker Profile
Method: GET /api/v1/worker/profile
Auth Required: Yes | Role: Worker
Tables Read: users, worker_profiles

Success 200:
{ "status": "success", "data": { "user": { "id": 1, "name": "Sunita Devi", "email": "sunita.devi@gmail.com", "phone": "+919811122333", "city": "Mumbai", "status": "active" }, "worker_profile": { "id": 1, "specialty": "Hair Styling", "bio": "10 years of experience in professional hair styling.", "experience_years": 10, "approval_status": "approved", "rating_avg": "4.9", "rating_count": 142, "completed_jobs_count": 284, "category_ids": [1, 6], "documents": [ { "type": "aadhaar", "label": "Aadhaar Card", "verified": true } ] } } }

---

## WORKER-02 · Update Worker Profile
Method: PATCH /api/v1/worker/profile
Auth Required: Yes | Role: Worker
Tables Written: users, worker_profiles

Request Body (all optional):
- name (string)
- phone (string)
- city (string)
- specialty (string)
- bio (string, max 1000 chars)
- experience_years (integer, min 0)

Success 200:
{ "status": "success", "message": "Profile updated.", "data": { "worker_profile": { "id": 1, "specialty": "Hair Styling", "bio": "Updated bio.", "experience_years": 11 } } }

---

## WORKER-03 · Upload Verification Document
Method: POST /api/v1/worker/profile/documents
Auth Required: Yes | Role: Worker
Tables Written: worker_profiles (documents JSONB appended)

Request Body (multipart/form-data):
- document_type (string, required: aadhaar, pan, certificate, other)
- label (string, required, e.g. "Aadhaar Card")
- file (file, required, formats: pdf, jpg, png, max 5MB)

Success 201:
{ "status": "success", "message": "Document uploaded.", "data": { "document": { "type": "aadhaar", "label": "Aadhaar Card", "url": "https://storage.example.com/docs/worker-1-aadhaar.pdf", "verified": false, "uploaded_at": "2024-08-01T10:00:00Z" }, "all_documents": [ ... ] } }

Error 422:
{ "status": "error", "message": "Validation failed.", "errors": { "file": ["must be PDF, JPG, or PNG under 5MB"] } }

---

## WORKER-04 · Get Approval Status
Method: GET /api/v1/worker/profile/approval_status
Auth Required: Yes | Role: Worker
Tables Read: worker_profiles

Success 200:
{ "status": "success", "data": { "approval_status": "approved", "approved_at": "2024-08-15T12:00:00Z", "rejection_reason": null } }

Pending response:
{ "status": "success", "data": { "approval_status": "pending", "approved_at": null, "rejection_reason": null } }

Rejected response:
{ "status": "success", "data": { "approval_status": "rejected", "approved_at": null, "rejection_reason": "Incomplete documents provided." } }

---

## WORKER-05 · Get Worker Categories
Method: GET /api/v1/worker/categories
Auth Required: Yes | Role: Worker
Tables Read: worker_profiles (category_ids JSONB), categories

Success 200:
{ "status": "success", "data": { "categories": [ { "id": 1, "name": "Hair Care", "icon_name": "scissors" }, { "id": 6, "name": "Waxing", "icon_name": "wind" } ] } }

---

## Worker Availability APIs

## WORKER-06 · Get My Availability
Method: GET /api/v1/worker/availability
Auth Required: Yes | Role: Worker
Tables Read: worker_availabilities

FK: worker_availabilities.worker_profile_id → worker_profiles.id

Query Parameters:
- type (string, optional: recurring, override)
- date_from (date, optional, for override type)
- date_to (date, optional, for override type)

Success 200:
{ "status": "success", "data": { "recurring": [ { "id": 1, "availability_type": "recurring", "day_of_week": 1, "day_name": "Monday", "start_time": "09:00", "end_time": "18:00", "is_available": true, "notes": null }, { "id": 2, "availability_type": "recurring", "day_of_week": 0, "day_name": "Sunday", "start_time": "09:00", "end_time": "18:00", "is_available": false, "notes": "Day off" } ], "overrides": [ { "id": 10, "availability_type": "override", "specific_date": "2024-09-02", "start_time": "09:00", "end_time": "13:00", "is_available": true, "notes": "Available morning only" } ] } }

---

## WORKER-07 · Create Recurring Availability
Method: POST /api/v1/worker/availability/recurring
Auth Required: Yes | Role: Worker
Tables Written: worker_availabilities

Request Body:
- day_of_week (integer, required, 0-6: 0=Sunday, 6=Saturday)
- start_time (string, required, HH:MM format)
- end_time (string, required, HH:MM format, must be after start_time)
- is_available (boolean, required)
- notes (string, optional)

Success 201:
{ "status": "success", "message": "Availability created.", "data": { "availability": { "id": 3, "availability_type": "recurring", "day_of_week": 2, "day_name": "Tuesday", "start_time": "10:00", "end_time": "17:00", "is_available": true, "notes": null } } }

Error 422:
{ "status": "error", "message": "Validation failed.", "errors": { "end_time": ["must be after start time"], "day_of_week": ["must be between 0 and 6"] } }

---

## WORKER-08 · Update Recurring Availability
Method: PATCH /api/v1/worker/availability/recurring/:id
Auth Required: Yes | Role: Worker
Tables Written: worker_availabilities

Request Body (all optional):
- start_time, end_time, is_available, notes

Success 200:
{ "status": "success", "message": "Availability updated.", "data": { "availability": { "id": 3, "day_of_week": 2, "start_time": "09:00", "end_time": "17:00", "is_available": true } } }

Error 403:
{ "status": "error", "message": "This availability slot does not belong to you.", "errors": {} }

---

## WORKER-09 · Delete Recurring Availability
Method: DELETE /api/v1/worker/availability/recurring/:id
Auth Required: Yes | Role: Worker
Tables Written: worker_availabilities (row deleted)

Success 200:
{ "status": "success", "message": "Availability slot deleted.", "data": null }

---

## WORKER-10 · Create Date Override
Method: POST /api/v1/worker/availability/overrides
Auth Required: Yes | Role: Worker
Tables Written: worker_availabilities (availability_type = override)

Request Body:
- specific_date (date YYYY-MM-DD, required, must be future)
- start_time (string, HH:MM, required if is_available = true)
- end_time (string, HH:MM, required if is_available = true, must be after start_time)
- is_available (boolean, required)
- notes (string, optional, e.g. "Holiday")

Success 201:
{ "status": "success", "message": "Override created.", "data": { "availability": { "id": 11, "availability_type": "override", "specific_date": "2024-09-15", "start_time": null, "end_time": null, "is_available": false, "notes": "Holiday" } } }

---

## WORKER-11 · Update Date Override
Method: PATCH /api/v1/worker/availability/overrides/:id
Auth Required: Yes | Role: Worker
Tables Written: worker_availabilities

Request Body (all optional): specific_date, start_time, end_time, is_available, notes

Success 200:
{ "status": "success", "message": "Override updated.", "data": { "availability": { ... } } }

---

## WORKER-12 · Delete Date Override
Method: DELETE /api/v1/worker/availability/overrides/:id
Auth Required: Yes | Role: Worker
Tables Written: worker_availabilities (row deleted)

Success 200:
{ "status": "success", "message": "Override deleted.", "data": null }

---

## Worker Booking APIs (see BOOKING_API_REFERENCE.md for full detail)

WORKER-13 | GET   /api/v1/worker/bookings          | List assigned bookings (with status + date filters)
WORKER-14 | GET   /api/v1/worker/bookings/:id      | Full booking detail (customer info, items, address)
WORKER-15 | PATCH /api/v1/worker/bookings/:id/status | Update booking status (in_progress / completed)

---

## Worker Dashboard APIs

## WORKER-16 · Dashboard Summary
Method: GET /api/v1/worker/dashboard
Auth Required: Yes | Role: Worker
Tables Read: bookings, worker_profiles

Success 200:
{ "status": "success", "data": { "summary": { "pending_bookings": 2, "confirmed_bookings": 1, "active_booking": { "id": 47, "booking_code": "BC-4703", "customer": "Priya Sharma", "scheduled_at": "2024-09-02T10:00:00Z", "status": "confirmed" }, "completed_bookings_total": 284, "rating_avg": "4.9", "rating_count": 142, "this_month_jobs": 24, "this_month_earnings": "12400.00" } } }

---

## Worker Notifications APIs

WORKER-17 | GET   /api/v1/me/notifications                | List my notifications
WORKER-18 | GET   /api/v1/me/notifications/:id            | Get notification
WORKER-19 | PATCH /api/v1/me/notifications/:id/read       | Mark as read
WORKER-20 | PATCH /api/v1/me/notifications/read_all       | Mark all as read
WORKER-21 | GET   /api/v1/me/notifications/unread_count   | Unread badge count

---

## Worker Reviews APIs

## WORKER-22 · List My Reviews Received
Method: GET /api/v1/worker/reviews
Auth Required: Yes | Role: Worker
Tables Read: reviews, users (customers), bookings

Query Parameters:
- rating (integer, optional, 1-5)
- status (string, optional: published, flagged, hidden)
- page (integer, default 1)
- per_page (integer, default 10, max 50)

Success 200:
{ "status": "success", "data": { "reviews": [ { "id": 12, "booking_code": "BC-4703", "customer": { "id": 1, "name": "Priya Sharma" }, "rating": 5, "comment": "Absolutely brilliant! Will book again!", "status": "published", "created_at": "2024-09-02T12:00:00Z" } ] }, "meta": { "total_count": 142, "page": 1, "per_page": 10, "total_pages": 15, "avg_rating": "4.9", "rating_breakdown": { "5": 98, "4": 32, "3": 8, "2": 3, "1": 1 } } }

---

## WORKER-23 · Rating Summary
Method: GET /api/v1/worker/reviews/summary
Auth Required: Yes | Role: Worker
Tables Read: reviews, worker_profiles

Success 200:
{ "status": "success", "data": { "rating_summary": { "avg_rating": "4.9", "total_reviews": 142, "rating_breakdown": { "5": 98, "4": 32, "3": 8, "2": 3, "1": 1 }, "recent_reviews": [ { "id": 12, "rating": 5, "comment": "Brilliant!", "customer_name": "Priya Sharma", "created_at": "2024-09-02T12:00:00Z" } ] } } }

---

## Worker Earnings API (see PAYMENT_API_REFERENCE.md for full detail)

WORKER-24 | GET /api/v1/worker/earnings | Earnings summary + job list with date filters

---

## Complete Worker Booking Flow

Step 1: Worker logs in → GET /api/v1/auth/worker/login
Step 2: Worker views dashboard → GET /api/v1/worker/dashboard
Step 3: Worker views assigned bookings → GET /api/v1/worker/bookings
Step 4: Worker opens booking detail → GET /api/v1/worker/bookings/:id
         (sees customer name, phone, service address, items, scheduled time)
Step 5: Worker travels to location (on_the_way — implemented via status update or separate endpoint)
Step 6: Worker starts service → PATCH /api/v1/worker/bookings/:id/status { status: "in_progress" }
Step 7: Worker completes service → PATCH /api/v1/worker/bookings/:id/status { status: "completed" }
Step 8: System creates review_reminder notification for customer
Step 9: Worker views reviews → GET /api/v1/worker/reviews

Total Worker-Specific Endpoints: 24
(Plus 5 shared notification endpoints = 29 total worker endpoints)
