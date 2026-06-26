# Use Cases

This document details the major use cases of the **SmartGo** Smart Bus Reservation & Management System, categorized by the initiating actor.

---

## 1. Actor Directory

*   **Passenger**: End-user who searches for trips, selects seats, pays for tickets, and manages bookings.
*   **Conductor**: Transit staff who views manifests, scans tickets, and verifies boarding.
*   **Admin (Administrator)**: Back-office staff who configures system settings, manages buses, schedules, routes, and reviews dashboard metrics.
*   **System**: Automated scripts that trigger operations (e.g., seat timeout release, notifications).

---

## 2. Use Case Index Grouped by Actor

### Passenger Use Cases
*   **UC-PAS-01**: Search & Filter Trips
*   **UC-PAS-02**: Book Tickets & Select Seats (Detailed below)
*   **UC-PAS-03**: Cancel Booking
*   **UC-PAS-04**: View Travel History & Profile
*   **UC-PAS-05**: Submit Trip Feedback

### Conductor Use Cases
*   **UC-CON-01**: View Assigned Manifest
*   **UC-CON-02**: Scan & Verify QR Boarding Pass (Detailed below)

### Admin Use Cases
*   **UC-ADM-01**: Manage Bus Fleet (CRUD)
*   **UC-ADM-02**: Manage Routes & Stops (CRUD)
*   **UC-ADM-03**: Create Trip Schedules (Detailed below)
*   **UC-ADM-04**: Generate Operational & Revenue Reports

### System Use Cases
*   **UC-SYS-01**: Release Expired Seat Locks
*   **UC-SYS-02**: Send Automated Notification Alerts

---

## 3. Key Use Case Specifications

### Use Case UC-PAS-02: Book Tickets & Select Seats

*   **Description**: Describes the process of search, real-time seat mapping, reservation locking, checkout, mock payment processing, and final ticket distribution.
*   **Actors**: Passenger, Payment Gateway (System).
*   **Preconditions**: Passenger is authenticated. Trips exist matching search criteria.
*   **Postconditions**: Booking status updated to `CONFIRMED`, seats permanently assigned to user, ticket PDF generated, transaction email sent.

#### Primary Flow (Success Scenario)
1.  **Passenger** searches for a trip by source, destination, and date.
2.  **System** returns matching search results.
3.  **Passenger** selects a preferred trip.
4.  **Passenger** views the visual seat map and selects available seat(s).
5.  **System** verifies seat availability and sets a temporary lock (10 minutes) on the selected seat(s).
6.  **Passenger** enters passenger details (names, contact details) and clicks "Proceed to Checkout".
7.  **Passenger** enters mock payment card details and clicks "Submit".
8.  **System** processes payment with the simulated payment gateway, confirming approval.
9.  **System** updates Booking status to `CONFIRMED` and registers the seat lock as a permanent booking.
10. **System** generates the digital boarding pass PDF containing a secure QR code.
11. **System** displays checkout success page and triggers confirmation email.

#### Alternative Flows

##### Alternative Flow A: Seats Already Taken / Locked (Race Condition)
*   *At Step 5*, if another transaction locks/books the selected seat(s) before this user submits:
    1.  **System** returns error message: "Selected seat(s) are no longer available. Please select another seat."
    2.  **System** updates seat map.
    3.  **Passenger** returns to Step 4 to select a different seat.

##### Alternative Flow B: Payment Declined
*   *At Step 8*, if the mock payment processing indicates "Insufficient Funds" or "Gateway Failure":
    1.  **System** displays error message: "Payment failed. Please try again or use another payment option."
    2.  **System** maintains the temporary seat locks (if within the 10-minute window) and leaves booking status as `PENDING`.
    3.  **Passenger** is prompted to retry checkout.

##### Alternative Flow C: Checkout Session Timeout
*   *At Step 6 or 7*, if the passenger does not complete checkout within 10 minutes:
    1.  **System** releases the temporary seat locks.
    2.  **System** updates Booking status to `FAILED`.
    3.  **Passenger** is redirected to trip search page with message: "Session expired. Your selected seats have been released."

---

### Use Case UC-CON-02: Scan & Verify QR Boarding Pass

*   **Description**: A conductor validates a passenger's boarding pass by scanning its secure QR code on their mobile browser scanner.
*   **Actors**: Conductor.
*   **Preconditions**: Conductor has logged into the mobile terminal. Conductor is assigned to the current active trip. Passenger presents a digital or printed ticket.
*   **Postconditions**: Ticket status is updated to `BOARDED` in the database, and passenger is allowed boarding.

#### Primary Flow (Success Scenario)
1.  **Conductor** selects the active trip from their schedule.
2.  **Conductor** launches the browser camera scanner.
3.  **Conductor** scans the QR code on the passenger's boarding pass.
4.  **System** parses the QR payload containing encrypted ticket details.
5.  **System** matches the ticket details against the database:
    *   Verifies ticket exists.
    *   Verifies ticket status is `CONFIRMED`.
    *   Verifies ticket belongs to the current trip ID and date.
6.  **System** updates the ticket status to `BOARDED` and records check-in timestamp.
7.  **System** displays a green success screen showing "Checked-In Successfully - Seat number(s) X, Y".
8.  **Conductor** permits boarding.

#### Alternative Flows

##### Alternative Flow A: Invalid / Unrecognized QR Code
*   *At Step 5*, if the scanned QR code payload cannot be parsed or does not match any booking ID:
    1.  **System** displays red warning screen: "Ticket Not Found - Invalid QR Code".
    2.  **Conductor** denies boarding.

##### Alternative Flow B: Ticket Already Scanned (Double Check-In)
*   *At Step 5*, if the ticket exists but already has status `BOARDED`:
    1.  **System** displays red alert: "Warning: Ticket Already Checked-In at [Timestamp]".
    2.  **Conductor** denies boarding and investigates duplicate ticket fraud.

##### Alternative Flow C: Wrong Trip / Route Match
*   *At Step 5*, if the ticket is confirmed but is scheduled for a different trip, date, or bus:
    1.  **System** displays orange alert: "Wrong Trip - Ticket scheduled for Trip [ID] on [Date]".
    2.  **Conductor** redirects passenger to the correct platform or terminal.

---

### Use Case UC-ADM-03: Create Trip Schedules

*   **Description**: Admin schedules recurring trips on a route using a specific bus model and base pricing.
*   **Actors**: Admin.
*   **Preconditions**: Admin is logged in. Route and Bus exist and are marked active.
*   **Postconditions**: Trip instances generated for specified date range.

#### Primary Flow
1.  **Admin** navigates to "Schedules" and clicks "Create Schedule".
2.  **Admin** selects an active Route (e.g., Route 101: New York to Washington).
3.  **Admin** selects an active Bus (e.g., Bus NY-1200 with 40 seats).
4.  **Admin** enters start and end dates (e.g., July 1st to July 31st).
5.  **Admin** selects weekly recurrence days (e.g., Mon, Wed, Fri) and daily departure time (e.g., 08:30 AM).
6.  **Admin** enters base ticket price (e.g., $45.00).
7.  **Admin** clicks "Generate Schedule".
8.  **System** validates that the assigned bus does not have schedule conflicts on the selected dates.
9.  **System** instantiates active `Trip` records for each matching date, initializing an empty seat status catalog for the bus seats.
10. **System** displays success message.
