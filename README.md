# 🌸 BeautyNest – Ladies Doorstep Salon
> **"More Than Beauty, It's Care"**  
> Complete Production-Ready Beauty Service Marketplace Platform (Yes Madam Style UX)  
> Launch City: **Lucknow**, UP – Architected for PAN-India Expansion.

---

## 🏛️ Ecosystem Overview

BeautyNest delivers a luxury feminine doorstep salon experience exclusively for women, eliminating salon commute and waiting queues with sealed, single-use hygienic monodose kits.

```
beautynest/
├── backend/                 # NestJS 10 + Prisma ORM + PostgreSQL + Redis + Socket.io + Swagger
├── customer-website/        # Next.js 14 App Router + Tailwind CSS + Lucide Icons + Framer Motion
├── admin-dashboard/         # React 18 + Vite + Tailwind CSS + Recharts + Operations Portal
├── customer-mobile-app/     # Flutter 3 (Dart) + Riverpod (14 Complete Screens)
├── beautician-mobile-app/   # Flutter 3 (Dart) + Riverpod (7 Complete Screens)
├── docker-compose.yml       # Local orchestration (PostgreSQL 16, Redis 7, Backend, Web, Admin)
└── package.json             # Monorepo unified commands
```

---

## 🎨 Brand & Design System

- **Primary Color:** Rose Pink (`#E91E8C`)
- **Primary Dark:** (`#C2185B`)
- **Background:** Soft Cream (`#FFF5F7`)
- **Accent Color:** Imperial Gold (`#D4AF37`)
- **Text Primary:** Charcoal (`#2D2D2D`)
- **Visual Aesthetic:** Luxury feminine spa feel, rounded cards (`rounded-3xl`), soft pink drop shadows (`shadow-pink-soft`), and micro-animations.

---

## ⚡ Technology Stack

| Layer | Technologies |
|---|---|
| **Customer Mobile App** | Flutter 3 (Dart), Flutter Riverpod, Google Fonts |
| **Beautician Mobile App** | Flutter 3 (Dart), Flutter Riverpod, FL Chart |
| **Customer Website** | Next.js 14 (App Router, SSR/SSG), Tailwind CSS, Lucide |
| **Admin Operations Portal** | React 18, Vite, Tailwind CSS, Recharts |
| **Backend Framework** | Node.js (v20+ / v24+), NestJS 10, TypeScript |
| **Database & ORM** | PostgreSQL 16, Prisma ORM 5 |
| **Caching & Queue** | Redis 7 |
| **Realtime Gateway** | Socket.io (Live GPS Tracking, Chat, Booking Status Push) |
| **Authentication** | JWT Access (7d) + Refresh (30d), Mobile OTP (Twilio/MSG91/Dev) |
| **Payments** | Razorpay (UPI, GPay, Paytm, Cards, Net Banking, COD) |
| **API Documentation** | Swagger / OpenAPI 3.0 at `http://localhost:4000/api/docs` |

---

## 🤖 Beautician Auto-Assignment Scoring Algorithm

When a customer places a doorstep booking, the system evaluates all active verified beauticians within a **10km radius** using the following weighted compatibility formula:

$$\text{Score} = (\text{Distance} \times 30\%) + (\text{Rating} \times 25\%) + (\text{Availability} \times 20\%) + (\text{Skill Match} \times 15\%) + (\text{Experience} \times 10\%)$$

### Algorithm Steps:
1. **Geo-Filtering:** Filter verified beauticians within 10km radius of customer delivery address.
2. **Availability Check:** Confirm online status and conflict-free calendar slots.
3. **Skill Verification:** Verify certifications matching the requested services.
4. **Scoring:** Calculate weighted compatibility composite score (0-100%).
5. **Dispatch:** Route booking request to highest-scoring beautician with a 60-second acceptance countdown.
6. **Fallback:** If declined or timed out, auto-reassign to next candidate in queue.
7. **Customer Verification:** Customer receives Beautician details + 4-digit Service Start OTP.

---

## 📱 Mobile Applications

### 1. Customer Mobile App (`customer-mobile-app/`)
14 Complete Production Screens:
1. `SplashScreen` & `OnboardingScreen`: 3 luxury slides with pink indicators
2. `AuthScreen`: Mobile number (+91), 6-digit OTP verification, profile creation
3. `HomeScreen`: Logo, Lucknow location picker, search, categories, bestseller carousel, top beauticians
4. `ServiceDiscoveryScreen`: Category tabs (Facial, Hair, Waxing, Makeup, Spa), service cards
5. `ServiceDetailScreen`: Hero photo, rating (4.9), tabs (About, Benefits, Process, Reviews), sticky book CTA
6. `AddressSelectionScreen`: Saved addresses (Home/Work/Other) with GPS coordinates
7. `DateTimePickerScreen`: 7-day horizontal picker, Morning/Afternoon/Evening slots
8. `BeauticianAssignmentScreen`: Matching card (Ananya Sharma, 4.8 rating, 5+ yrs exp, 2.5km away)
9. `BookingConfirmationScreen`: Animated pink checkmark, Booking ID `BK-6887`, summary table
10. `MyBookingsScreen`: Upcoming, Completed, Cancelled tabs with action triggers
11. `LiveTrackingScreen`: Real-time map route, ETA counter, Call & Chat triggers
12. `PaymentScreen`: Razorpay UPI, Cards, COD, and promo coupons (`WELCOME50`)
13. `ReviewRatingScreen`: 5-star rating, verified review submission, photo upload
14. `ProfileScreen`: Addresses, Wallet balance (₹250), Refer & Earn, Help & Support

### 2. Beautician Partner App (`beautician-mobile-app/`)
7 Complete Production Screens:
1. `BeauticianRegistrationScreen`: Skills multi-select, Aadhaar, Trade Diploma, bank account
2. `BeauticianDashboardScreen`: Good Morning greeting, Online/Offline toggle, today's jobs count, earnings (₹4,250), 4.9 rating, incoming job request card
3. `JobCardScreen`: Service details, customer address, Google Map navigation button, Call button
4. `ActiveJobScreen`: Assigned -> Navigating -> Arrived -> In Progress -> Completed with 4-digit OTP start gate
5. `EarningsScreen`: Today / Week / Month toggle, pink bar chart, payout history, bank withdrawal
6. `ScheduleScreen`: Weekly availability & leave manager
7. `BeauticianProfileScreen`: Portfolio, verified badges, rating statistics

---

## 🚀 Quickstart & Setup Guide

### Prerequisites
- Node.js v20+ or v24+
- Docker & Docker Compose (or local PostgreSQL & Redis)

### Option A: Running via Docker Compose (Recommended)
```bash
# Start PostgreSQL, Redis, NestJS Backend, Customer Website, and Admin Dashboard
docker compose up -d

# Seed the database with sample data
docker compose exec backend npx prisma db seed
```

### Option B: Running Services Locally

#### 1. Setup Backend & Database
```bash
cd backend
npm install

# Configure your PostgreSQL connection in .env
# Default: DATABASE_URL="postgresql://postgres:postgres@localhost:5432/beautynest_db?schema=public"

npx prisma generate
npx prisma migrate dev --name init
npx prisma db seed

# Run Backend
npm run start:dev
# API runs on: http://localhost:4000
# Swagger API docs: http://localhost:4000/api/docs
```

#### 2. Run Customer Website (Next.js 14)
```bash
cd ../customer-website
npm install
npm run dev
# Website runs on: http://localhost:3000
```

#### 3. Run Admin Web Dashboard (React 18 + Vite)
```bash
cd ../admin-dashboard
npm install
npm run dev
# Admin dashboard runs on: http://localhost:5173
```

#### 4. Run Mobile Apps with Flutter
```bash
# Customer App
cd ../customer-mobile-app
flutter pub get
flutter run

# Beautician App
cd ../beautician-mobile-app
flutter pub get
flutter run
```

---

## 🔑 Demo & Test Credentials

- **Admin Operations Login:**
  - Email: `admin@beautynest.in`
  - Password: `Admin@123`
  - Access: Full access to bookings, beautician KYC approvals, reports, and revenue
- **Sample Customer:**
  - Phone: `+91 98765 43210`
  - OTP: `123456`
  - Name: Priya Verma (Aliganj, Lucknow)
- **Top Verified Beautician:**
  - Name: Ananya Sharma
  - Phone: `+91 98112 23344`
  - Rating: 4.8 ★ (330+ reviews)
- **Sample Booking:**
  - Booking ID: `BK-6887` (Korean Facial Ritual, ₹949, Start OTP: `4821`)
- **Active Coupons:**
  - `WELCOME50` (Flat 50% off up to ₹400)
  - `KOREAN30` (Flat ₹300 off on Korean Rituals)
  - `GLOW20` (20% off on Combos)

---

## 📄 License & Intellectual Property

Built with care for BeautyNest Technologies Pvt. Ltd.
