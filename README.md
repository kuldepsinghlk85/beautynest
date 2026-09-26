# BeautyNest — Home Service Platform

A modern, high-performance monolithic Ruby on Rails 8 application powering an at-home and on-demand home service booking ecosystem.

BeautyNest bridges **Customers** booking services with verified **Workers** delivering tasks at customer locations, fully orchestrated by platform **Admins** through a luxury-grade, responsive Admin Control Panel.

---

## Key Modules & Features

### 1. Executive Dashboard & Analytics
- **Live KPI Metrics**: Real-time summary cards for Total Customers, Active Workers, Total Bookings, and Gross Platform Revenue.
- **Interactive Visualizations**: 6-month Bookings Trend line chart, 6-month Revenue Trend line chart, and Donut Booking Status distribution (Chart.js).
- **Recent Bookings Ledger**: Live-updated booking table with status pills, dates, and amounts.

### 2. User & Workforce Operations
- **Customers (`/admin/customers`)**: Detailed customer profiles, contact info, booking history, lifetime spend, and account status toggling.
- **Workers (`/admin/workers`)**: Service provider management, specialty tags, approval workflows (`Pending`, `Approved`, `Rejected`), performance metrics, and onboarding approval.

### 3. Service Catalog
- **Categories (`/admin/categories`)**: Multi-tier categorization (Salon, Massage, Spa, Cleaning, Electrician, Plumbing, etc.) with active/inactive status toggles.
- **Services (`/admin/services`)**: Service management with pricing, duration in minutes, descriptions, and category associations.

### 4. Operations & Finance
- **Bookings (`/admin/bookings`)**: End-to-end booking lifecycle management (`Pending`, `Confirmed`, `In Progress`, `Completed`, `Cancelled`) with worker dispatch and scheduling.
- **Payments (`/admin/payments`)**: Transaction ledger, payment method tracking (Credit Card, UPI, Net Banking, Cash), and refund workflow.
- **Coupons (`/admin/coupons`)**: Promotional campaign management, discount rates (flat / percentage), validity periods, and usage limit tracking.

### 5. Quality & Administration
- **Reviews (`/admin/reviews`)**: Customer feedback moderation, 5-star scoring breakdown, and flagging controls.
- **Notifications (`/admin/notifications`)**: Multi-channel user broadcast console (Push Notification, SMS, Email).
- **Settings (`/admin/settings`)**: Platform configurations, admin credentials, security parameters, and appearance toggles.

---

## Technology Stack

| Layer | Technology |
|---|---|
| **Framework** | Ruby on Rails 8.x |
| **Database** | PostgreSQL / SQLite (Development) |
| **Frontend Architecture** | Hotwire (Turbo Drive + Stimulus JS) + ERB Templates |
| **Design System** | Vanilla CSS3 Custom Properties Design Token Engine (`application.css`) |
| **Visual Polish** | Apple / CMS-v6 dark & light aesthetic, 3D Vanta.js particle canvas login, glassmorphism, responsive mobile drawer |
| **Asset Pipeline** | Propshaft + Importmaps (No Webpack / Node build required) |
| **Authentication** | Session-based Admin Authentication & JWT Mobile Token Auth |
| **Icons** | Feather SVG Icons |
| **Charts** | Chart.js 4.x |

---

## Responsive Architecture

The Admin Control Panel is fully responsive across all device viewports (320px to 1440px+):
- **Desktop (> 992px)**: Persistent collapsible sidebar with keyboard shortcuts and sticky header.
- **Tablet / Mobile (<= 992px)**: Off-canvas sliding drawer navigation with blur overlay backdrop, compact header, horizontally scrollable filter bars, fluid single-column form fields, and touch-optimized data tables.

---

## Getting Started

### Prerequisites
- Ruby 3.2+
- Bundler (`gem install bundler`)
- PostgreSQL (optional for production)

### Quick Setup

```bash
# 1. Clone repository & install gem dependencies
bundle install

# 2. Setup database and seed initial platform data
bin/rails db:create db:migrate db:seed

# 3. Start local development server
bin/rails server -p 3009
```

Visit **`http://localhost:3009/`** to log in:
- **Email:** `admin@BeautyNest.com`
- **Password:** `password`

---

## Directory Map

```
beauty-connect-web/
├── app/
│   ├── assets/stylesheets/application.css   # Full design token & responsive stylesheet
│   ├── controllers/
│   │   ├── admin/                           # Admin module controllers
│   │   ├── api/v1/                          # Mobile REST endpoints
│   │   └── sessions_controller.rb           # Auth flow
│   ├── helpers/application_helper.rb        # Badges, avatars, formatting helpers
│   ├── javascript/controllers/              # Stimulus controllers (sidebar, theme, dropdown)
│   ├── models/                              # ActiveRecord & prototype models
│   └── views/                               # ERB views (admin, layouts, sessions)
├── config/routes.rb                         # App routing
├── public/                                  # 3D canvas libraries and static assets
├── AGENTS.md                                # Developer guidelines & agent rules
├── README.md                                # Project overview (this file)
└── SPECS.md                                 # Technical & functional specification
```

---

## Testing & Quality

```bash
bin/rails test              # Run test suite
bin/rubocop                 # Code style checking
bin/brakeman                # Security audit
bundle exec bundler-audit   # Vulnerability audit
```

---

## License

Proprietary © 2026 BeautyNest Platform. All rights reserved.
