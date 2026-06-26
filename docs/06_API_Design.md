# REST API Design Specification

This document details the REST API contract for the **SmartGo** Smart Bus Reservation & Management System. All endpoints are versioned under `/api/v1`.

---

## 1. Global Policies & Standards

### 1.1 Base URL
*   **Staging / Production**: `https://api.smartgo.com/api/v1`
*   **Local Development**: `http://localhost:8080/api/v1`

### 1.2 Common HTTP Status Codes
*   `200 OK`: Request succeeded. Response body contains payload.
*   `201 Created`: Resource successfully created.
*   `204 No Content`: Action succeeded, but returns no content body.
*   `400 Bad Request`: Input validation failed or business constraint violated.
*   `401 Unauthorized`: Authentication token missing or invalid.
*   `403 Forbidden`: Authenticated user lacks roles/permissions (RBAC failure).
*   `404 Not Found`: Target resource does not exist.
*   `500 Internal Server Error`: Generic unhandled server error.

### 1.3 Error Response Schema (RFC 7807)
All error responses return a standardized JSON structure:
```json
{
  "timestamp": "2026-06-26T14:20:00Z",
  "status": 400,
  "error": "Bad Request",
  "message": "Seat selection invalid.",
  "path": "/api/v1/bookings",
  "errors": [
    {
      "field": "seatIds",
      "message": "Seat A3 is already locked or booked."
    }
  ]
}
```

---

## 2. API Endpoints Catalog

### 2.1 Authentication Module (`/auth`)

#### `POST /auth/register`
Onboards a new passenger in the system.
*   **Auth**: Public
*   **Request Body**:
    ```json
    {
      "email": "john.doe@example.com",
      "password": "SecurePassword123!",
      "fullName": "John Doe",
      "phoneNumber": "+15550199"
    }
    ```
*   **Success Response** (`201 Created`):
    ```json
    {
      "id": "a9d8212e-13c5-4ebc-bf5f-14d2a13e5904",
      "email": "john.doe@example.com",
      "fullName": "John Doe",
      "phoneNumber": "+15550199",
      "createdAt": "2026-06-26T14:20:00Z"
    }
    ```

#### `POST /auth/login`
Authenticates user credentials and issues a JWT token.
*   **Auth**: Public
*   **Request Body**:
    ```json
    {
      "email": "john.doe@example.com",
      "password": "SecurePassword123!"
    }
    ```
*   **Success Response** (`200 OK`):
    ```json
    {
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "tokenType": "Bearer",
      "expiresIn": 7200,
      "email": "john.doe@example.com",
      "roles": ["ROLE_PASSENGER"]
    }
    ```

---

### 2.2 Users Module (`/users`)

#### `GET /users/me`
Retrieves the logged-in user's profile.
*   **Auth**: Private (Any role)
*   **Success Response** (`200 OK`):
    ```json
    {
      "id": "a9d8212e-13c5-4ebc-bf5f-14d2a13e5904",
      "email": "john.doe@example.com",
      "fullName": "John Doe",
      "phoneNumber": "+15550199",
      "roles": ["ROLE_PASSENGER"]
    }
    ```

#### `PUT /users/me`
Updates basic user details.
*   **Auth**: Private (Any role)
*   **Request Body**:
    ```json
    {
      "fullName": "John Jonathan Doe",
      "phoneNumber": "+15550299"
    }
    ```
*   **Success Response** (`200 OK`):
    ```json
    {
      "id": "a9d8212e-13c5-4ebc-bf5f-14d2a13e5904",
      "email": "john.doe@example.com",
      "fullName": "John Jonathan Doe",
      "phoneNumber": "+15550299"
    }
    ```

---

### 2.3 Buses Module (`/buses`)

#### `POST /buses`
Registers a new vehicle in the transport fleet.
*   **Auth**: Private (`ROLE_ADMIN`)
*   **Request Body**:
    ```json
    {
      "registrationNumber": "NY-BUS-9081",
      "model": "Volvo 9700 Grand",
      "capacity": 40,
      "busTypeId": 1
    }
    ```
*   **Success Response** (`201 Created`):
    ```json
    {
      "id": "bb8e5473-b67f-442a-a92c-0e86bfa3023e",
      "registrationNumber": "NY-BUS-9081",
      "model": "Volvo 9700 Grand",
      "capacity": 40,
      "status": "ACTIVE",
      "busType": {
        "id": 1,
        "name": "Luxury AC Seater",
        "layoutType": "SEATER_2X2"
      }
    }
    ```

#### `GET /buses`
Lists all buses in the fleet. Supports pagination.
*   **Auth**: Private (`ROLE_ADMIN`)
*   **Query Params**: `page` (default 0), `size` (default 20)
*   **Success Response** (`200 OK`):
    ```json
    {
      "content": [
        {
          "id": "bb8e5473-b67f-442a-a92c-0e86bfa3023e",
          "registrationNumber": "NY-BUS-9081",
          "model": "Volvo 9700 Grand",
          "status": "ACTIVE"
        }
      ],
      "totalPages": 1,
      "totalElements": 1,
      "size": 20,
      "number": 0
    }
    ```

---

### 2.4 Routes Module (`/routes`)

#### `POST /routes`
Creates a travel route.
*   **Auth**: Private (`ROLE_ADMIN`)
*   **Request Body**:
    ```json
    {
      "name": "New York to Washington Corridor",
      "startLocation": "New York Port Authority",
      "destinationLocation": "Washington Union Station",
      "totalDistanceKm": 360.5,
      "estimatedDurationMins": 270,
      "stops": [
        { "stopId": "c8d8212e-13c5-4ebc-bf5f-14d2a13e5900", "sequence": 1, "distanceFromStartKm": 0.0, "arrivalOffsetMins": 0 },
        { "stopId": "d8d8212e-13c5-4ebc-bf5f-14d2a13e5901", "sequence": 2, "distanceFromStartKm": 150.2, "arrivalOffsetMins": 110 },
        { "stopId": "e8d8212e-13c5-4ebc-bf5f-14d2a13e5902", "sequence": 3, "distanceFromStartKm": 360.5, "arrivalOffsetMins": 270 }
      ]
    }
    ```
*   **Success Response** (`201 Created`):
    ```json
    {
      "id": "fb8e5473-b67f-442a-a92c-0e86bfa3024a",
      "name": "New York to Washington Corridor",
      "startLocation": "New York Port Authority",
      "destinationLocation": "Washington Union Station",
      "totalDistanceKm": 360.5,
      "estimatedDurationMins": 270
    }
    ```

---

### 2.5 Schedules & Trips Module (`/schedules` & `/trips`)

#### `GET /trips/search`
Searches active bus trips matching passenger parameters.
*   **Auth**: Public
*   **Query Params**: `source` (New York), `destination` (Washington), `date` (2026-07-01)
*   **Success Response** (`200 OK`):
    ```json
    [
      {
        "tripId": "73c6bb2a-c211-401d-93be-ef748981c201",
        "routeName": "New York to Washington Corridor",
        "busModel": "Volvo 9700 Grand",
        "busType": "Luxury AC Seater",
        "departureTime": "2026-07-01T08:30:00Z",
        "arrivalTime": "2026-07-01T13:00:00Z",
        "availableSeats": 24,
        "baseFare": 45.00,
        "status": "SCHEDULED"
      }
    ]
    ```

#### `GET /trips/{tripId}/seats`
Loads the current seat allocation layout and lock state for a trip.
*   **Auth**: Public / Private (Any role)
*   **Success Response** (`200 OK`):
    ```json
    {
      "tripId": "73c6bb2a-c211-401d-93be-ef748981c201",
      "seats": [
        { "tripSeatId": "11a6bb2a-c211-401d-93be-ef748981c200", "seatNumber": "A1", "row": 1, "col": 1, "status": "BOOKED" },
        { "tripSeatId": "22a6bb2a-c211-401d-93be-ef748981c201", "seatNumber": "A2", "row": 1, "col": 2, "status": "AVAILABLE" },
        { "tripSeatId": "33a6bb2a-c211-401d-93be-ef748981c202", "seatNumber": "A3", "row": 1, "col": 3, "status": "LOCKED" }
      ]
    }
    ```

---

### 2.6 Bookings Module (`/bookings`)

#### `POST /bookings`
Locks chosen seat coordinates and initializes a `PENDING` booking.
*   **Auth**: Private (`ROLE_PASSENGER`)
*   **Request Body**:
    ```json
    {
      "tripId": "73c6bb2a-c211-401d-93be-ef748981c201",
      "tripSeatIds": [
        "22a6bb2a-c211-401d-93be-ef748981c201"
      ],
      "passengers": [
        {
          "name": "Jane Doe",
          "age": 28,
          "gender": "FEMALE"
        }
      ]
    }
    ```
*   **Success Response** (`210 Created`):
    ```json
    {
      "bookingId": "c4d8212e-13c5-4ebc-bf5f-14d2a13e5999",
      "bookingReference": "SG-10924-NYC",
      "tripId": "73c6bb2a-c211-401d-93be-ef748981c201",
      "bookingStatus": "PENDING",
      "totalAmount": 45.00,
      "lockExpiresAt": "2026-06-26T14:30:00Z"
    }
    ```

---

### 2.7 Payments Module (`/payments`)

#### `POST /payments/checkout`
Processes a mock billing transaction to settle a pending booking.
*   **Auth**: Private (`ROLE_PASSENGER`)
*   **Request Body**:
    ```json
    {
      "bookingId": "c4d8212e-13c5-4ebc-bf5f-14d2a13e5999",
      "paymentMethod": "CREDIT_CARD",
      "cardNumber": "4111222233334444",
      "cvv": "123",
      "expiry": "12/28"
    }
    ```
*   **Success Response** (`200 OK`):
    ```json
    {
      "transactionReference": "TXN-MOCK-92840924",
      "bookingId": "c4d8212e-13c5-4ebc-bf5f-14d2a13e5999",
      "bookingReference": "SG-10924-NYC",
      "amount": 45.00,
      "paymentStatus": "SUCCESS",
      "paidAt": "2026-06-26T14:21:10Z"
    }
    ```

---

### 2.8 Feedback Module (`/feedback`)

#### `POST /feedback`
Submits star ratings and remarks for a completed trip.
*   **Auth**: Private (`ROLE_PASSENGER`)
*   **Request Body**:
    ```json
    {
      "tripId": "73c6bb2a-c211-401d-93be-ef748981c201",
      "rating": 5,
      "comment": "Very comfortable AC bus. Arrived exactly on time."
    }
    ```
*   **Success Response** (`201 Created`):
    ```json
    {
      "id": "e2d8212e-13c5-4ebc-bf5f-14d2a13e5888",
      "tripId": "73c6bb2a-c211-401d-93be-ef748981c201",
      "rating": 5,
      "comment": "Very comfortable AC bus. Arrived exactly on time.",
      "submittedAt": "2026-06-26T15:05:00Z"
    }
    ```

---

### 2.9 Reports Module (`/reports`)

#### `GET /reports/revenue`
Aggregates financial statistics across a time range.
*   **Auth**: Private (`ROLE_ADMIN`)
*   **Query Params**: `startDate` (2026-06-01), `endDate` (2026-06-30)
*   **Success Response** (`200 OK`):
    ```json
    {
      "totalRevenue": 24890.50,
      "totalBookings": 553,
      "revenueByRoute": [
        { "routeId": "fb8e5473-b67f-442a-a92c-0e86bfa3024a", "routeName": "New York to Washington Corridor", "revenue": 18240.00 },
        { "routeId": "gb8e5473-b67f-442a-a92c-0e86bfa3024b", "routeName": "Boston to New York Route", "revenue": 6650.50 }
      ]
    }
    ```

---

### 2.10 Tickets Module (Verification - `/tickets`)

#### `POST /tickets/verify`
Scans and registers boarding for a ticket (typically scanned by a conductor).
*   **Auth**: Private (`ROLE_CONDUCTOR`, `ROLE_ADMIN`)
*   **Request Body**:
    ```json
    {
      "qrCodeHash": "eyJhbGciOiJIUzI1NiJ9.eyJ0aWNrZXRJZCI6ImM0ZDgyMTJlLTEzYzUt..."
    }
    ```
*   **Success Response** (`200 OK`):
    ```json
    {
      "ticketId": "f9d8212e-13c5-4ebc-bf5f-14d2a13e5700",
      "bookingReference": "SG-10924-NYC",
      "passengerName": "Jane Doe",
      "seatNumber": "A2",
      "status": "BOARDED",
      "checkedInAt": "2026-07-01T08:15:33Z"
    }
    ```
