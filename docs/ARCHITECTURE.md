# Velora Architecture

## System Overview

Velora follows a monorepo architecture with three packages sharing a common backend API.

```
┌─────────────────────────────────────────────────────────┐
│                    Client Apps                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │  React Web   │  │  React Native│  │   Swagger     │  │
│  │  (Vite)      │  │  (Expo)      │  │   Docs        │  │
│  │  Port 5173   │  │  Device      │  │   /api/docs   │  │
│  └──────┬───────┘  └──────┬───────┘  └──────────────┘  │
│         │                 │                             │
│         └────────┬────────┘                             │
│                  ▼                                      │
│  ┌─────────────────────────────────────────────────┐    │
│  │            Express.js API Server                │    │
│  │            Port 5000 · /api/v1                  │    │
│  │                                                 │    │
│  │  ┌─────────────┐  ┌──────────────┐             │    │
│  │  │  Middleware  │  │  Controllers │             │    │
│  │  │  (Auth,     │──│  (Request    │             │    │
│  │  │   Validate, │  │   Handling)  │             │    │
│  │  │   Error)    │  └──────┬───────┘             │    │
│  │  └─────────────┘         │                      │    │
│  │                          ▼                      │    │
│  │                 ┌──────────────┐                │    │
│  │                 │   Services   │                │    │
│  │                 │  (Business   │                │    │
│  │                 │   Logic)     │                │    │
│  │                 └──────┬───────┘                │    │
│  │                        ▼                        │    │
│  │                 ┌──────────────┐                │    │
│  │                 │   Models     │                │    │
│  │                 │  (Mongoose   │                │    │
│  │                 │   Schemas)   │                │    │
│  │                 └──────┬───────┘                │    │
│  └────────────────────────┼────────────────────────┘    │
│                           ▼                             │
│  ┌─────────────────────────────────────────────────┐    │
│  │           MongoDB (Mongoose ODM)                │    │
│  └─────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────┘
```

## Backend Layer Architecture

### Controller → Service → Model Pattern

```
Request → Route → Controller → Service → Model → MongoDB
              ↑                      ↑
         Validation            Business Logic
         (Joi)                 (Availability, Pricing,
                                Double-booking check)
```

- **Controllers** handle HTTP request/response, call services, format output
- **Services** contain all business logic, are framework-agnostic
- **Models** define Mongoose schemas and static methods

### Authentication Flow

```
Login:
  POST /auth/login → Validate credentials → Generate access token (15m)
                                           → Generate refresh token (7d)
                                           → Return both

Request:
  Client → Authorization: Bearer <accessToken> → Auth Middleware → Decode JWT → req.user

Token Refresh:
  POST /auth/refresh → Validate refresh token → Issue new access token
```

### Role-Based Access

| Role | Permissions |
|------|------------|
| customer | Book appointments, view own bookings, leave reviews |
| salon_manager | Manage salon services/staff, view salon appointments |
| salon_owner | All manager permissions + salon profile, leave management |
| staff | View own schedule, update own leave requests |
| admin | Full platform access, user/salon management, moderation |

## Frontend Architecture

### React Web App

- **Router**: React Router v6 with lazy-loaded route groups
- **State**: React Context (AuthContext) for auth state
- **API**: Axios with interceptors for token refresh
- **Styling**: Bootstrap 5 + custom CSS variables (Velora design system)
- **Layouts**: Three layout groups — CustomerLayout, DashboardLayout, AdminLayout

### React Native Mobile App

- **Navigation**: React Navigation (Stack + Bottom Tabs)
- **State**: React Context (AuthContext) with AsyncStorage persistence
- **API**: Axios with interceptors (same pattern as web)
- **Forms**: React Hook Form + Zod validation

## Data Flow — Booking

```
Customer selects service
  → Fetch available staff for salon
Customer selects staff (or "any")
  → Fetch available dates
Customer selects date
  → Fetch available time slots (availabilityService)
  → Checks: salon hours, staff hours, leave, existing bookings, buffer
Customer selects time
  → POST /appointments with { salon, service, staff, date, startTime }
  → Service validates no double-booking
  → Creates appointment with computed endTime, price, duration
  → Returns confirmed appointment
```
