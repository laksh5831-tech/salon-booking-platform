# Velora Database Schema

MongoDB collections with Mongoose ODM.

---

## users

| Field | Type | Notes |
|-------|------|-------|
| firstName | String | Required |
| lastName | String | Required |
| email | String | Unique, indexed |
| password | String | bcrypt hashed |
| phone | String | Optional |
| role | Enum | customer, salon_owner, salon_manager, staff, admin |
| avatar | String | Image URL |
| isActive | Boolean | Default true |
| refreshTokens | [String] | Used for refresh token rotation |
| createdAt | Date | Auto |

---

## salons

| Field | Type | Notes |
|-------|------|-------|
| name | String | Required |
| slug | String | Auto-generated, unique, indexed |
| owner | ObjectId | Ref → users |
| description | String | |
| phone | String | |
| email | String | |
| address | String | Street address |
| city | String | Indexed |
| state | String | |
| country | String | |
| zipCode | String | |
| latitude | Number | Geo support |
| longitude | Number | Geo support |
| coverImage | String | URL |
| images | [String] | Gallery URLs |
| openingHours | Mixed | ` { monday: { open: "09:00", close: "18:00", closed: false }, ... } ` |
| rating | Number | Denormalized avg, default 0 |
| reviewCount | Number | Denormalized count, default 0 |
| isVerified | Boolean | Default false |
| isActive | Boolean | Default true |
| categories | [ObjectId] | Ref → service_categories |
| tags | [String] | |

---

## service_categories

| Field | Type | Notes |
|-------|------|-------|
| name | String | Required, unique |
| description | String | |
| icon | String | |
| isActive | Boolean | Default true |

---

## services

| Field | Type | Notes |
|-------|------|-------|
| salon | ObjectId | Ref → salons, indexed |
| name | String | Required |
| description | String | |
| category | ObjectId | Ref → service_categories |
| duration | Number | Minutes, required |
| price | Number | Required |
| bufferTime | Number | Minutes after service, default 0 |
| isActive | Boolean | Default true |
| image | String | URL |
| staffMembers | [ObjectId] | Ref → staff |

---

## staff

| Field | Type | Notes |
|-------|------|-------|
| salon | ObjectId | Ref → salons, indexed |
| name | String | Required |
| user | ObjectId | Ref → users (optional, for login) |
| email | String | |
| phone | String | |
| specialization | String | e.g. "Hair Stylist", "Nail Technician" |
| bio | String | |
| experience | Number | Years |
| avatar | String | URL |
| workingHours | Mixed | `{ monday: { start: "09:00", end: "18:00", isOff: false }, ... }` |
| services | [ObjectId] | Ref → services |
| isActive | Boolean | Default true |
| leave | [ObjectId] | Ref → staff_leaves |

---

## staff_leaves

| Field | Type | Notes |
|-------|------|-------|
| staff | ObjectId | Ref → staff, indexed |
| salon | ObjectId | Ref → salons |
| startDate | Date | Required |
| endDate | Date | Required |
| reason | String | |
| status | Enum | pending, approved, rejected |
| approvedBy | ObjectId | Ref → users |
| createdAt | Date | Auto |

---

## appointments

| Field | Type | Notes |
|-------|------|-------|
| customer | ObjectId | Ref → users, indexed |
| salon | ObjectId | Ref → salons, indexed |
| service | ObjectId | Ref → services |
| staff | ObjectId | Ref → staff |
| date | Date | Indexed |
| startTime | String | "HH:mm" |
| endTime | String | Computed |
| duration | Number | Minutes, copied from service |
| price | Number | Copied from service at booking time |
| status | Enum | pending, confirmed, completed, cancelled |
| notes | String | Customer notes |
| cancellationReason | String | |
| cancelledBy | ObjectId | Ref → users |
| cancelledAt | Date | |
| createdAt | Date | Auto |

**Compound index**: `{ customer: 1, date: 1, startTime: 1 }` for double-booking checks.

---

## reviews

| Field | Type | Notes |
|-------|------|-------|
| customer | ObjectId | Ref → users, indexed |
| salon | ObjectId | Ref → salons, indexed |
| appointment | ObjectId | Ref → appointments, unique |
| service | ObjectId | Ref → services |
| staff | ObjectId | Ref → staff |
| rating | Number | 1–5, required |
| comment | String | |
| images | [String] | URLs |
| status | Enum | pending, approved, rejected |
| createdAt | Date | Auto |
