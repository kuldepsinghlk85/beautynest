# COMMON API REFERENCE — BeautyNest /api/v1

Tables: users, categories, services, coupons

---

## COMMON-01 · Get Customer Profile
Method: GET /api/v1/me
Auth Required: Yes | Role: Customer
Tables Read: users

Success 200:
{ "status": "success", "data": { "user": { "id": 1, "name": "Priya Sharma", "email": "priya@gmail.com", "phone": "+919876543210", "city": "Mumbai", "status": "active", "addresses": [ { "label": "Home", "line1": "Flat 4B, Sunrise Apartments", "line2": "Bandra West", "city": "Mumbai", "pincode": "400050", "is_default": true } ] } } }

---

## COMMON-02 · Update Customer Profile
Method: PATCH /api/v1/me
Auth Required: Yes | Role: Customer
Tables Written: users

Request Body (all optional):
- name (string, 2-255 chars)
- phone (string, 10-15 digits)
- city (string)

Success 200:
{ "status": "success", "message": "Profile updated.", "data": { "user": { "id": 1, "name": "Priya Sharma", "phone": "+919876543210", "city": "Delhi" } } }

---

## COMMON-03 · List Customer Addresses
Method: GET /api/v1/me/addresses
Auth Required: Yes | Role: Customer
Tables Read: users (addresses JSONB column)

Success 200:
{ "status": "success", "data": { "addresses": [ { "id": "addr-1", "label": "Home", "line1": "Flat 4B", "line2": "Bandra West", "city": "Mumbai", "pincode": "400050", "is_default": true }, { "id": "addr-2", "label": "Work", "line1": "Tower 2, BKC", "line2": null, "city": "Mumbai", "pincode": "400051", "is_default": false } ] } }

---

## COMMON-04 · Add Address
Method: POST /api/v1/me/addresses
Auth Required: Yes | Role: Customer
Tables Written: users (appends to addresses JSONB)

Request Body:
- label (string, required, e.g. "Home", "Work")
- line1 (string, required)
- line2 (string, optional)
- city (string, required)
- pincode (string, required, 6 digits)
- is_default (boolean, optional, default false)

Success 201:
{ "status": "success", "message": "Address added.", "data": { "addresses": [ ... ] } }

Error 422:
{ "status": "error", "message": "Validation failed.", "errors": { "pincode": ["is invalid"] } }

---

## COMMON-05 · Update Address
Method: PATCH /api/v1/me/addresses/:address_id
Auth Required: Yes | Role: Customer
Tables Written: users (updates matching entry in addresses JSONB)

Path Parameters:
- address_id: Address identifier within JSONB array

Request Body (all optional):
- label, line1, line2, city, pincode, is_default

Success 200:
{ "status": "success", "message": "Address updated.", "data": { "addresses": [ ... ] } }

Error 404:
{ "status": "error", "message": "Address not found.", "errors": {} }

---

## COMMON-06 · Delete Address
Method: DELETE /api/v1/me/addresses/:address_id
Auth Required: Yes | Role: Customer
Tables Written: users (removes entry from addresses JSONB)

Success 200:
{ "status": "success", "message": "Address removed.", "data": { "addresses": [ ... ] } }

---

## COMMON-07 · Set Default Address
Method: PATCH /api/v1/me/addresses/:address_id/set_default
Auth Required: Yes | Role: Customer
Tables Written: users

Success 200:
{ "status": "success", "message": "Default address updated.", "data": { "addresses": [ ... ] } }

---

## COMMON-08 · List Categories
Method: GET /api/v1/categories
Auth Required: No | Role: Public
Tables Read: categories

Query Parameters:
- status (string, default "active") — filter by active/inactive
- page (integer, default 1)
- per_page (integer, default 20, max 50)

Success 200:
{ "status": "success", "data": { "categories": [ { "id": 1, "name": "Hair Care", "description": "Haircuts, styling, coloring, treatments", "icon_name": "scissors", "display_order": 1, "status": "active" }, { "id": 2, "name": "Skincare", "description": "Facials, cleanup, anti-aging treatments", "icon_name": "zap", "display_order": 2, "status": "active" } ] }, "meta": { "total_count": 7, "page": 1, "per_page": 20, "total_pages": 1 } }

---

## COMMON-09 · Get Category Details
Method: GET /api/v1/categories/:id
Auth Required: No | Role: Public
Tables Read: categories

Success 200:
{ "status": "success", "data": { "category": { "id": 1, "name": "Hair Care", "description": "Haircuts, styling, coloring, treatments", "icon_name": "scissors", "display_order": 1, "status": "active", "services_count": 14 } } }

Error 404:
{ "status": "error", "message": "Category not found.", "errors": {} }

---

## COMMON-10 · List Services in Category
Method: GET /api/v1/categories/:id/services
Auth Required: No | Role: Public
Tables Read: categories, services

Query Parameters:
- page (integer, default 1)
- per_page (integer, default 20, max 50)
- sort (string: "price_asc", "price_desc", "duration_asc", "name")

Success 200:
{ "status": "success", "data": { "category": { "id": 1, "name": "Hair Care" }, "services": [ { "id": 1, "name": "Haircut & Style", "description": "...", "price": "499.00", "duration_minutes": 60, "status": "active", "images": [ { "url": "https://storage.example.com/services/haircut-1.webp", "alt": "Haircut example", "is_primary": true } ] } ] }, "meta": { "total_count": 14, "page": 1, "per_page": 20, "total_pages": 1 } }

---

## COMMON-11 · List All Services
Method: GET /api/v1/services
Auth Required: No | Role: Public
Tables Read: services, categories

Query Parameters:
- category_id (integer, optional)
- search (string, optional, searches name and description)
- status (string, default "active")
- min_price (decimal, optional)
- max_price (decimal, optional)
- max_duration (integer, optional, in minutes)
- sort (string: "price_asc", "price_desc", "duration_asc", "name")
- page (integer, default 1)
- per_page (integer, default 20, max 50)

Success 200:
{ "status": "success", "data": { "services": [ { "id": 1, "name": "Haircut & Style", "category": { "id": 1, "name": "Hair Care" }, "price": "499.00", "duration_minutes": 60, "status": "active", "images": [] } ] }, "meta": { "total_count": 15, "page": 1, "per_page": 20, "total_pages": 1 } }

---

## COMMON-12 · Get Service Details
Method: GET /api/v1/services/:id
Auth Required: No | Role: Public
Tables Read: services, categories

Success 200:
{ "status": "success", "data": { "service": { "id": 1, "name": "Haircut & Style", "description": "Professional haircut and style tailored to your face shape.", "category": { "id": 1, "name": "Hair Care", "icon_name": "scissors" }, "price": "499.00", "duration_minutes": 60, "status": "active", "images": [ { "url": "https://storage.example.com/services/haircut-1.webp", "alt": "Haircut example", "is_primary": true } ] } } }

Error 404:
{ "status": "error", "message": "Service not found.", "errors": {} }

---

## COMMON-13 · Validate Coupon
Method: POST /api/v1/coupons/validate
Auth Required: Yes | Role: Customer
Tables Read: coupons

Request Body:
- code (string, required)
- subtotal (decimal, required) — current booking subtotal to check min_order_amount

Success 200:
{ "status": "success", "message": "Coupon is valid.", "data": { "coupon": { "id": 3, "code": "BRIDE2024", "discount_type": "percentage", "discount_value": "15.00", "min_order_amount": "5000.00", "max_discount_amount": null, "valid_until": "2024-12-31T23:59:59Z", "calculated_discount": "1349.00" } } }

Error 422:
{ "status": "error", "message": "Coupon code is invalid or expired.", "errors": { "code": ["is invalid or expired"] } }

Error 422 (minimum not met):
{ "status": "error", "message": "Minimum order amount not met.", "errors": { "code": ["requires a minimum order of ₹5,000"] } }

---

## COMMON-14 · List Available Coupons
Method: GET /api/v1/coupons
Auth Required: Yes | Role: Customer
Tables Read: coupons

Query Parameters:
- page (integer, default 1)
- per_page (integer, default 20)

Returns only active, non-expired coupons.

Success 200:
{ "status": "success", "data": { "coupons": [ { "id": 1, "code": "BEAUTY20", "discount_type": "percentage", "discount_value": "20.00", "min_order_amount": "500.00", "max_discount_amount": null, "valid_until": "2024-09-30T23:59:59Z" } ] }, "meta": { "total_count": 4, "page": 1, "per_page": 20, "total_pages": 1 } }

Total Common Endpoints: 14
