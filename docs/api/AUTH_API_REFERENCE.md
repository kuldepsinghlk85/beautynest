# AUTH API REFERENCE — BeautyNest /api/v1/auth

**Auth Method**: JWT Bearer Token
**Tables Used**: users, sessions
**Namespace**: /api/v1/auth

---

## Standard Response Envelope

`json
// Success
{ "status": "success", "message": "...", "data": { ... } }

// Error
{ "status": "error", "message": "...", "errors": { "field": ["msg"] } }
`

---

## AUTH-01 · Register Customer
Method: POST /api/v1/auth/register
Auth Required: No | Role: Public
Tables Written: users

Request Body:
- name (string, required, 2-255 chars)
- email (string, required, valid email, unique)
- password (string, required, min 8 chars)
- password_confirmation (string, required, must match password)
- phone (string, optional, 10-15 digits)

Example Request:
POST /api/v1/auth/register
{ "name": "Priya Sharma", "email": "priya@gmail.com", "password": "secret123", "password_confirmation": "secret123", "phone": "+919876543210" }

Success 201:
{ "status": "success", "message": "Account created successfully.", "data": { "token": "eyJ...", "user": { "id": 1, "name": "Priya Sharma", "email": "priya@gmail.com", "phone": "+919876543210", "role": "customer", "status": "active", "city": null, "addresses": [], "created_at": "2024-08-28T08:00:00Z" } } }

Error 422:
{ "status": "error", "message": "Validation failed.", "errors": { "email": ["has already been taken"], "password": ["is too short (minimum is 8 characters)"] } }

---

## AUTH-02 · Register Worker
Method: POST /api/v1/auth/worker/register
Auth Required: No | Role: Public
Tables Written: users, worker_profiles

Request Body:
- name (string, required)
- email (string, required, unique)
- password (string, required, min 8 chars)
- password_confirmation (string, required)
- phone (string, required)
- city (string, required)
- specialty (string, required)

Success 201:
{ "status": "success", "message": "Registration submitted. Your account is pending admin approval.", "data": { "token": "eyJ...", "user": { "id": 8, "role": "worker", "status": "active" }, "worker_profile": { "id": 5, "specialty": "Hair Styling", "approval_status": "pending", "rating_avg": "0.0", "completed_jobs_count": 0 } } }

---

## AUTH-03 · Customer Login
Method: POST /api/v1/auth/login
Auth Required: No | Role: Public
Tables Read: users | Tables Written: sessions

Request Body:
- email (string, required)
- password (string, required)

Success 200:
{ "status": "success", "message": "Login successful.", "data": { "token": "eyJ...", "user": { "id": 1, "name": "Priya Sharma", "email": "priya@gmail.com", "role": "customer", "status": "active", "city": "Mumbai", "addresses": [] } } }

Errors:
- 401: Invalid email or password
- 403: Account suspended

---

## AUTH-04 · Worker Login
Method: POST /api/v1/auth/worker/login
Auth Required: No | Role: Public
Tables Read: users, worker_profiles | Tables Written: sessions

Request Body:
- email (string, required)
- password (string, required)

Success 200:
{ "status": "success", "message": "Login successful.", "data": { "token": "eyJ...", "user": { "id": 1, "name": "Sunita Devi", "role": "worker", "status": "active" }, "worker_profile": { "id": 1, "specialty": "Hair Styling", "approval_status": "approved", "rating_avg": "4.9", "completed_jobs_count": 284 } } }

---

## AUTH-05 · Logout
Method: DELETE /api/v1/auth/logout
Auth Required: Yes | Role: Customer / Worker
Headers: Authorization: Bearer <token>
Tables Written: sessions (token invalidated)

Success 200:
{ "status": "success", "message": "Logged out successfully.", "data": null }

---

## AUTH-06 · Get Current User
Method: GET /api/v1/auth/me
Auth Required: Yes | Role: Customer / Worker
Tables Read: users, worker_profiles (if worker)

Success 200 (Customer):
{ "status": "success", "data": { "user": { "id": 1, "name": "Priya Sharma", "email": "priya@gmail.com", "phone": "+919876543210", "role": "customer", "status": "active", "city": "Mumbai", "addresses": [] } } }

Success 200 (Worker):
{ "status": "success", "data": { "user": { "id": 1, "name": "Sunita Devi", "role": "worker" }, "worker_profile": { "id": 1, "specialty": "Hair Styling", "bio": "10 years experience.", "approval_status": "approved", "rating_avg": "4.9", "rating_count": 142, "completed_jobs_count": 284, "category_ids": [1, 6] } } }

---

## AUTH-07 · Change Password
Method: PATCH /api/v1/auth/password
Auth Required: Yes | Role: Customer / Worker
Tables Written: users

Request Body:
- current_password (string, required)
- password (string, required, min 8 chars)
- password_confirmation (string, required)

Success 200:
{ "status": "success", "message": "Password changed successfully.", "data": null }

Error 422:
{ "status": "error", "message": "Current password is incorrect.", "errors": { "current_password": ["is incorrect"] } }

---

## AUTH-08 · Forgot Password
Method: POST /api/v1/auth/forgot_password
Auth Required: No | Role: Public
Tables Written: users (reset_password_token, reset_password_sent_at)

Request Body:
- email (string, required)

Success 200:
{ "status": "success", "message": "If that email exists, a password reset link has been sent.", "data": null }
Note: Same response regardless of whether email exists (prevents user enumeration).

---

## AUTH-09 · Reset Password
Method: POST /api/v1/auth/reset_password
Auth Required: No | Role: Public
Tables Written: users (clears reset token, updates password)

Request Body:
- token (string, required, valid non-expired reset token)
- password (string, required, min 8 chars)
- password_confirmation (string, required)

Success 200:
{ "status": "success", "message": "Password reset successfully. Please log in.", "data": null }

Error 422:
{ "status": "error", "message": "Reset token is invalid or has expired.", "errors": {} }

---

## Standard Auth Error Codes

| Code | Scenario |
|---|---|
| 401 | Missing or invalid JWT |
| 403 | Valid token but wrong role |
| 422 | Validation failure |
| 429 | Rate limit exceeded |

Standard 401: { "status": "error", "message": "Authentication required. Please log in.", "errors": {} }
Standard 403: { "status": "error", "message": "You are not authorized to perform this action.", "errors": {} }

Total Auth Endpoints: 9
