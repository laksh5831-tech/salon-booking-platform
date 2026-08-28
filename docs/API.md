# Velora API Reference

Base URL: `http://localhost:5000/api/v1`

## Authentication

### POST /auth/register
Create a new customer account.
```json
// Request
{ "firstName": "John", "lastName": "Doe", "email": "john@example.com", "password": "Password123!", "phone": "555-0123" }
// Response 201
{ "success": true, "data": { "user": {...}, "accessToken": "...", "refreshToken": "..." } }
```

### POST /auth/login
```json
// Request
{ "email": "customer@velora.demo", "password": "Password123!" }
// Response 200
{ "success": true, "data": { "user": {...}, "accessToken": "...", "refreshToken": "..." } }
```

### POST /auth/refresh
```json
// Request
{ "refreshToken": "..." }
// Response 200
{ "success": true, "data": { "accessToken": "...", "refreshToken": "..." } }
```

### GET /auth/me
Get current authenticated user. Requires `Authorization: Bearer <token>`.

### POST /auth/logout
Logout current session. Requires auth.

---

## Salons

### GET /salons
List salons with optional filters.
- `?search=` — search by name or city
- `?city=` — filter by city
- `?sort=` — sort field (e.g. `-rating`, `name`)
- `?page=1&limit=10`

### GET /salons/:id
Get salon by ID.

### GET /salons/slug/:slug
Get salon by URL slug.

### POST /salons
Create salon. **Auth required** (salon_owner).

### PUT /salons/:id
Update salon. **Auth required** (owner of salon or admin).

### GET /salons/:id/staff
List staff for a salon.
- `?available=true` — only available staff
- `?specialization=` — filter by specialization

### GET /salons/:id/availability
Get available time slots for a salon on a date.
- `?serviceId=` — required
- `?date=` — required (YYYY-MM-DD)
- `?staffId=` — optional (any staff if omitted)

### POST /salons/:id/reviews
Submit a review. **Auth required** (customer).
```json
{ "rating": 5, "comment": "Great experience!", "service": "serviceId", "staff": "staffId" }
```

---

## Services

### GET /services
List services.
- `?salon=` — filter by salon ID
- `?category=` — filter by category
- `?minPrice=&maxPrice=` — price range
- `?page=1&limit=20`

### GET /services/:id
Get service by ID.

### POST /services
Create service. **Auth required** (salon owner/manager).

### PUT /services/:id
Update service. **Auth required**.

### DELETE /services/:id
Delete service. **Auth required**.

---

## Staff

### GET /staff
List staff with filters.
- `?salon=` — filter by salon
- `?specialization=` — filter by specialization
- `?available=` — filter by availability

### GET /staff/:id
Get staff by ID.

### POST /staff
Create staff member. **Auth required** (salon owner/manager).

### PUT /staff/:id
Update staff. **Auth required**.

### POST /staff/:id/leave
Submit leave request. **Auth required** (staff member or owner).
```json
{ "startDate": "2026-09-01", "endDate": "2026-09-05", "reason": "Vacation" }
```

### GET /staff/:id/leave
List leave records for a staff member.

### PATCH /staff/leave/:leaveId/approve
Approve a leave request. **Auth required** (salon owner/admin).

### PATCH /staff/leave/:leaveId/reject
Reject a leave request. **Auth required**.

---

## Appointments

### GET /appointments
List appointments.
- `?status=` — filter by status (pending, confirmed, completed, cancelled)
- `?salon=` — filter by salon
- `?from=&to=` — date range
- `?page=1&limit=20`

### GET /appointments/:id
Get appointment by ID.

### POST /appointments
Create appointment. **Auth required** (customer).
```json
{
  "salon": "salonId",
  "service": "serviceId",
  "staff": "staffId",
  "date": "2026-09-15",
  "startTime": "10:00"
}
```

### PATCH /appointments/:id/status
Update appointment status.
```json
{ "status": "confirmed" }  // or "completed", "cancelled"
```

### PATCH /appointments/:id/cancel
Cancel an appointment. **Auth required**.

---

## Users (Admin)

### GET /users
List users. **Auth required** (admin).
- `?role=` — filter by role
- `?search=` — search by name/email
- `?page=1&limit=20`

### GET /users/:id
Get user by ID.

### PATCH /users/:id/activate
Activate a user account.

### PATCH /users/:id/deactivate
Deactivate a user account.

---

## Reviews

### GET /reviews
List reviews.
- `?salon=` — filter by salon
- `?status=` — filter by status (pending, approved, rejected)
- `?page=1&limit=20`

### GET /reviews/:id
Get review by ID.

### PATCH /reviews/:id/approve
Approve a review. **Auth required** (admin).

### PATCH /reviews/:id/reject
Reject a review. **Auth required** (admin).

---

## Error Response Format

```json
{
  "success": false,
  "error": {
    "message": "Error description",
    "statusCode": 400
  }
}
```

## Swagger

Full interactive API docs available at: `http://localhost:5000/api/docs`
