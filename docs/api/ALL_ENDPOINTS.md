# BeautyNest — Complete API Endpoint Reference
# All 64 Endpoints: Customer + Worker
# Base URL: /api/v1 | Auth: JWT Bearer Token

================================================================================
LEGEND: [C] = Customer Only  [W] = Worker Only  [P] = Public (No Auth)  [C/W] = Both
================================================================================

================================================================================
A. AUTHENTICATION  (9 endpoints)
================================================================================

#  | Method  | Endpoint                          | Auth | Role | Purpose
---|---------|-----------------------------------|------|------|---------------------------
1  | POST    | /api/v1/auth/register             | [P]  | —    | Register new customer
2  | POST    | /api/v1/auth/worker/register      | [P]  | —    | Register new worker
3  | POST    | /api/v1/auth/login                | [P]  | —    | Customer login → JWT
4  | POST    | /api/v1/auth/worker/login         | [P]  | —    | Worker login → JWT
5  | DELETE  | /api/v1/auth/logout               | Yes  | C/W  | Logout (invalidate token)
6  | GET     | /api/v1/auth/me                   | Yes  | C/W  | Get own profile
7  | PATCH   | /api/v1/auth/password             | Yes  | C/W  | Change password
8  | POST    | /api/v1/auth/forgot_password      | [P]  | —    | Request password reset email
9  | POST    | /api/v1/auth/reset_password       | [P]  | —    | Reset password via token

================================================================================
B. CUSTOMER PROFILE & ADDRESSES  (7 endpoints)
================================================================================

#  | Method  | Endpoint                              | Auth | Role | Purpose
---|---------|---------------------------------------|------|------|---------------------------
10 | PATCH   | /api/v1/me                            | Yes  | [C]  | Update name, phone, city
11 | GET     | /api/v1/me/addresses                  | Yes  | [C]  | List saved addresses
12 | POST    | /api/v1/me/addresses                  | Yes  | [C]  | Add new address
13 | PATCH   | /api/v1/me/addresses/:id              | Yes  | [C]  | Update address
14 | DELETE  | /api/v1/me/addresses/:id              | Yes  | [C]  | Delete address
15 | PATCH   | /api/v1/me/addresses/:id/set_default  | Yes  | [C]  | Set address as default
16 | GET     | /api/v1/me/payments                   | Yes  | [C]  | Customer payment history

================================================================================
C. CATALOG — CATEGORIES & SERVICES  (5 endpoints, Public)
================================================================================

#  | Method  | Endpoint                          | Auth | Role | Purpose
---|---------|-----------------------------------|------|------|---------------------------
17 | GET     | /api/v1/categories                | [P]  | —    | List all active categories
18 | GET     | /api/v1/categories/:id            | [P]  | —    | Category details
19 | GET     | /api/v1/categories/:id/services   | [P]  | —    | Services in a category
20 | GET     | /api/v1/services                  | [P]  | —    | List all services (with filters: category_id, search, min_price, max_price)
21 | GET     | /api/v1/services/:id              | [P]  | —    | Service details + images

================================================================================
D. COUPONS  (2 endpoints)
================================================================================

#  | Method  | Endpoint                          | Auth | Role | Purpose
---|---------|-----------------------------------|------|------|---------------------------
22 | GET     | /api/v1/coupons                   | Yes  | [C]  | List active/available coupons
23 | POST    | /api/v1/coupons/validate          | Yes  | [C]  | Validate coupon code against subtotal

================================================================================
E. BOOKINGS — CUSTOMER SIDE  (10 endpoints)
================================================================================

#  | Method  | Endpoint                                      | Auth | Role | Purpose
---|---------|-----------------------------------------------|------|------|---------------------------
24 | POST    | /api/v1/bookings                              | Yes  | [C]  | Create booking (multi-service + address + schedule + optional coupon)
25 | GET     | /api/v1/bookings                              | Yes  | [C]  | List my bookings (filter: status, date_from, date_to)
26 | GET     | /api/v1/bookings/:id                          | Yes  | [C]  | Full booking detail (items, worker, payment, status_history)
27 | POST    | /api/v1/bookings/:id/cancel                   | Yes  | [C]  | Cancel booking (allowed: pending, confirmed only)
28 | POST    | /api/v1/bookings/:id/apply_coupon             | Yes  | [C]  | Apply coupon to pending booking
29 | DELETE  | /api/v1/bookings/:id/coupon                   | Yes  | [C]  | Remove coupon from pending booking
30 | GET     | /api/v1/bookings/:id/summary                  | Yes  | [C]  | Price summary: subtotal, discount, total
31 | GET     | /api/v1/bookings/:id/review_eligibility       | Yes  | [C]  | Is this booking eligible for review?
32 | POST    | /api/v1/bookings/:id/review                   | Yes  | [C]  | Submit review (rating 1-5 + comment)
33 | GET     | /api/v1/bookings/:id/review                   | Yes  | [C]  | Get review for this booking

================================================================================
F. PAYMENTS — CUSTOMER SIDE  (6 endpoints)
================================================================================

#  | Method  | Endpoint                                      | Auth | Role | Purpose
---|---------|-----------------------------------------------|------|------|---------------------------
34 | POST    | /api/v1/bookings/:id/payment                  | Yes  | [C]  | Initiate payment (creates payment record, status=pending)
35 | POST    | /api/v1/bookings/:id/payment/verify           | Yes  | [C]  | Verify payment success (gateway callback)
36 | POST    | /api/v1/bookings/:id/payment/failure          | Yes  | [C]  | Record payment failure
37 | GET     | /api/v1/bookings/:id/payment                  | Yes  | [C]  | Get payment status
38 | GET     | /api/v1/bookings/:id/payment/refund           | Yes  | [C]  | Get refund status

================================================================================
G. REVIEWS — CUSTOMER SIDE  (1 endpoint)
================================================================================

#  | Method  | Endpoint                          | Auth | Role | Purpose
---|---------|-----------------------------------|------|------|---------------------------
39 | GET     | /api/v1/me/reviews                | Yes  | [C]  | List all my submitted reviews

================================================================================
H. NOTIFICATIONS — SHARED (Customer + Worker)  (5 endpoints)
================================================================================

#  | Method  | Endpoint                                      | Auth | Role | Purpose
---|---------|-----------------------------------------------|------|------|---------------------------
40 | GET     | /api/v1/me/notifications                      | Yes  | C/W  | List my notifications (filter: status, channel)
41 | GET     | /api/v1/me/notifications/:id                  | Yes  | C/W  | Get notification detail
42 | PATCH   | /api/v1/me/notifications/:id/read             | Yes  | C/W  | Mark notification as read
43 | PATCH   | /api/v1/me/notifications/read_all             | Yes  | C/W  | Mark all notifications as read
44 | GET     | /api/v1/me/notifications/unread_count         | Yes  | C/W  | Get unread notification count (badge)

================================================================================
I. WORKER — PROFILE & DOCUMENTS  (5 endpoints)
================================================================================

#  | Method  | Endpoint                                      | Auth | Role | Purpose
---|---------|-----------------------------------------------|------|------|---------------------------
45 | GET     | /api/v1/worker/profile                        | Yes  | [W]  | Get full worker profile + stats
46 | PATCH   | /api/v1/worker/profile                        | Yes  | [W]  | Update name, phone, city, specialty, bio, experience
47 | POST    | /api/v1/worker/profile/documents              | Yes  | [W]  | Upload verification document (aadhaar, pan, certificate)
48 | GET     | /api/v1/worker/profile/approval_status        | Yes  | [W]  | Check approval status (pending/approved/rejected + reason)
49 | GET     | /api/v1/worker/categories                     | Yes  | [W]  | Get my assigned service categories

================================================================================
J. WORKER — AVAILABILITY  (7 endpoints)
================================================================================

#  | Method  | Endpoint                                          | Auth | Role | Purpose
---|---------|---------------------------------------------------|------|------|---------------------------
50 | GET     | /api/v1/worker/availability                       | Yes  | [W]  | Get full availability (recurring + overrides)
51 | POST    | /api/v1/worker/availability/recurring             | Yes  | [W]  | Create recurring weekly slot (day_of_week, start_time, end_time)
52 | PATCH   | /api/v1/worker/availability/recurring/:id         | Yes  | [W]  | Update recurring slot
53 | DELETE  | /api/v1/worker/availability/recurring/:id         | Yes  | [W]  | Delete recurring slot
54 | POST    | /api/v1/worker/availability/overrides             | Yes  | [W]  | Create date-specific override (block a holiday, add extra day)
55 | PATCH   | /api/v1/worker/availability/overrides/:id         | Yes  | [W]  | Update override
56 | DELETE  | /api/v1/worker/availability/overrides/:id         | Yes  | [W]  | Delete override

================================================================================
K. WORKER — BOOKINGS  (3 endpoints)
================================================================================

#  | Method  | Endpoint                                      | Auth | Role | Purpose
---|---------|-----------------------------------------------|------|------|---------------------------
57 | GET     | /api/v1/worker/bookings                       | Yes  | [W]  | List my assigned bookings (filter: status, date_from, date_to)
58 | GET     | /api/v1/worker/bookings/:id                   | Yes  | [W]  | Full booking detail (customer info, address, items, schedule)
59 | PATCH   | /api/v1/worker/bookings/:id/status            | Yes  | [W]  | Update booking status (confirmed→in_progress | in_progress→completed)

================================================================================
L. WORKER — DASHBOARD & EARNINGS  (2 endpoints)
================================================================================

#  | Method  | Endpoint                          | Auth | Role | Purpose
---|---------|-----------------------------------|------|------|---------------------------
60 | GET     | /api/v1/worker/dashboard          | Yes  | [W]  | Dashboard summary (pending count, active job, completed total, rating, earnings)
61 | GET     | /api/v1/worker/earnings           | Yes  | [W]  | Earnings breakdown (jobs list, monthly total, filter by date)

================================================================================
M. WORKER — REVIEWS  (2 endpoints)
================================================================================

#  | Method  | Endpoint                              | Auth | Role | Purpose
---|---------|---------------------------------------|------|------|---------------------------
62 | GET     | /api/v1/worker/reviews                | Yes  | [W]  | List reviews I received (filter: rating, status)
63 | GET     | /api/v1/worker/reviews/summary        | Yes  | [W]  | Rating summary + breakdown (5-star: 98, 4-star: 32 ...)

================================================================================
N. CUSTOMER PAYMENT HISTORY  (already in section F / G)
================================================================================

#  | Method  | Endpoint                          | Auth | Role | Purpose
---|---------|-----------------------------------|------|------|---------------------------
64 | GET     | /api/v1/me/payments               | Yes  | [C]  | Full payment history (filter: status, date_from, date_to)

================================================================================
BOOKING STATUS TRANSITION REFERENCE
================================================================================

Current Status  | Action                  | New Status   | Who Can Do It
----------------|-------------------------|--------------|----------------
(new)           | Customer creates        | pending      | Customer (POST /api/v1/bookings)
pending         | Admin assigns worker    | confirmed    | Admin (Admin Panel only)
confirmed       | Worker starts service   | in_progress  | Worker (PATCH /api/v1/worker/bookings/:id/status)
in_progress     | Worker finishes         | completed    | Worker (PATCH /api/v1/worker/bookings/:id/status)
pending         | Customer/Admin cancels  | cancelled    | Customer (POST /api/v1/bookings/:id/cancel)
confirmed       | Customer/Admin cancels  | cancelled    | Customer (POST /api/v1/bookings/:id/cancel)

================================================================================
FINAL ENDPOINT COUNT SUMMARY
================================================================================

Module                        | Count
------------------------------|------
A. Authentication             |  9
B. Customer Profile/Addresses |  7
C. Catalog (Public)           |  5
D. Coupons                    |  2
E. Bookings (Customer)        | 10
F. Payments (Customer)        |  6
G. Reviews (Customer)         |  1
H. Notifications (Shared)     |  5
I. Worker Profile/Docs        |  5
J. Worker Availability        |  7
K. Worker Bookings            |  3
L. Worker Dashboard/Earnings  |  2
M. Worker Reviews             |  2
N. Customer Payment History   |  1 (same as #16 in B — counted once)
------------------------------|------
TOTAL UNIQUE ENDPOINTS        | 64

Customer-facing total : 37
Worker-facing total   : 29
Shared (C+W)          : 10 (Auth + Notifications overlap)
