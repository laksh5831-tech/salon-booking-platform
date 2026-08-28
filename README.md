# Velora — Salon Booking Platform

> **Your beauty. Your time. Your stylist.**

A full-stack salon discovery and appointment booking platform with web + mobile clients, built with a production-ready monorepo architecture.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Web App** | React 18 + Vite, Bootstrap 5, Axios, React Router v6 |
| **Mobile App** | React Native + Expo, React Navigation, Axios |
| **Backend** | Node.js + Express, MongoDB + Mongoose, JWT Auth |
| **Docs** | Swagger (OpenAPI) at `/api/docs` |

---

## Project Structure

```
salon-booking-platform/
├── apps/
│   ├── web/              # Customer + Salon Dashboard + Admin Dashboard
│   │   ├── src/
│   │   │   ├── components/   # Reusable UI components
│   │   │   ├── pages/        # All page-level views
│   │   │   │   ├── customer/ # Customer-facing pages
│   │   │   │   ├── salon/    # Salon owner/manager dashboard
│   │   │   │   └── admin/    # Platform admin pages
│   │   │   ├── layouts/      # CustomerLayout, DashboardLayout, AdminLayout
│   │   │   ├── context/      # React Context providers
│   │   │   ├── services/     # API service layer
│   │   │   └── utils/        # Helper utilities
│   │   └── index.html
│   └── mobile/           # React Native Expo app
│       └── src/
│           ├── screens/      # All mobile screens
│           ├── context/      # AuthContext
│           └── services/     # API layer
├── backend/
│   └── src/
│       ├── controllers/      # Route handlers
│       ├── services/         # Business logic
│       ├── models/           # Mongoose schemas
│       ├── routes/           # Express route definitions
│       ├── middleware/       # Auth, validation, error handling
│       ├── validators/       # Joi schemas
│       ├── config/           # DB, constants
│       ├── utils/            # Helpers (AppError, token, pagination)
│       ├── seed/             # Demo data seeder
│       └── tests/            # Jest test suites
└── docs/                 # Architecture, API, database, booking logic docs
```

---

## Quick Start

### 1. Backend

```bash
cd backend
cp .env.example .env      # configure MongoDB URI, JWT secrets, etc.
npm install
npm run dev                # starts on http://localhost:5000
npm run seed               # seeds demo data
```

### 2. Web App

```bash
cd apps/web
npm install
npm run dev                # starts on http://localhost:5173
```

### 3. Mobile App

```bash
cd apps/mobile
npm install
npx expo start             # scan QR with Expo Go
```

---

## Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | `admin@velora.demo` | `Password123!` |
| Salon Owner | `owner@velora.demo` | `Password123!` |
| Salon Owner 2 | `owner2@velora.demo` | `Password123!` |
| Salon Owner 3 | `owner3@velora.demo` | `Password123!` |
| Salon Manager | `manager@velora.demo` | `Password123!` |
| Staff | `staff@velora.demo` | `Password123!` |
| Staff 2 | `staff2@velora.demo` | `Password123!` |
| Customer | `customer@velora.demo` | `Password123!` |

> The seeded `manager@velora.demo` account is linked to **Anu Beauty Studio** (the first salon, owned by `owner@velora.demo`). Managers see and manage only their assigned salon.

---

## Key Features

### Customer Web & Mobile
- Browse and search salons with filters
- View salon profiles, services, and team members
- Real-time availability engine (accounts for staff leave, existing bookings, breaks, buffer time)
- 5-step booking flow with date/time selection
- Appointment management (view, cancel)
- Reviews and ratings
- User profile management

### Salon Dashboard
- Overview stats (appointments, revenue, ratings)
- Service CRUD management
- Staff management with service assignment and per-staff working hours
- Staff leave management
- Appointment status management
- Review monitoring
- Salon profile and opening hours editor
- Owner and manager (member) access scoped to the manager's assigned salon

### Admin Dashboard
- Platform-wide statistics and charts
- User management (toggle active status)
- Salon management (toggle verified status)
- Services & Categories management (create, edit, activate/deactivate)
- Appointment monitoring across all salons
- Review moderation (approve/reject)

### Backend API
- RESTful design at `/api/v1`
- JWT access + refresh token auth
- Role-based access control (customer, salon_owner, salon_manager, staff, admin)
- Joi request validation
- Double-booking prevention
- Swagger documentation at `/api/docs`

---

## Booking Availability Logic

The availability engine (`backend/src/services/availabilityService.js`) calculates available time slots by:

1. Loading salon opening hours for the requested date
2. Loading staff working hours (falls back to salon hours if no staff record)
3. Loading staff leave records — no slots on leave days
4. Loading existing appointments for the staff member
5. Generating 30-minute slots within the work window
6. Filtering out slots that conflict with existing bookings
7. Filtering out slots where the appointment would extend past closing
8. Applying 15-minute buffer between appointments
9. Returning only fully available start times

---

## Key Technical Decisions

- **Manager membership**: salons carry a `managers` array; `GET /salons/my` plus `isSalonAccessible()` scope every dashboard query so owners and managers only ever see their own salon (previously managers saw all appointments).
- **Double-booking**: appointment creation is check-then-insert, not a race-safe transactional insert. Fine for demo-scale load; production would use conditional upserts or a lock.
- **Multi-session refresh tokens**: each login issues a per-user `jti`-tracked refresh token with 15-minute rotation reuse grace and a max of 10 active sessions.
- **Seed password hashing**: demo accounts seeded with `User.create` are stored as plaintext passwords (the model hook hashes them once); accounts seeded via `insertMany` pass the already-hashed value, since `insertMany` bypasses hooks.
- **Currency**: all prices are INR (`₹`), localized throughout web and mobile.
- **SEO**: static `index.html` meta/OG tags, JSON-LD `WebSite` schema, `robots.txt` and `sitemap.xml` in `apps/web/public` — canonical/OG URLs point at the live deployment `https://velora-23bj.onrender.com` (change `apps/web/index.html`, `apps/web/public/robots.txt`, `apps/web/public/sitemap.xml` if the domain changes).

---

## Deployment

One deployment hosts everything — marketing site, web app, API and Swagger — because the backend serves the built Vite app when `NODE_ENV=production` (see `backend/src/app.js`). The web client already calls the API at the relative path `/api/v1`, so no CORS/proxy setup is needed in production.

### Option A — Docker / Render (recommended)

```bash
docker build -t velora .
docker run -p 10000:10000 --env-file backend/.env velora
# open http://localhost:10000
```

Or deploy `render.yaml` (Render Blueprint, free tier): point a new Blueprint at this repo, then fill in the `sync: false` env vars (MongoDB URI, JWT secrets, etc.). Replace the `STRIPE_*` placeholders with real keys when you go live.

### Option B — Manual

```bash
cd apps/web && npm run build          # produces apps/web/dist
cd backend && NODE_ENV=production npm start   # serves API + built site on :5000
```

You can see the live single-container deployment here: **https://velora-23bj.onrender.com** (marketing site + web app + API `<origin>/api/v1` + Swagger `<origin>/api/docs`).

**Before go-live**, replace the `velora.example.com` placeholders in `apps/web/index.html`, `apps/web/public/robots.txt`, `apps/web/public/sitemap.xml`, and this README with your actual domain.

---

## Development Phases

| Phase | Status | Description |
|-------|--------|-------------|
| 1 | ✅ | Backend Foundation — models, auth, routes, seed data |
| 2 | ✅ | Customer Web App — browsing, booking, profile |
| 3 | ✅ | Salon Dashboard — services, staff, appointments |
| 4 | ✅ | Admin Dashboard — users, salons, moderation |
| 5 | ✅ | React Native Mobile App |
| 6 | ✅ | Security & Validation Polish |
| 7 | ✅ | Documentation & Swagger |

---

## License

MIT
