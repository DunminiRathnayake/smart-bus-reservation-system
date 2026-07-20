# Use Case Specification Document

This document defines the use case specifications for the **SmartGo** Smart Bus Reservation & Management System. It serves as the bridge between functional requirements and system design, detailing actors, preconditions, success sequences, alternative paths, and operational rules.

---

## 1. Actor Descriptions

*   **Passenger**: An end-user who registers, searches for trips, selects seats, simulates payment transactions, downloads PDF tickets, and manages booking histories.
*   **Conductor**: Transit crew member who logs in to retrieve passenger manifests and validates boarding passes using the browser-based QR scanner.
*   **Administrator**: A back-office operator who configures the fleet, schedules, routes, drivers, and user accounts, and monitors financial reports.
*   **Payment Gateway (System)**: An external system simulation that processes checkout transactions.
*   **Notification Engine (System)**: An internal/external utility that dispatches email and SMS alerts.

---

## 2. Use Case Diagram

```mermaid
leftToRightDirection
actor Passenger
actor Conductor
actor Admin
actor "Payment Gateway" as PG
actor "Notification Engine" as NE

rectangle "SmartGo System Boundary" {
    %% Auth Subsystem
    usecase UC_Auth_01 as "UC-AUTH-01: User Registration"
    usecase UC_Auth_02 as "UC-AUTH-02: Passenger Login"
    usecase UC_Auth_03 as "UC-AUTH-03: User Logout"
    usecase UC_Auth_04 as "UC-AUTH-04: Forgot Password"
    usecase UC_Auth_05 as "UC-AUTH-05: Update Profile"
    usecase UC_Auth_06 as "UC-AUTH-06: Admin Login"
    usecase UC_Auth_07 as "UC-AUTH-07: Conductor Login"

    %% Booking Subsystem
    usecase UC_Book_01 as "UC-BOOK-01: Search Bus"
    usecase UC_Book_02 as "UC-BOOK-02: Search Route"
    usecase UC_Book_03 as "UC-BOOK-03: View Schedule"
    usecase UC_Book_04 as "UC-BOOK-04: View Seat Availability"
    usecase UC_Book_05 as "UC-BOOK-05: Select Seats"
    usecase UC_Book_06 as "UC-BOOK-06: Book Ticket"
    usecase UC_Book_07 as "UC-BOOK-07: Cancel Booking"
    usecase UC_Book_08 as "UC-BOOK-08: Payment Simulation"

    %% Ticket Subsystem
    usecase UC_Tick_01 as "UC-TICK-01: Generate Ticket"
    usecase UC_Tick_02 as "UC-TICK-02: Download PDF Ticket"
    usecase UC_Tick_03 as "UC-TICK-03: Generate QR Ticket"

    %% History & Feedback
    usecase UC_Hist_01 as "UC-HIST-01: View Booking History"
    usecase UC_Hist_02 as "UC-HIST-02: Submit Feedback"

    %% Admin Subsystem
    usecase UC_Adm_01 as "UC-ADM-01: Manage Users"
    usecase UC_Adm_02 as "UC-ADM-02: Manage Drivers"
    usecase UC_Adm_03 as "UC-ADM-03: Manage Buses"
    usecase UC_Adm_04 as "UC-ADM-04: Manage Routes"
    usecase UC_Adm_05 as "UC-ADM-05: Manage Schedules"
    usecase UC_Adm_06 as "UC-ADM-06: Manage Bookings"
    usecase UC_Adm_07 as "UC-ADM-07: View Dashboard"
    usecase UC_Adm_08 as "UC-ADM-08: Generate Reports"

    %% Conductor Subsystem
    usecase UC_Cond_01 as "UC-COND-01: View Assigned Trips"
    usecase UC_Cond_02 as "UC-COND-02: View Passenger List"
    usecase UC_Cond_03 as "UC-COND-03: Scan QR Ticket"
    usecase UC_Cond_04 as "UC-COND-04: Verify Boarding"
}

%% Connections
Passenger --> UC_Auth_01
Passenger --> UC_Auth_02
Passenger --> UC_Auth_03
Passenger --> UC_Auth_04
Passenger --> UC_Auth_05
Passenger --> UC_Book_01
Passenger --> UC_Book_02
Passenger --> UC_Book_03
Passenger --> UC_Book_04
Passenger --> UC_Book_05
Passenger --> UC_Book_06
Passenger --> UC_Book_07
Passenger --> UC_Book_08
Passenger --> UC_Tick_02
Passenger --> UC_Hist_01
Passenger --> UC_Hist_02

Admin --> UC_Auth_06
Admin --> UC_Auth_03
Admin --> UC_Adm_01
Admin --> UC_Adm_02
Admin --> UC_Adm_03
Admin --> UC_Adm_04
Admin --> UC_Adm_05
Admin --> UC_Adm_06
Admin --> UC_Adm_07
Admin --> UC_Adm_08

Conductor --> UC_Auth_07
Conductor --> UC_Auth_03
Conductor --> UC_Cond_01
Conductor --> UC_Cond_02
Conductor --> UC_Cond_03
Conductor --> UC_Cond_04

UC_Book_08 --> PG
UC_Tick_01 --> NE
UC_Book_06 --> UC_Tick_01 : <<include>>
UC_Tick_01 --> UC_Tick_03 : <<include>>
```

---

## 3. Detailed Use Case Specifications

### 3.1 Authentication & Session Subsystem (UC-AUTH-01 to UC-AUTH-07)

#### UC-AUTH-01: User Registration
*   **Primary Actor**: Guest Passenger
*   **Secondary Actors**: Notification Engine
*   **Description**: Registers a new passenger account.
*   **Preconditions**: Guest is not authenticated.
*   **Trigger**: Passenger clicks "Register" on the portal.
*   **Main Success Scenario**:
    1.  Passenger enters name, unique email, phone, and password.
    2.  System validates credentials and uniqueness.
    3.  System encrypts the password with BCrypt.
    4.  System saves the profile and triggers a welcome email.
*   **Alternative Flows**: None.
*   **Exception Flows**:
    *   *Email/Phone already registered*: System displays: "Account already exists with this email/phone number".
    *   *Validation failure*: System displays field validation errors.
*   **Postconditions**: Passenger profile created with status `ACTIVE`.
*   **Business Rules**: Passwords must contain numbers, uppercase letters, and symbols.
*   **Related FRs**: FR-AUTH-01.
*   **Priority**: Must Have.

#### UC-AUTH-02: Passenger Login
*   **Primary Actor**: Passenger
*   **Secondary Actors**: None
*   **Description**: Authenticates passenger and issues JWT.
*   **Preconditions**: Passenger is registered.
*   **Trigger**: User submits login credentials.
*   **Main Success Scenario**:
    1.  User enters email and password.
    2.  System verifies credentials against the database.
    3.  System generates a bearer JWT containing role claims.
    4.  System returns JWT and updates the last login timestamp.
*   **Alternative Flows**: None.
*   **Exception Flows**:
    *   *Invalid Credentials*: System returns a HTTP `401 Unauthorized` with message "Invalid email or password".
*   **Postconditions**: User is authenticated.
*   **Business Rules**: Session JWT expires in 2 hours.
*   **Related FRs**: FR-AUTH-02.
*   **Priority**: Must Have.

#### UC-AUTH-03: User Logout
*   **Primary Actor**: Passenger, Admin, Conductor
*   **Secondary Actors**: None
*   **Description**: Terminates active session.
*   **Preconditions**: User is logged in.
*   **Trigger**: User clicks "Logout".
*   **Main Success Scenario**:
    1.  User clicks logout.
    2.  Client deletes the JWT access token from local storage.
    3.  System redirects user to home page.
*   **Alternative Flows**: None.
*   **Exception Flows**: None.
*   **Postconditions**: Session terminated.
*   **Business Rules**: Client-side token deletion is sufficient.
*   **Related FRs**: FR-AUTH-04.
*   **Priority**: Must Have.

#### UC-AUTH-04: Forgot Password
*   **Primary Actor**: Passenger
*   **Secondary Actors**: Notification Engine
*   **Description**: Sends password reset link.
*   **Preconditions**: User is registered.
*   **Trigger**: User clicks "Forgot Password".
*   **Main Success Scenario**:
    1.  User submits registered email.
    2.  System generates a recovery token.
    3.  System emails a reset link containing the token.
*   **Alternative Flows**: None.
*   **Exception Flows**:
    *   *Email not found*: System simulates mail sent to prevent user enumeration.
*   **Postconditions**: Password reset token generated.
*   **Business Rules**: Recovery tokens expire in 1 hour.
*   **Related FRs**: FR-AUTH-05.
*   **Priority**: Should Have.

#### UC-AUTH-05: Update Profile
*   **Primary Actor**: Passenger
*   **Secondary Actors**: None
*   **Description**: Updates user contact details.
*   **Preconditions**: User is authenticated.
*   **Trigger**: User saves updated details.
*   **Main Success Scenario**:
    1.  User updates name and phone number.
    2.  System validates inputs and updates the database.
*   **Alternative Flows**: None.
*   **Exception Flows**:
    *   *Duplicate Phone*: System rejects the update with error message.
*   **Postconditions**: Profile updated in database.
*   **Business Rules**: Emails cannot be modified.
*   **Related FRs**: FR-AUTH-03.
*   **Priority**: Must Have.

#### UC-AUTH-06: Admin Login
*   **Primary Actor**: Admin
*   **Secondary Actors**: None
*   **Description**: Authenticates admin credentials.
*   **Preconditions**: Admin user is configured in database.
*   **Trigger**: Admin submits login form.
*   **Main Success Scenario**:
    1.  Admin enters credentials.
    2.  System validates email and role claims.
    3.  System returns JWT with `ROLE_ADMIN` access.
*   **Alternative Flows**: None.
*   **Exception Flows**: None.
*   **Postconditions**: Admin authenticated.
*   **Business Rules**: Session expires in 8 hours.
*   **Related FRs**: FR-AUTH-02.
*   **Priority**: Must Have.

#### UC-AUTH-07: Conductor Login
*   **Primary Actor**: Conductor
*   **Secondary Actors**: None
*   **Description**: Authenticates conductor credentials.
*   **Preconditions**: Conductor account is configured by Admin.
*   **Trigger**: Conductor submits credentials on the mobile portal.
*   **Main Success Scenario**:
    1.  Conductor enters credentials.
    2.  System validates credentials and returns a JWT with `ROLE_CONDUCTOR`.
*   **Alternative Flows**: None.
*   **Exception Flows**: None.
*   **Postconditions**: Conductor authenticated.
*   **Business Rules**: Session expires in 8 hours.
*   **Related FRs**: FR-AUTH-02.
*   **Priority**: Must Have.

---

### 3.2 Booking Subsystem (UC-BOOK-01 to UC-BOOK-08)

#### UC-BOOK-01: Search Bus
*   **Primary Actor**: Passenger
*   **Secondary Actors**: None
*   **Description**: Searches bus departures.
*   **Preconditions**: Active trips are scheduled.
*   **Trigger**: User enters origin, destination, and date.
*   **Main Success Scenario**:
    1.  User enters search parameters and travel date.
    2.  System returns a list of matching trips.
*   **Alternative Flows**:
    *   *Filter results*: User filters results by bus type or departure time.
*   **Exception Flows**:
    *   *No matching trips*: System displays: "No trips found matching criteria".
*   **Postconditions**: Search results displayed.
*   **Business Rules**: Date must be equal to or greater than today.
*   **Related FRs**: FR-SCH-03.
*   **Priority**: Must Have.

#### UC-BOOK-02: Search Route
*   **Primary Actor**: Passenger
*   **Secondary Actors**: None
*   **Description**: Searches routes for information.
*   **Preconditions**: Routes exist in the database.
*   **Trigger**: User searches routes.
*   **Main Success Scenario**:
    1.  User enters source and destination locations.
    2.  System returns routes matching the search criteria.
*   **Alternative Flows**: None.
*   **Exception Flows**: None.
*   **Postconditions**: Matching routes returned.
*   **Business Rules**: None.
*   **Related FRs**: FR-SCH-03.
*   **Priority**: Should Have.

#### UC-BOOK-03: View Schedule
*   **Primary Actor**: Passenger
*   **Secondary Actors**: None
*   **Description**: Displays route schedules.
*   **Preconditions**: Trips are active.
*   **Trigger**: User views a route's schedule.
*   **Main Success Scenario**:
    1.  User clicks on route schedule details.
    2.  System displays scheduled times and fares.
*   **Alternative Flows**: None.
*   **Exception Flows**: None.
*   **Postconditions**: Schedule details displayed.
*   **Business Rules**: None.
*   **Related FRs**: FR-SCH-03.
*   **Priority**: Must Have.

#### UC-BOOK-04: View Seat Availability
*   **Primary Actor**: Passenger
*   **Secondary Actors**: None
*   **Description**: Displays trip seating chart.
*   **Preconditions**: Trip is active.
*   **Trigger**: User clicks "Select Seats".
*   **Main Success Scenario**:
    1.  User selects a trip.
    2.  System returns the seat map layout showing seat statuses.
*   **Alternative Flows**: None.
*   **Exception Flows**: None.
*   **Postconditions**: Seat map displayed.
*   **Business Rules**: Real-time status sync required.
*   **Related FRs**: FR-BUS-01.
*   **Priority**: Must Have.

#### UC-BOOK-05: Select Seats
*   **Primary Actor**: Passenger
*   **Secondary Actors**: None
*   **Description**: Selects seats on the layout map.
*   **Preconditions**: Seat map is loaded.
*   **Trigger**: User clicks on available seat nodes.
*   **Main Success Scenario**:
    1.  User clicks on available seat nodes.
    2.  System validates seat availability.
    3.  System highlights selected seats.
*   **Alternative Flows**:
    *   *Deselect*: Click selected node again to release.
*   **Exception Flows**: None.
*   **Postconditions**: Seats marked as selected.
*   **Business Rules**: Max 6 seats per transaction.
*   **Related FRs**: FR-BOOK-02.
*   **Priority**: Must Have.

#### UC-BOOK-06: Book Ticket
*   **Primary Actor**: Passenger
*   **Secondary Actors**: Notification Engine
*   **Description**: Creates a pending booking and locks seats.
*   **Preconditions**: Passenger is authenticated, seats selected.
*   **Trigger**: User clicks "Proceed to Booking".
*   **Main Success Scenario**:
    1.  User enters passenger details.
    2.  System validates passenger inputs.
    3.  System places a 10-minute lock on seats and creates a `PENDING` booking.
    4.  System displays checkout billing summary.
*   **Alternative Flows**: None.
*   **Exception Flows**:
    *   *Seats locked by another session*: System updates layout and displays: "Selected seats are no longer available".
*   **Postconditions**: Booking created as `PENDING`, seats locked.
*   **Business Rules**: Releases locks automatically after 10 minutes.
*   **Related FRs**: FR-BOOK-01.
*   **Priority**: Must Have.

#### UC-BOOK-07: Cancel Booking
*   **Primary Actor**: Passenger, Admin
*   **Secondary Actors**: Notification Engine
*   **Description**: Cancels booking and releases seats.
*   **Preconditions**: Booking is `CONFIRMED`.
*   **Trigger**: User requests cancellation.
*   **Main Success Scenario**:
    1.  User clicks "Cancel" on a booking.
    2.  System cancels booking and releases seats in database.
    3.  System emails cancellation details.
*   **Alternative Flows**: None.
*   **Exception Flows**:
    *   *Trip departed*: System blocks cancellation.
*   **Postconditions**: Booking status updated to `CANCELLED`.
*   **Business Rules**: Cancellation window constraints apply.
*   **Related FRs**: FR-BOOK-03.
*   **Priority**: Must Have.

#### UC-BOOK-08: Payment Simulation
*   **Primary Actor**: Passenger
*   **Secondary Actors**: Payment Gateway
*   **Description**: Simulates payment checkouts.
*   **Preconditions**: Booking is `PENDING` and seats are locked.
*   **Trigger**: User submits card payment details.
*   **Main Success Scenario**:
    1.  User enters mock card details and submits.
    2.  System processes card validation simulation.
    3.  System updates booking to `CONFIRMED`.
*   **Alternative Flows**: None.
*   **Exception Flows**:
    *   *Payment failed*: System releases seats and marks booking as `FAILED`.
*   **Postconditions**: Booking updated to `CONFIRMED` on success.
*   **Business Rules**: Must complete checkout before the 10-minute lock expires.
*   **Related FRs**: FR-PAY-01.
*   **Priority**: Must Have.

---

### 3.3 Ticket Generation Subsystem (UC-TICK-01 to UC-TICK-03)

#### UC-TICK-01: Generate Ticket
*   **Primary Actor**: System
*   **Secondary Actors**: Notification Engine
*   **Description**: Generates ticket records in database.
*   **Preconditions**: Booking status updated to `CONFIRMED`.
*   **Trigger**: Booking status transitions to confirmed.
*   **Main Success Scenario**:
    1.  System generates ticket records for each passenger seat.
    2.  System signs ticket IDs and generates QR code hashes.
    3.  System dispatches confirmation alerts.
*   **Alternative Flows**: None.
*   **Exception Flows**: None.
*   **Postconditions**: Ticket records created.
*   **Business Rules**: None.
*   **Related FRs**: FR-TICK-01.
*   **Priority**: Must Have.

#### UC-TICK-02: Download PDF Ticket
*   **Primary Actor**: Passenger
*   **Secondary Actors**: None
*   **Description**: Generates and downloads PDF boarding pass.
*   **Preconditions**: Booking is confirmed.
*   **Trigger**: Passenger clicks "Download PDF".
*   **Main Success Scenario**:
    1.  Passenger clicks download.
    2.  System compiles ticket details into a PDF layout.
    3.  System streams PDF file download to the passenger browser.
*   **Alternative Flows**: None.
*   **Exception Flows**: None.
*   **Postconditions**: PDF downloaded.
*   **Business Rules**: None.
*   **Related FRs**: FR-TICK-02.
*   **Priority**: Must Have.

#### UC-TICK-03: Generate QR Ticket
*   **Primary Actor**: System
*   **Secondary Actors**: None
*   **Description**: Encrypts QR token hash.
*   **Preconditions**: Ticket record created.
*   **Trigger**: Inside ticket generation pipeline.
*   **Main Success Scenario**:
    1.  System encrypts details into a base64 JWT payload.
    2.  System wraps the payload in a high-resolution QR matrix.
    3.  System saves the QR signature string to the ticket record.
*   **Alternative Flows**: None.
*   **Exception Flows**: None.
*   **Postconditions**: QR code generated.
*   **Business Rules**: Must contain encrypted trip and ticket IDs.
*   **Related FRs**: FR-TICK-01.
*   **Priority**: Must Have.

---

### 3.4 Passenger Operations (UC-HIST-01 to UC-HIST-02)

#### UC-HIST-01: View Booking History
*   **Primary Actor**: Passenger
*   **Secondary Actors**: None
*   **Description**: Lists passenger bookings.
*   **Preconditions**: User is logged in.
*   **Trigger**: User visits booking profile dashboard.
*   **Main Success Scenario**:
    1.  User opens "My Bookings".
    2.  System queries and displays past and upcoming bookings.
*   **Alternative Flows**: None.
*   **Exception Flows**: None.
*   **Postconditions**: Bookings displayed.
*   **Business Rules**: None.
*   **Related FRs**: FR-USER-05.
*   **Priority**: Must Have.

#### UC-HIST-02: Submit Feedback
*   **Primary Actor**: Passenger
*   **Secondary Actors**: None
*   **Description**: Submits trip ratings and reviews.
*   **Preconditions**: User completed travel on the target trip.
*   **Trigger**: User submits review form.
*   **Main Success Scenario**:
    1.  User enters rating and comment.
    2.  System saves feedback to DB.
*   **Alternative Flows**: None.
*   **Exception Flows**:
    *   *Validation error*: Rating must be 1 to 5.
*   **Postconditions**: Feedback saved.
*   **Business Rules**: Only passengers who boarded can submit trip feedback.
*   **Related FRs**: FR-FEED-01.
*   **Priority**: Should Have.

---

### 3.5 Admin Operations Subsystem (UC-ADM-01 to UC-ADM-08)

#### UC-ADM-01: Manage Users
*   **Primary Actor**: Admin
*   **Secondary Actors**: None
*   **Description**: Administers passenger/conductor accounts.
*   **Preconditions**: Admin is logged in.
*   **Trigger**: Admin updates a user record.
*   **Main Success Scenario**:
    1.  Admin selects a user account.
    2.  Admin modifies details or role type.
    3.  System saves updates to database.
*   **Alternative Flows**: None.
*   **Exception Flows**: None.
*   **Postconditions**: User record updated.
*   **Business Rules**: Role values are limited to predefined system roles.
*   **Related FRs**: FR-USER-05.
*   **Priority**: Must Have.

#### UC-ADM-02: Manage Drivers
*   **Primary Actor**: Admin
*   **Secondary Actors**: None
*   **Description**: Performs CRUD operations on drivers.
*   **Preconditions**: Admin is logged in.
*   **Trigger**: Admin modifies a driver profile.
*   **Main Success Scenario**:
    1.  Admin inputs driver details and license.
    2.  System saves driver profile in DB.
*   **Alternative Flows**: None.
*   **Exception Flows**: None.
*   **Postconditions**: Driver data modified.
*   **Business Rules**: Driver license must be unique.
*   **Related FRs**: FR-DRV-01.
*   **Priority**: Must Have.

#### UC-ADM-03: Manage Buses
*   **Primary Actor**: Admin
*   **Secondary Actors**: None
*   **Description**: Performs CRUD operations on bus fleet.
*   **Preconditions**: Admin is logged in.
*   **Trigger**: Admin modifies bus configurations.
*   **Main Success Scenario**:
    1.  Admin registers bus details and maps layouts.
    2.  System generates matching seat maps in DB.
*   **Alternative Flows**: None.
*   **Exception Flows**: None.
*   **Postconditions**: Bus catalog modified.
*   **Business Rules**: Plate numbers must be unique.
*   **Related FRs**: FR-BUS-01.
*   **Priority**: Must Have.

#### UC-ADM-04: Manage Routes
*   **Primary Actor**: Admin
*   **Secondary Actors**: None
*   **Description**: Defines system route layouts.
*   **Preconditions**: Admin is logged in.
*   **Trigger**: Admin modifies route networks.
*   **Main Success Scenario**:
    1.  Admin defines terminal stops and intermediate sequences.
    2.  System calculates distances and saves layout.
*   **Alternative Flows**: None.
*   **Exception Flows**: None.
*   **Postconditions**: Routes saved in database.
*   **Business Rules**: Sequences must be continuous.
*   **Related FRs**: FR-RTE-01.
*   **Priority**: Must Have.

#### UC-ADM-05: Manage Schedules
*   **Primary Actor**: Admin
*   **Secondary Actors**: None
*   **Description**: Creates recurring route calendars.
*   **Preconditions**: Admin is logged in.
*   **Trigger**: Admin creates schedule rules.
*   **Main Success Scenario**:
    1.  Admin sets route, bus, driver, and recurrence days.
    2.  System validates resource availability and saves the schedule.
*   **Alternative Flows**: None.
*   **Exception Flows**:
    *   *Conflict*: System alerts that driver or bus is already assigned.
*   **Postconditions**: Scheduled templates created.
*   **Business Rules**: Driver/Bus schedules must not overlap.
*   **Related FRs**: FR-SCH-01.
*   **Priority**: Must Have.

#### UC-ADM-06: Manage Bookings
*   **Primary Actor**: Admin
*   **Secondary Actors**: Notification Engine
*   **Description**: Admin booking overrides.
*   **Preconditions**: Admin is logged in.
*   **Trigger**: Admin overrides a booking status.
*   **Main Success Scenario**:
    1.  Admin updates passenger booking record.
    2.  System updates booking status and notifies the passenger.
*   **Alternative Flows**: None.
*   **Exception Flows**: None.
*   **Postconditions**: Booking status updated.
*   **Business Rules**: None.
*   **Related FRs**: FR-BOOK-03.
*   **Priority**: Should Have.

#### UC-ADM-07: View Dashboard
*   **Primary Actor**: Admin
*   **Secondary Actors**: None
*   **Description**: Loads admin statistics.
*   **Preconditions**: Admin is logged in.
*   **Trigger**: Admin loads dashboard.
*   **Main Success Scenario**:
    1.  Admin opens the homepage portal.
    2.  System aggregates performance statistics.
    3.  System displays reports and charts.
*   **Alternative Flows**: None.
*   **Exception Flows**: None.
*   **Postconditions**: Performance summaries displayed.
*   **Business Rules**: None.
*   **Related FRs**: FR-REP-01.
*   **Priority**: Must Have.

#### UC-ADM-08: Generate Reports
*   **Primary Actor**: Admin
*   **Secondary Actors**: None
*   **Description**: Generates custom operational reports.
*   **Preconditions**: Admin is logged in.
*   **Trigger**: Admin submits report criteria.
*   **Main Success Scenario**:
    1.  Admin selects target metrics and date range.
    2.  System aggregates billing records and generates report summaries.
*   **Alternative Flows**: None.
*   **Exception Flows**: None.
*   **Postconditions**: Report layout loaded.
*   **Business Rules**: None.
*   **Related FRs**: FR-REP-01.
*   **Priority**: Should Have.

---

### 3.6 Conductor Actions Subsystem (UC-COND-01 to UC-COND-04)

#### UC-COND-01: View Assigned Trips
*   **Primary Actor**: Conductor
*   **Secondary Actors**: None
*   **Description**: Lists conductor's assigned trips.
*   **Preconditions**: Conductor is logged in.
*   **Trigger**: Conductor opens homepage.
*   **Main Success Scenario**:
    1.  System loads assigned active trips for today.
*   **Alternative Flows**: None.
*   **Exception Flows**: None.
*   **Postconditions**: Trips displayed.
*   **Business Rules**: None.
*   **Related FRs**: FR-SCH-01.
*   **Priority**: Must Have.

#### UC-COND-02: View Passenger List
*   **Primary Actor**: Conductor
*   **Secondary Actors**: None
*   **Description**: Displays passenger manifests.
*   **Preconditions**: Conductor selects a trip.
*   **Trigger**: Conductor views "Manifest".
*   **Main Success Scenario**:
    1.  System loads list of passengers and seat details.
*   **Alternative Flows**: None.
*   **Exception Flows**: None.
*   **Postconditions**: Manifest displayed.
*   **Business Rules**: None.
*   **Related FRs**: FR-TICK-02.
*   **Priority**: Must Have.

#### UC-COND-03: Scan QR Ticket
*   **Primary Actor**: Conductor
*   **Secondary Actors**: None
*   **Description**: Scans ticket QR codes.
*   **Preconditions**: Mobile browser camera permission is granted.
*   **Trigger**: Conductor scans a ticket QR.
*   **Main Success Scenario**:
    1.  Conductor captures ticket QR image.
    2.  System extracts the verification hash.
    3.  System validates ticket details against database.
*   **Alternative Flows**: None.
*   **Exception Flows**:
    *   *Scan Error*: Invalid or unreadable QR code displays warning alert.
*   **Postconditions**: Ticket verified.
*   **Business Rules**: None.
*   **Related FRs**: FR-TICK-02.
*   **Priority**: Must Have.

#### UC-COND-04: Verify Boarding
*   **Primary Actor**: Conductor
*   **Secondary Actors**: None
*   **Description**: Updates ticket boarding status.
*   **Preconditions**: QR code scanned successfully.
*   **Trigger**: Validation completes on server.
*   **Main Success Scenario**:
    1.  System validates ticket status is `CONFIRMED` for the current trip.
    2.  System updates status to `BOARDED` in DB.
    3.  System displays green success screen.
*   **Alternative Flows**:
    *   *Manual check-in*: Conductor checks in passenger manually from manifest.
*   **Exception Flows**:
    *   *Duplicate scan*: System alerts: "Ticket Already Checked-In".
*   **Postconditions**: Passenger marked as boarded.
*   **Business Rules**: A ticket status can only transition to `BOARDED` once.
*   **Related FRs**: FR-TICK-02.
*   **Priority**: Must Have.
