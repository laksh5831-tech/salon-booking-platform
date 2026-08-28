# AGENTS.md — Velora Development Guide

## Project Overview
Velora is a salon discovery and appointment booking platform (monorepo).
Tech: React+Vite (Bootstrap 5, NOT Tailwind), React Native+Expo, Node.js/Express/MongoDB/Mongoose.

## Architecture
- Backend: Controller → Service → Model pattern
- Auth: JWT access (15m) + refresh (7d) tokens, role-based (customer/salon_owner/salon_manager/staff/admin)
- API base: `/api/v1`, Swagger at `/api/docs`
- Web app: `/apps/web`, Mobile: `/apps/mobile`, Backend: `/backend`

## Commands
```bash
# Backend
cd backend && npm run dev          # Start dev server
cd backend && npm run seed         # Seed demo data
cd backend && npm test             # Run tests

# Web app
cd apps/web && npm run dev         # Vite dev server
cd apps/web && npm run build       # Production build
cd apps/web && npm run lint        # ESLint check

# Mobile
cd apps/mobile && npx expo start  # Start Expo
```

## Demo Credentials
- admin@velora.demo / Password123!
- owner@velora.demo / Password123!
- customer@velora.demo / Password123!
- staff@velora.demo / Password123!

## Code Conventions
- Use Bootstrap 5 classes for styling (no Tailwind)
- Velora design system CSS vars: `--velora-primary: #7C3AED`, `--velora-secondary: #EC4899`
- Frontend error handling: toast/alert notifications
- API responses: `{ success: true, data: {...} }` or `{ success: false, error: {...} }`
- All routes use Express Router, validated with Joi
- Use `AppError` class for custom errors

## Key Files
- `backend/src/app.js` — Express app setup
- `backend/src/services/availabilityService.js` — Booking engine
- `backend/src/services/appointmentService.js` — Double-booking prevention
- `apps/web/src/App.jsx` — All routes
- `apps/web/src/context/AuthContext.jsx` — Auth state
- `apps/web/src/index.css` — Design system

## Testing
- Backend: Jest (`npm test` in backend/)
- Web: Vite build check (`npm run build`)
- Always run lint before commits

## Notes
- Windows environment: use `;` not `&&` for PowerShell sequential commands
- No Tailwind CSS — Bootstrap 5 only
- Don't modify seed data unless adding new demo accounts
