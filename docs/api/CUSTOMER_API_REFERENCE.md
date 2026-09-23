# CUSTOMER API REFERENCE — BeautyNest /api/v1 (Customer Role)

Tables: users, sessions, categories, services, coupons, bookings, booking_items, payments, reviews, notifications

Auth: JWT Bearer Token required on all authenticated endpoints
Role: customer

This file is a consolidated reference for Customer-facing APIs.
Full endpoint detail is in individual reference files.

---

## Profile APIs (see COMMON_API_REFERENCE.md for full detail)

CUST-01 | GET    /api/v1/auth/me             | Get own profile
CUST-02 | PATCH  /api/v1/me                  | Update name, phone, city
CUST-03 | PATCH  /api/v1/auth/password       | Change password
CUST-04 | GET    /api/v1/me/addresses        | List saved addresses
CUST-05 | POST   /api/v1/me/addresses        | Add new address
CUST-06 | PATCH  /api/v1/me/addresses/:id    | Update address
CUST-07 | DELETE /api/v1/me/addresses/:id    | Delete address
CUST-08 | PATCH  /api/v1/me/addresses/:id/set_default | Set default address

---

## Catalog APIs (Public — no auth required)

CUST-09  | GET /api/v1/categories             | List active categories
CUST-10  | GET /api/v1/categories/:id         | Category details
CUST-11  | GET /api/v1/categories/:id/services| Services in category
CUST-12  | GET /api/v1/services               | List all services (with filters)
CUST-13  | GET /api/v1/services/:id           | Service details + images

---

## Coupon APIs

CUST-14  | GET  /api/v1/coupons              | List available/active coupons
CUST-15  | POST /api/v1/coupons/validate     | Validate coupon against subtotal

---

## Booking APIs (see BOOKING_API_REFERENCE.md for full detail)

CUST-16  | POST   /api/v1/bookings                        | Create booking (multi-service)
CUST-17  | GET    /api/v1/bookings                        | List my bookings (with status filter)
CUST-18  | GET    /api/v1/bookings/:id                    | Booking details + items + worker + payment + status_history
CUST-19  | POST   /api/v1/bookings/:id/cancel             | Cancel booking
CUST-20  | POST   /api/v1/bookings/:id/apply_coupon       | Apply coupon to pending booking
CUST-21  | DELETE /api/v1/bookings/:id/coupon             | Remove coupon from pending booking
CUST-22  | GET    /api/v1/bookings/:id/summary            | Price summary + discount breakdown
CUST-23  | GET    /api/v1/bookings/:id/review_eligibility | Can this booking be reviewed?
CUST-24  | POST   /api/v1/bookings/:id/review             | Submit review (rating + comment)
CUST-25  | GET    /api/v1/bookings/:id/review             | Get review for this booking

---

## Review APIs

CUST-26  | GET /api/v1/me/reviews           | List all my submitted reviews

---

## Payment APIs (see PAYMENT_API_REFERENCE.md for full detail)

CUST-27  | POST /api/v1/bookings/:id/payment         | Initiate payment
CUST-28  | POST /api/v1/bookings/:id/payment/verify  | Verify payment (gateway callback)
CUST-29  | POST /api/v1/bookings/:id/payment/failure | Record payment failure
CUST-30  | GET  /api/v1/bookings/:id/payment         | Get payment status
CUST-31  | GET  /api/v1/bookings/:id/payment/refund  | Get refund status
CUST-32  | GET  /api/v1/me/payments                  | Full payment history

---

## Notification APIs (see NOTIFICATION_API_REFERENCE.md for full detail)

CUST-33  | GET   /api/v1/me/notifications                  | List my notifications
CUST-34  | GET   /api/v1/me/notifications/:id             | Get notification
CUST-35  | PATCH /api/v1/me/notifications/:id/read        | Mark as read
CUST-36  | PATCH /api/v1/me/notifications/read_all        | Mark all as read
CUST-37  | GET   /api/v1/me/notifications/unread_count    | Get unread badge count

---

## Complete Customer Booking Flow

Step 1: Browse — GET /api/v1/categories
Step 2: Pick category — GET /api/v1/categories/:id/services
Step 3: View service — GET /api/v1/services/:id
Step 4: Create booking with items — POST /api/v1/bookings
Step 5: View price summary — GET /api/v1/bookings/:id/summary
Step 6: Apply coupon (optional) — POST /api/v1/bookings/:id/apply_coupon
Step 7: View updated summary — GET /api/v1/bookings/:id/summary
Step 8: Pay — POST /api/v1/bookings/:id/payment
Step 9: Verify payment — POST /api/v1/bookings/:id/payment/verify
Step 10: Track booking — GET /api/v1/bookings/:id
Step 11: (Worker assigned by admin → Customer sees worker in booking detail)
Step 12: (Worker updates status → Customer tracks via GET /api/v1/bookings/:id)
Step 13: After completion — POST /api/v1/bookings/:id/review

Total Customer Endpoints: 37
