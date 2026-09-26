# API INDEX — BeautyNest Mobile API v1

Base URL: /api/v1
Auth: JWT Bearer Token
Content-Type: application/json
Namespace: /api/v1

---

## AUTHENTICATION ENDPOINTS (9)

| # | Method | Endpoint | Auth | Role | Purpose |
|---|---|---|---|---|---|
| AUTH-01 | POST | /api/v1/auth/register | No | Public | Register customer |
| AUTH-02 | POST | /api/v1/auth/worker/register | No | Public | Register worker |
| AUTH-03 | POST | /api/v1/auth/login | No | Public | Customer login |
| AUTH-04 | POST | /api/v1/auth/worker/login | No | Public | Worker login |
| AUTH-05 | DELETE | /api/v1/auth/logout | Yes | C/W | Logout |
| AUTH-06 | GET | /api/v1/auth/me | Yes | C/W | Get current user |
| AUTH-07 | PATCH | /api/v1/auth/password | Yes | C/W | Change password |
| AUTH-08 | POST | /api/v1/auth/forgot_password | No | Public | Request password reset |
| AUTH-09 | POST | /api/v1/auth/reset_password | No | Public | Reset password via token |

---

## COMMON / SHARED ENDPOINTS (14)

| # | Method | Endpoint | Auth | Role | Purpose |
|---|---|---|---|---|---|
| COMMON-01 | GET | /api/v1/auth/me | Yes | C/W | Get profile |
| COMMON-02 | PATCH | /api/v1/me | Yes | Customer | Update profile |
| COMMON-03 | GET | /api/v1/me/addresses | Yes | Customer | List addresses |
| COMMON-04 | POST | /api/v1/me/addresses | Yes | Customer | Add address |
| COMMON-05 | PATCH | /api/v1/me/addresses/:id | Yes | Customer | Update address |
| COMMON-06 | DELETE | /api/v1/me/addresses/:id | Yes | Customer | Delete address |
| COMMON-07 | PATCH | /api/v1/me/addresses/:id/set_default | Yes | Customer | Set default address |
| COMMON-08 | GET | /api/v1/categories | No | Public | List categories |
| COMMON-09 | GET | /api/v1/categories/:id | No | Public | Category details |
| COMMON-10 | GET | /api/v1/categories/:id/services | No | Public | Services in category |
| COMMON-11 | GET | /api/v1/services | No | Public | List all services |
| COMMON-12 | GET | /api/v1/services/:id | No | Public | Service details |
| COMMON-13 | POST | /api/v1/coupons/validate | Yes | Customer | Validate coupon |
| COMMON-14 | GET | /api/v1/coupons | Yes | Customer | List active coupons |

---

## BOOKING ENDPOINTS (14)

| # | Method | Endpoint | Auth | Role | Purpose |
|---|---|---|---|---|---|
| BOOKING-01 | POST | /api/v1/bookings | Yes | Customer | Create booking |
| BOOKING-02 | GET | /api/v1/bookings | Yes | Customer | List my bookings |
| BOOKING-03 | GET | /api/v1/bookings/:id | Yes | Customer | Booking detail |
| BOOKING-04 | POST | /api/v1/bookings/:id/cancel | Yes | Customer | Cancel booking |
| BOOKING-05 | POST | /api/v1/bookings/:id/apply_coupon | Yes | Customer | Apply coupon |
| BOOKING-06 | DELETE | /api/v1/bookings/:id/coupon | Yes | Customer | Remove coupon |
| BOOKING-07 | GET | /api/v1/bookings/:id/summary | Yes | Customer | Price summary |
| BOOKING-08 | GET | /api/v1/bookings/:id/review_eligibility | Yes | Customer | Can review? |
| BOOKING-09 | POST | /api/v1/bookings/:id/review | Yes | Customer | Submit review |
| BOOKING-10 | GET | /api/v1/bookings/:id/review | Yes | Customer | Get review |
| BOOKING-11 | GET | /api/v1/me/reviews | Yes | Customer | List my reviews |
| BOOKING-12 | GET | /api/v1/worker/bookings | Yes | Worker | List assigned bookings |
| BOOKING-13 | GET | /api/v1/worker/bookings/:id | Yes | Worker | Booking detail |
| BOOKING-14 | PATCH | /api/v1/worker/bookings/:id/status | Yes | Worker | Update booking status |

---

## PAYMENT ENDPOINTS (7)

| # | Method | Endpoint | Auth | Role | Purpose |
|---|---|---|---|---|---|
| PAYMENT-01 | POST | /api/v1/bookings/:id/payment | Yes | Customer | Initiate payment |
| PAYMENT-02 | POST | /api/v1/bookings/:id/payment/verify | Yes | Customer | Verify payment |
| PAYMENT-03 | POST | /api/v1/bookings/:id/payment/failure | Yes | Customer | Record payment failure |
| PAYMENT-04 | GET | /api/v1/bookings/:id/payment | Yes | Customer | Payment status |
| PAYMENT-05 | GET | /api/v1/bookings/:id/payment/refund | Yes | Customer | Refund status |
| PAYMENT-06 | GET | /api/v1/me/payments | Yes | Customer | Payment history |
| PAYMENT-07 | GET | /api/v1/worker/earnings | Yes | Worker | Worker earnings |

---

## NOTIFICATION ENDPOINTS (5)

| # | Method | Endpoint | Auth | Role | Purpose |
|---|---|---|---|---|---|
| NOTIF-01 | GET | /api/v1/me/notifications | Yes | C/W | List notifications |
| NOTIF-02 | GET | /api/v1/me/notifications/:id | Yes | C/W | Get notification |
| NOTIF-03 | PATCH | /api/v1/me/notifications/:id/read | Yes | C/W | Mark as read |
| NOTIF-04 | PATCH | /api/v1/me/notifications/read_all | Yes | C/W | Mark all as read |
| NOTIF-05 | GET | /api/v1/me/notifications/unread_count | Yes | C/W | Unread count |

---

## WORKER-SPECIFIC ENDPOINTS (15)

| # | Method | Endpoint | Auth | Role | Purpose |
|---|---|---|---|---|---|
| WORKER-01 | GET | /api/v1/worker/profile | Yes | Worker | Get worker profile |
| WORKER-02 | PATCH | /api/v1/worker/profile | Yes | Worker | Update worker profile |
| WORKER-03 | POST | /api/v1/worker/profile/documents | Yes | Worker | Upload document |
| WORKER-04 | GET | /api/v1/worker/profile/approval_status | Yes | Worker | Get approval status |
| WORKER-05 | GET | /api/v1/worker/categories | Yes | Worker | Get my categories |
| WORKER-06 | GET | /api/v1/worker/availability | Yes | Worker | Get availability |
| WORKER-07 | POST | /api/v1/worker/availability/recurring | Yes | Worker | Create recurring slot |
| WORKER-08 | PATCH | /api/v1/worker/availability/recurring/:id | Yes | Worker | Update recurring slot |
| WORKER-09 | DELETE | /api/v1/worker/availability/recurring/:id | Yes | Worker | Delete recurring slot |
| WORKER-10 | POST | /api/v1/worker/availability/overrides | Yes | Worker | Create date override |
| WORKER-11 | PATCH | /api/v1/worker/availability/overrides/:id | Yes | Worker | Update override |
| WORKER-12 | DELETE | /api/v1/worker/availability/overrides/:id | Yes | Worker | Delete override |
| WORKER-16 | GET | /api/v1/worker/dashboard | Yes | Worker | Dashboard summary |
| WORKER-22 | GET | /api/v1/worker/reviews | Yes | Worker | My received reviews |
| WORKER-23 | GET | /api/v1/worker/reviews/summary | Yes | Worker | Rating summary |

---

## ENDPOINT COUNT SUMMARY

| Module | Count |
|---|---|
| Authentication | 9 |
| Common (Profile, Catalog, Coupons) | 14 |
| Booking | 14 |
| Payment | 7 |
| Notification | 5 |
| Worker-specific | 15 |
| **Total** | **64** |

---

## Customer Endpoints Total: 37
(Auth + Profile + Addresses + Catalog + Coupons + Bookings + Reviews + Payments + Notifications)

## Worker Endpoints Total: 29
(Auth + Worker Profile + Availability + Bookings + Dashboard + Reviews + Earnings + Notifications)

Note: Some endpoints (Auth, Notifications) serve both Customer and Worker.

---

## Documentation Files

| File | Contents |
|---|---|
| AUTH_API_REFERENCE.md | Register, Login, Logout, Password (9 endpoints) |
| COMMON_API_REFERENCE.md | Profile, Addresses, Categories, Services, Coupons (14 endpoints) |
| BOOKING_API_REFERENCE.md | Booking lifecycle, Reviews, Worker status updates (14 endpoints) |
| PAYMENT_API_REFERENCE.md | Payments, Verification, Refunds, Earnings (7 endpoints) |
| NOTIFICATION_API_REFERENCE.md | Notification list, read, count (5 endpoints) |
| CUSTOMER_API_REFERENCE.md | Full customer endpoint list + booking flow |
| WORKER_API_REFERENCE.md | Worker profile, availability, dashboard (15 worker-specific) |
| API_INDEX.md | This file — master index |

---

## Feature Coverage Matrix

| Feature | Mobile Screen | Endpoint(s) | Method | Table(s) | Auth | Role |
|---|---|---|---|---|---|---|
| Customer registration | Register screen | /api/v1/auth/register | POST | users | No | Public |
| Customer login | Login screen | /api/v1/auth/login | POST | users, sessions | No | Public |
| Customer logout | Profile screen | /api/v1/auth/logout | DELETE | sessions | Yes | Customer |
| Customer profile view | Profile screen | /api/v1/auth/me | GET | users | Yes | Customer |
| Customer profile update | Profile edit screen | /api/v1/me | PATCH | users | Yes | Customer |
| Change password | Security screen | /api/v1/auth/password | PATCH | users | Yes | Customer |
| Forgot/reset password | Auth screens | /api/v1/auth/forgot_password, reset_password | POST | users | No | Public |
| Customer saved addresses | Address list screen | /api/v1/me/addresses | GET | users | Yes | Customer |
| Add address | Add address screen | /api/v1/me/addresses | POST | users | Yes | Customer |
| Update address | Edit address screen | /api/v1/me/addresses/:id | PATCH | users | Yes | Customer |
| Delete address | Address list screen | /api/v1/me/addresses/:id | DELETE | users | Yes | Customer |
| Set default address | Address list screen | /api/v1/me/addresses/:id/set_default | PATCH | users | Yes | Customer |
| Browse categories | Home/discover screen | /api/v1/categories | GET | categories | No | Public |
| Browse services in category | Category screen | /api/v1/categories/:id/services | GET | categories, services | No | Public |
| Search / filter services | Search screen | /api/v1/services | GET | services | No | Public |
| View service detail | Service detail screen | /api/v1/services/:id | GET | services | No | Public |
| View available coupons | Coupons screen | /api/v1/coupons | GET | coupons | Yes | Customer |
| Validate coupon | Checkout screen | /api/v1/coupons/validate | POST | coupons | Yes | Customer |
| Create multi-service booking | Booking/cart screen | /api/v1/bookings | POST | bookings, booking_items | Yes | Customer |
| View booking price summary | Checkout summary | /api/v1/bookings/:id/summary | GET | bookings, booking_items | Yes | Customer |
| Apply coupon to booking | Checkout screen | /api/v1/bookings/:id/apply_coupon | POST | bookings, coupons | Yes | Customer |
| Remove coupon | Checkout screen | /api/v1/bookings/:id/coupon | DELETE | bookings | Yes | Customer |
| View booking list | My bookings screen | /api/v1/bookings | GET | bookings | Yes | Customer |
| View booking detail | Booking detail screen | /api/v1/bookings/:id | GET | bookings, booking_items, users, payments | Yes | Customer |
| Track booking status | Live tracking screen | /api/v1/bookings/:id | GET | bookings | Yes | Customer |
| Cancel booking | Booking detail screen | /api/v1/bookings/:id/cancel | POST | bookings | Yes | Customer |
| Initiate payment | Payment screen | /api/v1/bookings/:id/payment | POST | payments, bookings | Yes | Customer |
| Verify payment success | Payment success screen | /api/v1/bookings/:id/payment/verify | POST | payments | Yes | Customer |
| Record payment failure | Payment failure screen | /api/v1/bookings/:id/payment/failure | POST | payments | Yes | Customer |
| View payment status | Booking detail screen | /api/v1/bookings/:id/payment | GET | payments | Yes | Customer |
| View refund status | Booking detail screen | /api/v1/bookings/:id/payment/refund | GET | payments | Yes | Customer |
| Payment history | Payment history screen | /api/v1/me/payments | GET | payments | Yes | Customer |
| Check review eligibility | Post-service screen | /api/v1/bookings/:id/review_eligibility | GET | bookings, reviews | Yes | Customer |
| Submit review | Review screen | /api/v1/bookings/:id/review | POST | reviews, worker_profiles | Yes | Customer |
| View my reviews | Review history screen | /api/v1/me/reviews | GET | reviews | Yes | Customer |
| View notifications | Notifications screen | /api/v1/me/notifications | GET | notifications | Yes | Customer |
| Mark notification read | Notification detail | /api/v1/me/notifications/:id/read | PATCH | notifications | Yes | Customer |
| Notification badge count | App tab bar | /api/v1/me/notifications/unread_count | GET | notifications | Yes | Customer |
| Worker registration | Register screen | /api/v1/auth/worker/register | POST | users, worker_profiles | No | Public |
| Worker login | Login screen | /api/v1/auth/worker/login | POST | users, sessions | No | Public |
| Worker profile view | Profile screen | /api/v1/worker/profile | GET | users, worker_profiles | Yes | Worker |
| Worker profile update | Profile edit screen | /api/v1/worker/profile | PATCH | users, worker_profiles | Yes | Worker |
| Upload verification doc | Documents screen | /api/v1/worker/profile/documents | POST | worker_profiles | Yes | Worker |
| Check approval status | Approval screen | /api/v1/worker/profile/approval_status | GET | worker_profiles | Yes | Worker |
| View assigned categories | Profile screen | /api/v1/worker/categories | GET | worker_profiles, categories | Yes | Worker |
| View availability | Availability screen | /api/v1/worker/availability | GET | worker_availabilities | Yes | Worker |
| Create recurring slot | Availability screen | /api/v1/worker/availability/recurring | POST | worker_availabilities | Yes | Worker |
| Update recurring slot | Availability screen | /api/v1/worker/availability/recurring/:id | PATCH | worker_availabilities | Yes | Worker |
| Delete recurring slot | Availability screen | /api/v1/worker/availability/recurring/:id | DELETE | worker_availabilities | Yes | Worker |
| Create date override | Availability screen | /api/v1/worker/availability/overrides | POST | worker_availabilities | Yes | Worker |
| Update date override | Availability screen | /api/v1/worker/availability/overrides/:id | PATCH | worker_availabilities | Yes | Worker |
| Delete date override | Availability screen | /api/v1/worker/availability/overrides/:id | DELETE | worker_availabilities | Yes | Worker |
| Worker dashboard | Dashboard screen | /api/v1/worker/dashboard | GET | bookings, worker_profiles | Yes | Worker |
| List assigned bookings | Jobs screen | /api/v1/worker/bookings | GET | bookings, booking_items | Yes | Worker |
| View booking detail | Job detail screen | /api/v1/worker/bookings/:id | GET | bookings, booking_items, users | Yes | Worker |
| Start service | Job detail screen | /api/v1/worker/bookings/:id/status | PATCH | bookings | Yes | Worker |
| Complete service | Job detail screen | /api/v1/worker/bookings/:id/status | PATCH | bookings | Yes | Worker |
| View earnings | Earnings screen | /api/v1/worker/earnings | GET | bookings, payments | Yes | Worker |
| View received reviews | Reviews screen | /api/v1/worker/reviews | GET | reviews | Yes | Worker |
| Rating summary | Profile/stats screen | /api/v1/worker/reviews/summary | GET | reviews, worker_profiles | Yes | Worker |
| Worker notifications | Notifications screen | /api/v1/me/notifications | GET | notifications | Yes | Worker |

---

## FINAL ENDPOINT COUNT

| Category | Endpoints |
|---|---|
| Authentication Endpoints | 9 |
| Common Endpoints (Profile, Address, Catalog, Coupons) | 14 |
| Booking Endpoints | 14 |
| Payment Endpoints | 7 |
| Notification Endpoints | 5 |
| Worker-Specific Endpoints | 15 |
| **TOTAL** | **64** |

Customer-facing total: 37
Worker-facing total: 29
Shared (Customer + Worker): 10 (auth + notifications)
