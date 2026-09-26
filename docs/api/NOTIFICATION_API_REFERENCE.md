# NOTIFICATION API REFERENCE — BeautyNest /api/v1

Tables: notifications, users

---

## Notification Channels
Values: push, email, sms

## Notification recipient_type Values
- all_customers: Broadcast to all customers
- all_workers: Broadcast to all workers
- all_admins: Admin-facing broadcast
- pending_workers: Workers with approval_status = pending
- specific_user: Individual user (user_id FK is set)

## When Notifications Are Created (Triggers)
1. Booking created → notification to customer (booking_created)
2. Worker assigned to booking → notification to customer + worker (worker_assigned)
3. Worker starts travel → notification to customer (worker_on_the_way)
4. Worker arrives → notification to customer (worker_arrived)
5. Service started → notification to customer (service_started)
6. Service completed → notification to customer (service_completed)
7. Booking cancelled → notification to customer + worker (booking_cancelled)
8. Payment confirmed → notification to customer (payment_completed)
9. Refund initiated → notification to customer (refund_initiated)
10. Review reminder (after completion) → notification to customer (review_reminder)

Note: Notification records are created by the system/admin. The mobile app only reads them.

---

## NOTIF-01 · List My Notifications
Method: GET /api/v1/me/notifications
Auth Required: Yes | Role: Customer / Worker
Tables Read: notifications (where user_id = current_user.id OR recipient_type matches role)

Query Parameters:
- status (string, optional: pending, sent, failed)
- channel (string, optional: push, email, sms)
- page (integer, default 1)
- per_page (integer, default 20, max 50)

Success 200:
{ "status": "success", "data": { "notifications": [ { "id": 2, "channel": "email", "subject": "Your booking confirmed", "body": "Your booking BC-4702 for Haircut & Style has been confirmed.", "status": "sent", "sent_at": "2024-08-27T09:00:00Z", "read": false }, { "id": 1, "channel": "push", "subject": "Monsoon Special Offers", "body": "Get up to 30% off on all services this monsoon season!", "status": "sent", "sent_at": "2024-08-28T08:00:00Z", "read": true } ] }, "meta": { "total_count": 8, "page": 1, "per_page": 20, "total_pages": 1, "unread_count": 3 } }

---

## NOTIF-02 · Get Notification
Method: GET /api/v1/me/notifications/:id
Auth Required: Yes | Role: Customer / Worker
Tables Read: notifications

Success 200:
{ "status": "success", "data": { "notification": { "id": 2, "channel": "email", "subject": "Your booking confirmed", "body": "Your booking BC-4702 for Haircut & Style has been confirmed.", "status": "sent", "sent_at": "2024-08-27T09:00:00Z", "read": true } } }

Error 404:
{ "status": "error", "message": "Notification not found.", "errors": {} }

---

## NOTIF-03 · Mark Notification as Read
Method: PATCH /api/v1/me/notifications/:id/read
Auth Required: Yes | Role: Customer / Worker
Tables Written: notifications (read state tracked — implementation note: can use a read_at timestamp column added to notifications table, or a separate read tracking mechanism)

Implementation Note: The current notifications table does not include a read_at column.
During implementation, add read_at TIMESTAMPTZ NULL to notifications to track per-user read state.
Alternatively, implement a separate notification_reads join table if broadcast read-tracking per user is needed.
For initial implementation: add read_at to notifications (suitable for specific_user notifications).

Success 200:
{ "status": "success", "message": "Notification marked as read.", "data": { "notification": { "id": 2, "read": true } } }

---

## NOTIF-04 · Mark All Notifications as Read
Method: PATCH /api/v1/me/notifications/read_all
Auth Required: Yes | Role: Customer / Worker
Tables Written: notifications

Success 200:
{ "status": "success", "message": "All notifications marked as read.", "data": { "updated_count": 3 } }

---

## NOTIF-05 · Get Unread Count
Method: GET /api/v1/me/notifications/unread_count
Auth Required: Yes | Role: Customer / Worker
Tables Read: notifications

Success 200:
{ "status": "success", "data": { "unread_count": 3 } }

---

## Notification Trigger Reference

| Event | Recipient | Channel | Subject | Body |
|---|---|---|---|---|
| Booking created | Customer | push + email | Your booking is received | Booking BC-XXXX for {service} received. |
| Worker assigned | Customer | push + email | Worker assigned to your booking | {worker_name} will visit you on {date}. |
| Worker assigned | Worker | push | New booking assigned | You have a new booking on {date}. |
| Worker on the way | Customer | push | Your worker is on the way | {worker_name} is heading to your location. |
| Worker arrived | Customer | push | Worker has arrived | {worker_name} has arrived at your location. |
| Service started | Customer | push | Service started | Your {service} session has begun. |
| Service completed | Customer | push + email | Service completed | Your session is complete. Rate your experience! |
| Booking cancelled | Customer | push + email | Booking cancelled | Your booking BC-XXXX has been cancelled. |
| Booking cancelled | Worker | push | Assignment cancelled | Booking BC-XXXX has been cancelled. |
| Payment completed | Customer | push + email | Payment confirmed | Payment of {amount} for BC-XXXX is confirmed. |
| Refund initiated | Customer | push + email | Refund initiated | Refund of {amount} is being processed (3-5 days). |
| Review reminder | Customer | push | Rate your experience | How was your session with {worker_name}? |

Total Notification Endpoints: 5
