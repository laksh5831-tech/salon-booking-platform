# Velora Booking Logic

## Overview

The availability engine calculates which time slots are bookable for a given salon, service, date, and optionally a specific staff member. It accounts for salon hours, staff schedules, staff leave, existing bookings, and buffer times.

---

## Flow

### 1. Fetch Opening Hours

Load the salon's `openingHours` for the requested day of week.

```
Input:  date = "2026-09-15" (Tuesday)
Output: { open: "09:00", close: "18:00", closed: false }
```

If `closed: true`, return empty slots immediately.

### 2. Fetch Staff Working Hours

If a specific staff member is requested, load their `workingHours` for the same day.

```
Staff working hours override salon hours.
If staff has no workingHours record, fall back to salon hours.
```

The effective work window is:
```
workStart = max(salon.open, staff.start)
workEnd   = min(salon.close, staff.end)
```

### 3. Check Staff Leave

Query `staff_leaves` where:
- `staff` matches
- `startDate <= date <= endDate`
- `status = approved`

If the staff member is on leave for that date, return empty slots.

### 4. Fetch Existing Appointments

Query `appointments` where:
- `staff` matches (or any staff if "any" was selected)
- `date` matches
- `status` in `['pending', 'confirmed']`

This gives us all booked time ranges:
```
booked = appointments.map(a => ({ start: a.startTime, end: a.endTime }))
```

### 5. Generate Slot Grid

Create a grid of potential 30-minute start times within the work window:

```
For workStart="09:00", workEnd="18:00", service=45min:
  Potential starts: 09:00, 09:30, 10:00, ..., 17:00, 17:30
  (Last slot must allow full service duration before closing)
```

### 6. Filter Available Slots

For each potential start time `T`:

1. **Duration check**: `T + service.duration <= workEnd`?
2. **Closing check**: `T + service.duration <= salon.close`?
3. **Existing booking conflict**: Does any booked appointment overlap?
   ```
   overlap = booked.some(b =>
     T < b.end && T + service.duration > b.start
   )
   ```
4. **Buffer time conflict**: Does any booked appointment's buffer overlap?
   ```
   bufferConflict = booked.some(b =>
     T < b.end + buffer && T + service.duration > b.start - buffer
   )
   ```
5. **15-minute minimum gap**: Ensure at least 15 minutes gap from adjacent bookings

A slot passes all checks → it's available.

### 7. Return Results

```json
{
  "availableSlots": [
    { "startTime": "09:00", "endTime": "09:45" },
    { "startTime": "10:00", "endTime": "10:45" },
    { "startTime": "11:00", "endTime": "11:45" },
    ...
  ],
  "staff": { "name": "Sarah Johnson", "specialization": "Hair Stylist" },
  "service": { "name": "Haircut", "duration": 45, "price": 45 }
}
```

---

## Double-Booking Prevention

When creating an appointment, the system performs a final race-condition-safe check:

1. Validate the requested slot is still in the `availableSlots` result
2. Query for any existing appointment in the same time window
3. Use a MongoDB transaction or atomic operation to prevent concurrent double-bookings
4. Only then insert the appointment

---

## Buffer Time

Each service can specify a `bufferTime` (minutes after the service ends where the staff member is unavailable). This accounts for:
- Cleanup between clients
- Preparation time
- Breaks

Example: Haircut (45 min) + 15 min buffer = 60 minutes blocked per booking.

---

## Multi-Staff Availability

When "Any Available Stylist" is selected:

1. Load all active staff for the salon who offer the requested service
2. For each staff member, independently calculate their availability
3. A time slot is available if **at least one** staff member is free
4. The response includes which staff are available for each slot

---

## Edge Cases Handled

| Scenario | Behavior |
|----------|----------|
| Salon closed on that day | Empty slots |
| Staff member on approved leave | Empty slots for that staff |
| Service duration exceeds work window | No slots |
| Lunch break in staff schedule | Slots exclude break window |
| Appointment spanning closing time | Slot filtered out |
| Past dates/times | Not shown |
| Same-day booking | Only future time slots shown |
