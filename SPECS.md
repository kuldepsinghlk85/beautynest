# Functional & Technical Specification — BeautyNest Platform

---

## 1. System Overview

**BeautyNest** is a monolithic on-demand home services management system built on **Ruby on Rails 8**. It enables customers to discover, schedule, and pay for at-home services, enables verified workers to receive dispatches and execute jobs, and empowers administrators to oversee operations, finance, catalog, and quality from a centralized web console.

---

## 2. Roles & Access Control

| Role | Access Interface | Authentication Method | Capabilities |
|---|---|---|---|
| **Admin** | Web Admin Control Panel (`/admin/*`) | Session-based cookie auth (Devise-ready) | Full operational, financial, catalog, user, and system management. |
| **Customer** | Mobile REST API (`/api/v1/*`) | JWT Bearer Token | Browse catalog, book services, track orders, pay, review workers. |
| **Worker** | Mobile REST API (`/api/v1/*`) | JWT Bearer Token (Role-scoped) | Manage profile, view assigned bookings, update job status, track earnings. |

---

## 3. Admin Control Panel Modules & Screens

### 3.1. Authentication & Shell
- **Sign In (`/login`)**:
  - Interactive 3D particle background (Three.js / Vanta.js NET) adapting to dark and light modes.
  - Form validation with show/hide password toggle.
  - Anti-FOUC theme detector reading `bc-theme` from `localStorage`.
- **Navigation Shell**:
  - **Sidebar**: Dark gradient background, collapsible (`256px` → `68px`), grouped navigation with section titles, active left-border indicators (`2.5px indigo`), user profile footer, and sign out trigger.
  - **Top Header (`62px`)**: Sticky bar with page title, quick search trigger, notification bell with unread badge, light/dark theme switcher, and profile dropdown menu.
  - **Mobile Off-Canvas Drawer**: Active on viewports $\le 992\text{px}$, sliding in with backdrop blur overlay and header hamburger button.

### 3.2. Dashboard (`/admin/dashboard`)
- **KPI Metrics**: Total Customers, Active Workers, Total Bookings, Gross Revenue with monthly trend indicators.
- **Charts**:
  - Bookings Trend: 6-month line graph with smooth tension curves.
  - Revenue Trend: 6-month financial trajectory graph.
  - Booking Status: Donut chart displaying completed, active, pending, and cancelled distribution.
- **Recent Bookings Ledger**: Live table with customer, service, worker, timestamp, amount, and semantic status pills.

### 3.3. Users Management
- **Customers (`/admin/customers`)**:
  - `Index`: Search bar, status filter, table with avatar, email, phone, city, total bookings, lifetime spend, and status pill.
  - `Show`: Customer profile header, contact information card, address history, and recent booking log.
  - `New / Edit`: Name, email, phone, city, address, and account status controls.
- **Workers (`/admin/workers`)**:
  - `Index`: Search bar, approval filter (`All`, `Approved`, `Pending`, `Rejected`), specialty pill, rating score, completed jobs count.
  - `Show`: Detailed profile, contact details, assigned categories, ratings average, and instant **Approve / Reject** operational buttons.
  - `New / Edit`: Name, email, phone, city, speciality, categories, and bio.

### 3.4. Catalog
- **Categories (`/admin/categories`)**:
  - `Index`: Category name, icon, description, service count, status pill.
  - `Show`: Category metrics, associated service list.
  - `New / Edit`: Category name, description, icon identifier, active status toggle.
- **Services (`/admin/services`)**:
  - `Index`: Service title, category badge, price (INR ₹), duration in minutes, status.
  - `Show`: Service specs, pricing, description, and booking frequency.
  - `New / Edit`: Title, category assignment, price, duration, and full service description.

### 3.5. Operations & Finance
- **Bookings (`/admin/bookings`)**:
  - `Index`: Search, status filter (`Pending`, `Confirmed`, `In Progress`, `Completed`, `Cancelled`), date range filter.
  - `Show`: Customer card, assigned worker card, service breakdown, date/time, total amount, and worker dispatch re-assignment dropdown.
  - `New / Edit`: Customer selector, worker selector, service selector, scheduled date & time, address, and special notes.
- **Payments (`/admin/payments`)**:
  - `Index`: Transaction ID, Booking ID, Customer, Amount, Payment Method (Credit Card, UPI, Net Banking, Cash), Status (`Paid`, `Pending`, `Refunded`, `Failed`).
  - `Show / Edit`: Transaction details, gateway reference, and refund processing action.
- **Coupons (`/admin/coupons`)**:
  - `Index`: Coupon code, discount type (Percentage / Flat INR), discount value, validity date range, usage count vs usage limit, status.
  - `New / Edit`: Code, discount type, value, valid from, valid until, usage limit, active toggle.

### 3.6. Quality & Administration
- **Reviews (`/admin/reviews`)**:
  - `Index`: Customer, Worker, Service, 5-star rating visual breakdown, comment preview, flagged status.
  - `Show / Edit`: Full review details, comment text, and moderation / removal controls.
- **Notifications (`/admin/notifications`)**:
  - `Index`: Notification title, recipient audience (All Customers, All Workers, Specific User), channel (Push, SMS, Email), delivery timestamp, status.
  - `New`: Multi-channel broadcast form (recipient target, channel selector, title, message body).
- **Settings (`/admin/settings`)**:
  - General: Platform name, support email, support phone, default currency.
  - Profile: Admin user profile credentials, password update.
  - Notifications: Automated transactional notification triggers.
  - Appearance: Light/dark mode preference toggle.
  - Security: Two-factor authentication, session timeout limits.

---

## 4. State Machines & Workflow Definitions

### 4.1. Booking Lifecycle
```
[Created] ──► (Pending)
                 │
                 ▼ [Admin Assigns Worker]
             (Confirmed)
                 │
                 ▼ [Worker Arrives & Begins Job]
            (In Progress)
                 │
                 ▼ [Job Completed]
            (Completed)
                 │
                 ▼ [Customer Rates Service]
              [Review]
```
*(At any point prior to "In Progress", a booking may transition to `Cancelled`)*

### 4.2. Worker Onboarding Lifecycle
```
[Worker Registration] ──► (Pending Review)
                              │
               ┌──────────────┴──────────────┐
               ▼                             ▼
          (Approved)                     (Rejected)
               │
               ▼
   [Assignable to Bookings]
```

---

## 5. Mobile REST API Blueprint (`/api/v1/`)

All requests accept and return standard `application/json`. Authenticated endpoints require an `Authorization: Bearer <jwt-token>` header.

### 5.1. Customer Endpoints
- `POST /api/v1/auth/login` — Customer login & JWT generation
- `POST /api/v1/auth/register` — Customer account registration
- `GET  /api/v1/categories` — List active service categories
- `GET  /api/v1/categories/:id/services` — List services under a category
- `GET  /api/v1/services/:id` — Service details & pricing
- `GET  /api/v1/bookings` — Customer booking history
- `POST /api/v1/bookings` — Create new booking
- `GET  /api/v1/bookings/:id` — Booking tracking and status
- `POST /api/v1/bookings/:id/payment` — Process booking payment
- `POST /api/v1/bookings/:id/review` — Submit worker review and rating

### 5.2. Worker Endpoints
- `POST /api/v1/worker/auth/login` — Worker login
- `GET  /api/v1/worker/profile` — Worker profile and stats
- `GET  /api/v1/worker/bookings` — List assigned bookings
- `PATCH /api/v1/worker/bookings/:id/status` — Update booking status (`In Progress`, `Completed`)
- `GET  /api/v1/worker/earnings` — Summary of completed job payouts

---

## 6. Responsive UI Quality Targets

- **Viewports**: Fully responsive from 320px (iPhone SE) to 1440px+ (Ultra-wide displays).
- **Horizontal Scroll**: 0px page overflow. Internal scrollbars on wide data tables only (`.table-wrap`).
- **Performance**: Instant Turbo Drive page navigation, zero unstyled font flashes, CSS design token reusability across all modules.
