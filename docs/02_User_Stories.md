# Agile User Stories Backlog

This document defines the comprehensive product backlog for the **SmartGo** Smart Bus Reservation & Management System. It contains 57 granular user stories grouped by operational modules, structured for Agile Scrum development using MoSCoW prioritization.

---

## 1. Authentication Module (AUTH)

### Story ID: US-AUTH-01
*   **Title**: Passenger Registration
*   **Priority**: Must Have
*   **User Story**:
    *   **As a** Guest passenger,
    *   **I want to** register for an account using my email address, phone number, and password,
    *   **So that** I can login, book tickets, and track my reservation history.
*   **Acceptance Criteria**:
    *   **Given** a guest passenger is on the registration page,
    *   **When** they submit a valid email, unique phone number, full name, and strong password (min 8 chars, 1 uppercase, 1 symbol),
    *   **Then** the system hashes the password with BCrypt, saves the profile, and routes the user to the login screen with a success alert.
*   **Business Value**: Onboards users, builds the customer database, and sets up profile security.
*   **Dependencies**: None.

### Story ID: US-AUTH-02
*   **Title**: Passenger Login & Access Token
*   **Priority**: Must Have
*   **User Story**:
    *   **As a** Registered user (Passenger, Conductor, Admin),
    *   **I want to** authenticate using my credentials,
    *   **So that** I can obtain a secure JWT session and access protected resources.
*   **Acceptance Criteria**:
    *   **Given** a user is on the login page,
    *   **When** they submit valid email and password credentials,
    *   **Then** the system returns a status code `200 OK` and a response body containing a bearer JWT and role claims.
*   **Business Value**: Controls access to protected application resources.
*   **Dependencies**: US-AUTH-01.

### Story ID: US-AUTH-03
*   **Title**: Stateless JWT Verification
*   **Priority**: Should Have
*   **User Story**:
    *   **As a** Backend service,
    *   **I want to** intercept and validate the JWT signature in the request headers,
    *   **So that** I can verify user roles and identity without querying the database for every API request.
*   **Acceptance Criteria**:
    *   **Given** a client makes an HTTP request to a secured path,
    *   **When** the request header contains a valid, unexpired JWT,
    *   **Then** the request is forwarded to the controller; otherwise, it returns a status code `401 Unauthorized`.
*   **Business Value**: Ensures secure, high-performance API authentication.
*   **Dependencies**: US-AUTH-02.

### Story ID: US-AUTH-04
*   **Title**: Session Logout
*   **Priority**: Must Have
*   **User Story**:
    *   **As an** Authenticated user,
    *   **I want to** logout of my current session,
    *   **So that** my locally cached access token is destroyed and my session ends.
*   **Acceptance Criteria**:
    *   **Given** a user is authenticated,
    *   **When** they click the logout button,
    *   **Then** the client application removes the JWT access token from local storage and redirects the user to the guest home page.
*   **Business Value**: Protects user sessions on shared devices.
*   **Dependencies**: US-AUTH-02.

### Story ID: US-AUTH-05
*   **Title**: Password Reset Request
*   **Priority**: Should Have
*   **User Story**:
    *   **As a** Registered passenger,
    *   **I want to** request a password reset link,
    *   **So that** I can regain access to my account if I forget my password.
*   **Acceptance Criteria**:
    *   **Given** a user has forgotten their password,
    *   **When** they enter their registered email on the recovery page,
    *   **Then** the system generates a secure, single-use token valid for 1 hour and sends a recovery link to their email.
*   **Business Value**: Reduces support overhead for account lockouts.
*   **Dependencies**: US-AUTH-01.

---

## 2. Profile Management Module (PROF)

### Story ID: US-PROF-01
*   **Title**: View and Update Profile Details
*   **Priority**: Must Have
*   **User Story**:
    *   **As a** Logged-in Passenger,
    *   **I want to** view and modify my name and contact details,
    *   **So that** my bookings contain accurate contact information.
*   **Acceptance Criteria**:
    *   **Given** a passenger is logged in,
    *   **When** they change their profile name or phone number and click save,
    *   **Then** the system validates the fields and updates the user record in the database.
*   **Business Value**: Ensures passenger contact lists remain accurate.
*   **Dependencies**: US-AUTH-02.

### Story ID: US-PROF-02
*   **Title**: Change Password
*   **Priority**: Must Have
*   **User Story**:
    *   **As a** Passenger,
    *   **I want to** update my current password,
    *   **So that** I can secure my account if my password has been compromised.
*   **Acceptance Criteria**:
    *   **Given** a passenger is logged in,
    *   **When** they enter their current password and a new strong password,
    *   **Then** the system verifies the old password, hashes the new one, and saves it.
*   **Business Value**: Enhances account security.
*   **Dependencies**: US-AUTH-02.

### Story ID: US-PROF-03
*   **Title**: Account Deactivation Request
*   **Priority**: Could Have
*   **User Story**:
    *   **As a** Passenger,
    *   **I want to** request the deactivation of my account,
    *   **So that** my personal details are flagged as inactive in the system.
*   **Acceptance Criteria**:
    *   **Given** a passenger wants to deactivate their account,
    *   **When** they submit a deactivation request,
    *   **Then** the system updates their status to `INACTIVE` and logs them out.
*   **Business Value**: Supports user privacy preferences.
*   **Dependencies**: US-AUTH-02.

---

## 3. Bus Search Module (BSRCH)

### Story ID: US-BSRCH-01
*   **Title**: Search Trips by Source, Destination, and Date
*   **Priority**: Must Have
*   **User Story**:
    *   **As a** Passenger,
    *   **I want to** search for bus trips by entering my origin city, destination city, and travel date,
    *   **So that** I can find scheduled bus departures matching my itinerary.
*   **Acceptance Criteria**:
    *   **Given** a passenger is on the search portal,
    *   **When** they select an origin, destination, and departure date,
    *   **Then** the system displays all matching active trips showing departure times, seat counts, and base pricing.
*   **Business Value**: Core booking entry point.
*   **Dependencies**: None.

### Story ID: US-BSRCH-02
*   **Title**: Filter Trips by Bus Category and Amenities
*   **Priority**: Should Have
*   **User Story**:
    *   **As a** Passenger,
    *   **I want to** filter trip search results by bus type (e.g. AC Sleeper, Non-AC Seater),
    *   **So that** I can choose a vehicle category that fits my budget and comfort preferences.
*   **Acceptance Criteria**:
    *   **Given** search results are displayed,
    *   **When** the passenger checks the "AC Sleeper" filter,
    *   **Then** the list updates to display only matches matching the selected category.
*   **Business Value**: Improves booking conversions by helping users find preferred buses faster.
*   **Dependencies**: US-BSRCH-01.

### Story ID: US-BSRCH-03
*   **Title**: Filter Trips by Departure Time
*   **Priority**: Should Have
*   **User Story**:
    *   **As a** Passenger,
    *   **I want to** filter trip search results by time windows (e.g. Morning, Afternoon, Evening),
    *   **So that** I can find departures that align with my schedule.
*   **Acceptance Criteria**:
    *   **Given** search results are displayed,
    *   **When** the passenger selects a departure time filter,
    *   **Then** the system filters search results accordingly.
*   **Business Value**: Improves search efficiency.
*   **Dependencies**: US-BSRCH-01.

---

## 4. Route Search Module (RSRCH)

### Story ID: US-RSRCH-01
*   **Title**: View Route Intermediate Stops
*   **Priority**: Should Have
*   **User Story**:
    *   **As a** Passenger,
    *   **I want to** view the intermediate stops for a trip,
    *   **So that** I can see where the bus stops and estimate my travel timeline.
*   **Acceptance Criteria**:
    *   **Given** search results are displayed,
    *   **When** a passenger clicks on a trip's details,
    *   **Then** the system displays the route's sequenced intermediate stops with their distance and estimated arrival offsets.
*   **Business Value**: Provides travel clarity.
*   **Dependencies**: US-BSRCH-01.

### Story ID: US-RSRCH-02
*   **Title**: Map Station View
*   **Priority**: Could Have
*   **User Story**:
    *   **As a** Passenger,
    *   **I want to** view the location of route stops on an interactive map,
    *   **So that** I can locate the boarding terminal easily.
*   **Acceptance Criteria**:
    *   **Given** a passenger is viewing trip details,
    *   **When** they select "Map View",
    *   **Then** the system displays coordinates of stops on a map view.
*   **Business Value**: Enhances booking usability.
*   **Dependencies**: US-RSRCH-01.

---

## 5. Seat Selection Module (SEAT)

### Story ID: US-SEAT-01
*   **Title**: View Seat Map Layout
*   **Priority**: Must Have
*   **User Story**:
    *   **As a** Passenger,
    *   **I want to** view the seat layout map of the bus assigned to a trip,
    *   **So that** I can see which seats are available or booked.
*   **Acceptance Criteria**:
    *   **Given** a passenger has selected a trip,
    *   **When** they open the seating page,
    *   **Then** the system loads the seat layout matching the bus type, displaying the status of each seat.
*   **Business Value**: Enables self-service seat allocation.
*   **Dependencies**: US-BSRCH-01.

### Story ID: US-SEAT-02
*   **Title**: Select and Reserve Multiple Seats
*   **Priority**: Must Have
*   **User Story**:
    *   **As a** Passenger,
    *   **I want to** select up to 6 available seats on the seat layout map,
    *   **So that** I can reserve tickets for myself and my companions.
*   **Acceptance Criteria**:
    *   **Given** a passenger is selecting seats,
    *   **When** they click on multiple available seats,
    *   **Then** the system highlights the selections and checks that the total count does not exceed 6.
*   **Business Value**: Core reservation engine constraint.
*   **Dependencies**: US-SEAT-01.

### Story ID: US-SEAT-03
*   **Title**: Seating Map Status Colors
*   **Priority**: Should Have
*   **User Story**:
    *   **As a** Passenger,
    *   **I want to** see clear color-coding for seat statuses (e.g. Green for Available, Grey for Booked, Yellow for Selected),
    *   **So that** I can quickly distinguish seat states.
*   **Acceptance Criteria**:
    *   **Given** the seat layout map is open,
    *   **Then** seat states are displayed in their respective colors.
*   **Business Value**: Enhances usability.
*   **Dependencies**: US-SEAT-01.

---

## 6. Booking Module (BOOK)

### Story ID: US-BOOK-01
*   **Title**: Passenger Info Input
*   **Priority**: Must Have
*   **User Story**:
    *   **As a** Passenger,
    *   **I want to** enter the name, age, and gender for each selected seat,
    *   **So that** passenger details are correctly registered on the trip manifest.
*   **Acceptance Criteria**:
    *   **Given** a passenger has selected seats,
    *   **When** they proceed to the passenger information page,
    *   **Then** the system displays form inputs for each seat, validating that required fields are populated.
*   **Business Value**: Necessary for ticket generation.
*   **Dependencies**: US-SEAT-02.

### Story ID: US-BOOK-02
*   **Title**: Auto-Calculate Fare
*   **Priority**: Must Have
*   **User Story**:
    *   **As a** Passenger,
    *   **I want to** view a dynamic breakdown of my total ticket fare,
    *   **So that** I know the exact cost before payment.
*   **Acceptance Criteria**:
    *   **Given** a passenger has selected seats,
    *   **When** passenger details are entered,
    *   **Then** the system calculates and displays the base fare, taxes, and total checkout cost.
*   **Business Value**: Financial transparency.
*   **Dependencies**: US-BOOK-01.

### Story ID: US-BOOK-03
*   **Title**: 10-Minute Seat Lock
*   **Priority**: Must Have
*   **User Story**:
    *   **As a** Passenger,
    *   **I want to** temporarily lock my selected seats for 10 minutes during checkout,
    *   **So that** they cannot be booked by another user while I enter my payment details.
*   **Acceptance Criteria**:
    *   **Given** a passenger proceeds to checkout,
    *   **When** the booking record is created in a `PENDING` state,
    *   **Then** the system locks the selected seats. If checkout is not completed within 10 minutes, the lock expires and the seats become available.
*   **Business Value**: Prevents concurrent double booking.
*   **Dependencies**: US-BOOK-01.

---

## 7. Payment Simulation Module (PAY)

### Story ID: US-PAY-01
*   **Title**: Simulate Payment Processing
*   **Priority**: Must Have
*   **User Story**:
    *   **As a** Passenger,
    *   **I want to** enter mock card details to process payments,
    *   **So that** my pending booking is confirmed.
*   **Acceptance Criteria**:
    *   **Given** a booking is `PENDING` and seats are locked,
    *   **When** the passenger submits mock card details,
    *   **Then** the system processes the payment, updates the booking status to `CONFIRMED`, and locks the seats permanently.
*   **Business Value**: Completes the booking process.
*   **Dependencies**: US-BOOK-03.

### Story ID: US-PAY-02
*   **Title**: Payment Failure Handling
*   **Priority**: Must Have
*   **User Story**:
    *   **As a** Passenger,
    *   **I want to** see an error message if my mock payment fails,
    *   **So that** I can retry the payment or use a different method.
*   **Acceptance Criteria**:
    *   **Given** a booking is `PENDING` and seats are locked,
    *   **When** the payment request fails,
    *   **Then** the system updates the booking status to `FAILED`, releases the seat locks, and displays a payment failure alert to the user.
*   **Business Value**: Prevents booking errors.
*   **Dependencies**: US-PAY-01.

### Story ID: US-PAY-03
*   **Title**: View Payment Logs
*   **Priority**: Should Have
*   **User Story**:
    *   **As an** Admin,
    *   **I want to** view transaction history details,
    *   **So that** I can trace and audit payments.
*   **Acceptance Criteria**:
    *   **Given** an admin is on the payments log page,
    *   **When** they request transaction details,
    *   **Then** the system displays payment logs showing transaction IDs, reference numbers, dates, and amounts.
*   **Business Value**: Provides audit controls.
*   **Dependencies**: US-PAY-01.

---

## 8. Ticket Generation Module (TICK)

### Story ID: US-TICK-01
*   **Title**: QR Ticket Creation
*   **Priority**: Must Have
*   **User Story**:
    *   **As a** Passenger,
    *   **I want to** receive a digital ticket with a unique QR code after booking,
    *   **So that** I can present it to the conductor for scanning.
*   **Acceptance Criteria**:
    *   **Given** a passenger completes a booking,
    *   **When** the booking status becomes `CONFIRMED`,
    *   **Then** the system generates a ticket record containing an encrypted QR code hash.
*   **Business Value**: Replaces paper tickets with digital verification.
*   **Dependencies**: US-PAY-01.

### Story ID: US-TICK-02
*   **Title**: Download PDF Ticket
*   **Priority**: Must Have
*   **User Story**:
    *   **As a** Passenger,
    *   **I want to** download my booking confirmation as a PDF file,
    *   **So that** I can access my ticket offline.
*   **Acceptance Criteria**:
    *   **Given** a booking is confirmed,
    *   **When** the passenger clicks "Download PDF",
    *   **Then** the system generates and downloads a PDF ticket containing the passenger manifest, QR code, and travel details.
*   **Business Value**: Provides offline ticket access.
*   **Dependencies**: US-TICK-01.

### Story ID: US-TICK-03
*   **Title**: Auto-send Confirmation Alerts
*   **Priority**: Should Have
*   **User Story**:
    *   **As a** Passenger,
    *   **I want to** receive my booking details via email,
    *   **So that** I have a copy of my ticket in my inbox.
*   **Acceptance Criteria**:
    *   **Given** a booking is confirmed,
    *   **When** the booking status changes,
    *   **Then** the system sends a confirmation email to the passenger.
*   **Business Value**: Ensures clear passenger communication.
*   **Dependencies**: US-TICK-01.

---

## 9. Booking History Module (HIST)

### Story ID: US-HIST-01
*   **Title**: View Booking History Dashboard
*   **Priority**: Must Have
*   **User Story**:
    *   **As a** Passenger,
    *   **I want to** view my past and upcoming bookings in my profile dashboard,
    *   **So that** I can manage my travel plans.
*   **Acceptance Criteria**:
    *   **Given** a passenger is logged in,
    *   **When** they open the "My Bookings" page,
    *   **Then** the system retrieves and displays a list of their past and upcoming bookings.
*   **Business Value**: Provides a centralized booking overview.
*   **Dependencies**: US-AUTH-02, US-PAY-01.

### Story ID: US-HIST-02
*   **Title**: Cancel Booking and Request Refund
*   **Priority**: Must Have
*   **User Story**:
    *   **As a** Passenger,
    *   **I want to** cancel an upcoming booking,
    *   **So that** I can release my seat and receive a refund according to the cancellation policy.
*   **Acceptance Criteria**:
    *   **Given** a passenger has a confirmed upcoming booking,
    *   **When** they select "Cancel Booking" before the departure window,
    *   **Then** the system cancels the booking, updates the seat statuses, and issues a refund according to the cancellation business rules.
*   **Business Value**: Self-service cancellations reduce support requests.
*   **Dependencies**: US-HIST-01.

---

## 10. Feedback Module (FEED)

### Story ID: US-FEED-01
*   **Title**: Submit Trip Review
*   **Priority**: Should Have
*   **User Story**:
    *   **As a** Passenger,
    *   **I want to** submit a rating and comment for a completed trip,
    *   **So that** I can share my travel experience.
*   **Acceptance Criteria**:
    *   **Given** a passenger is logged in and has completed a trip,
    *   **When** they submit a review,
    *   **Then** the system validates and saves the feedback in the database.
*   **Business Value**: Helps monitor service quality.
*   **Dependencies**: US-AUTH-02, US-HIST-01.

### Story ID: US-FEED-02
*   **Title**: View Feedback Aggregator
*   **Priority**: Could Have
*   **User Story**:
    *   **As an** Admin,
    *   **I want to** view passenger reviews in a dashboard,
    *   **So that** I can track customer satisfaction.
*   **Acceptance Criteria**:
    *   **Given** an admin is logged in,
    *   **When** they view the feedback page,
    *   **Then** the system displays passenger reviews sorted by trip or rating.
*   **Business Value**: Provides insights for service improvement.
*   **Dependencies**: US-FEED-01.

---

## 11. Dashboard Module (DASH)

### Story ID: US-DASH-01
*   **Title**: Admin Operational Dashboard Stats
*   **Priority**: Must Have
*   **User Story**:
    *   **As an** Admin,
    *   **I want to** view daily bookings, revenue, and active bus metrics,
    *   **So that** I can monitor daily operations.
*   **Acceptance Criteria**:
    *   **Given** an admin lands on the home dashboard,
    *   **Then** the system displays daily performance cards for revenue, total bookings, active routes, and fleet status.
*   **Business Value**: Provides a high-level operational overview.
*   **Dependencies**: US-AUTH-02.

### Story ID: US-DASH-02
*   **Title**: Dashboard Connection Alerts
*   **Priority**: Could Have
*   **User Story**:
    *   **As an** Admin,
    *   **I want to** see live alerts for system errors or connection issues on the dashboard,
    *   **So that** I can respond to technical issues quickly.
*   **Acceptance Criteria**:
    *   **Given** an admin dashboard is open,
    *   **When** a system exception or threshold is reached,
    *   **Then** the system displays a status banner.
*   **Business Value**: Improves system monitoring.
*   **Dependencies**: US-DASH-01.

### Story ID: US-DASH-03
*   **Title**: Fleet Capacity Loading Factor Analysis
*   **Priority**: Should Have
*   **User Story**:
    *   **As an** Admin,
    *   **I want to** see seat occupancy rates across active routes,
    *   **So that** I can optimize bus scheduling.
*   **Acceptance Criteria**:
    *   **Given** an admin is on the dashboard,
    *   **Then** the system displays average occupancy rates by route.
*   **Business Value**: Enhances fleet efficiency.
*   **Dependencies**: US-DASH-01.

---

## 12. Bus Management Module (BUSM)

### Story ID: US-BUSM-01
*   **Title**: Add Bus to Fleet
*   **Priority**: Must Have
*   **User Story**:
    *   **As an** Admin,
    *   **I want to** add a new bus with its registration plate, model, and seat layout,
    *   **So that** it can be scheduled for trips.
*   **Acceptance Criteria**:
    *   **Given** an admin is on the bus fleet page,
    *   **When** they enter a unique registration number, capacity, and select a layout type,
    *   **Then** the system registers the bus and generates its seat map.
*   **Business Value**: Allows fleet expansion.
*   **Dependencies**: US-AUTH-02.

### Story ID: US-BUSM-02
*   **Title**: Edit Bus Details & Status
*   **Priority**: Must Have
*   **User Story**:
    *   **As an** Admin,
    *   **I want to** update a bus's information or change its status,
    *   **So that** the scheduler knows which buses are available.
*   **Acceptance Criteria**:
    *   **Given** an admin is viewing the bus fleet,
    *   **When** they update details or set the status to `MAINTENANCE`,
    *   **Then** the system updates the record and flags the bus as unavailable for new scheduling.
*   **Business Value**: Ensures accurate fleet scheduling status.
*   **Dependencies**: US-BUSM-01.

### Story ID: US-BUSM-03
*   **Title**: Custom Bus Seating Layout Configurations
*   **Priority**: Should Have
*   **User Story**:
    *   **As an** Admin,
    *   **I want to** configure seat layout templates (e.g. 2x2, Sleeper 1x2),
    *   **So that** I can support different bus types.
*   **Acceptance Criteria**:
    *   **Given** an admin is configuring layouts,
    *   **When** they define row and column layouts for a template,
    *   **Then** the system saves the configuration template.
*   **Business Value**: Supports diverse fleet types.
*   **Dependencies**: US-BUSM-01.

---

## 13. Driver Management Module (DRVM)

### Story ID: US-DRVM-01
*   **Title**: Register Driver Profile
*   **Priority**: Must Have
*   **User Story**:
    *   **As an** Admin,
    *   **I want to** register a driver with their name, license number, and contact details,
    *   **So that** they can be assigned to trips.
*   **Acceptance Criteria**:
    *   **Given** an admin is on the driver page,
    *   **When** they enter details and a unique license number,
    *   **Then** the driver profile is created.
*   **Business Value**: Core driver resource registration.
*   **Dependencies**: US-AUTH-02.

### Story ID: US-DRVM-02
*   **Title**: Update Driver Status
*   **Priority**: Must Have
*   **User Story**:
    *   **As an** Admin,
    *   **I want to** update a driver's availability status (e.g. Active, On Leave),
    *   **So that** they are not assigned to trips when unavailable.
*   **Acceptance Criteria**:
    *   **Given** an admin is viewing driver details,
    *   **When** they change the status to `ON_LEAVE`,
    *   **Then** the system prevents scheduling assignments for that driver during the leave period.
*   **Business Value**: Simplifies roster scheduling.
*   **Dependencies**: US-DRVM-01.

### Story ID: US-DRVM-03
*   **Title**: Assign Driver to Scheduled Trips
*   **Priority**: Must Have
*   **User Story**:
    *   **As an** Admin,
    *   **I want to** assign a driver to a scheduled trip,
    *   **So that** the driver's schedule is locked for that time slot.
*   **Acceptance Criteria**:
    *   **Given** an admin is editing a trip schedule,
    *   **When** they select an available driver,
    *   **Then** the system checks for scheduling conflicts before saving.
*   **Business Value**: Prevents driver assignment conflicts.
*   **Dependencies**: US-DRVM-01.

---

## 14. Route Management Module (RTM)

### Story ID: US-RTM-01
*   **Title**: Create Route and Sequence Stops
*   **Priority**: Must Have
*   **User Story**:
    *   **As an** Admin,
    *   **I want to** define routes with sequenced stops,
    *   **So that** trips can be scheduled along structured routes.
*   **Acceptance Criteria**:
    *   **Given** an admin is creating a route,
    *   **When** they enter the start, end, and sequenced intermediate stops,
    *   **Then** the system saves the route sequence.
*   **Business Value**: Establishes route paths.
*   **Dependencies**: US-AUTH-02.

### Story ID: US-RTM-02
*   **Title**: Edit Route Details
*   **Priority**: Should Have
*   **User Story**:
    *   **As an** Admin,
    *   **I want to** update route distances and estimated durations,
    *   **So that** schedule estimates remain accurate.
*   **Acceptance Criteria**:
    *   **Given** an admin is viewing routes,
    *   **When** they update stop details or distances,
    *   **Then** the system saves the changes and updates affected schedules.
*   **Business Value**: Maintains accurate travel times.
*   **Dependencies**: US-RTM-01.

### Story ID: US-RTM-03
*   **Title**: Delete/Archive Inactive Routes
*   **Priority**: Should Have
*   **User Story**:
    *   **As an** Admin,
    *   **I want to** archive inactive routes,
    *   **So that** they cannot be selected for new trip schedules.
*   **Acceptance Criteria**:
    *   **Given** an admin wants to delete a route,
    *   **When** they archive the route,
    *   **Then** the system marks it as archived and hides it from the scheduler.
*   **Business Value**: Keeps route lists clean.
*   **Dependencies**: US-RTM-01.

---

## 15. Schedule Management Module (SCHM)

### Story ID: US-SCHM-01
*   **Title**: Create Recurring Trip Schedule
*   **Priority**: Must Have
*   **User Story**:
    *   **As an** Admin,
    *   **I want to** create recurring trip schedules for routes,
    *   **So that** passenger search shows available upcoming departures.
*   **Acceptance Criteria**:
    *   **Given** an admin is scheduling trips,
    *   **When** they specify a route, bus, driver, recurrence pattern, and date range,
    *   **Then** the system generates trip instances and corresponding seat layouts.
*   **Business Value**: Automates trip scheduling.
*   **Dependencies**: US-BUSM-01, US-DRVM-01, US-RTM-01.

### Story ID: US-SCHM-02
*   **Title**: Adjust Base Fare
*   **Priority**: Should Have
*   **User Story**:
    *   **As an** Admin,
    *   **I want to** adjust base fares for specific trips or schedules,
    *   **So that** ticket pricing updates dynamically.
*   **Acceptance Criteria**:
    *   **Given** an admin is viewing a trip or schedule,
    *   **When** they update the base fare,
    *   **Then** the system updates pricing for all future bookings on that trip.
*   **Business Value**: Allows flexible pricing.
*   **Dependencies**: US-SCHM-01.

### Story ID: US-SCHM-03
*   **Title**: Cancel Scheduled Trip Instance
*   **Priority**: Must Have
*   **User Story**:
    *   **As an** Admin,
    *   **I want to** cancel a scheduled trip instance,
    *   **So that** affected passengers are notified and refunded.
*   **Acceptance Criteria**:
    *   **Given** an admin is viewing trip schedules,
    *   **When** they cancel a trip,
    *   **Then** the system changes the status to `CANCELLED`, notifies passengers, and processes refunds.
*   **Business Value**: Handles trip cancellations.
*   **Dependencies**: US-SCHM-01.

---

## 16. Booking Management Module (BKM)

### Story ID: US-BKM-01
*   **Title**: Admin Booking Override
*   **Priority**: Should Have
*   **User Story**:
    *   **As an** Admin,
    *   **I want to** cancel or modify bookings on behalf of passengers,
    *   **So that** I can assist with customer support requests.
*   **Acceptance Criteria**:
    *   **Given** an admin is in the support portal,
    *   **When** they select a booking and cancel it,
    *   **Then** the system updates the booking status and releases the seats.
*   **Business Value**: Facilitates customer support workflows.
*   **Dependencies**: US-PAY-01.

### Story ID: US-BKM-02
*   **Title**: View Master Reservation Logs
*   **Priority**: Must Have
*   **User Story**:
    *   **As an** Admin,
    *   **I want to** view and search all system bookings,
    *   **So that** I can audit passenger reservations.
*   **Acceptance Criteria**:
    *   **Given** an admin is on the booking list page,
    *   **When** they filter by date or booking reference,
    *   **Then** the system displays matching booking records.
*   **Business Value**: Provides operational booking audits.
*   **Dependencies**: US-PAY-01.

---

## 17. User Management Module (USRM)

### Story ID: US-USRM-01
*   **Title**: Admin User Control Panel
*   **Priority**: Should Have
*   **User Story**:
    *   **As an** Admin,
    *   **I want to** view a list of all registered users,
    *   **So that** I can manage accounts and roles.
*   **Acceptance Criteria**:
    *   **Given** an admin is in the management portal,
    *   **When** they view the user list,
    *   **Then** the system displays all user accounts.
*   **Business Value**: User directory management.
*   **Dependencies**: US-AUTH-02.

### Story ID: US-USRM-02
*   **Title**: Modify User Roles
*   **Priority**: Must Have
*   **User Story**:
    *   **As an** Admin,
    *   **I want to** change a user's role (e.g. passenger to conductor),
    *   **So that** they receive the correct access privileges.
*   **Acceptance Criteria**:
    *   **Given** an admin is viewing a user's details,
    *   **When** they select a new role and save,
    *   **Then** the system updates the user's role and applies the new permissions matrix.
*   **Business Value**: Manages internal user authorization.
*   **Dependencies**: US-USRM-01.

---

## 18. Reports Module (REPT)

### Story ID: US-REPT-01
*   **Title**: Generate Route Revenue Reports
*   **Priority**: Must Have
*   **User Story**:
    *   **As an** Admin,
    *   **I want to** view a report of revenue generated by route over a date range,
    *   **So that** I can evaluate route financial performance.
*   **Acceptance Criteria**:
    *   **Given** an admin is on the reports portal,
    *   **When** they select a route and date range,
    *   **Then** the system displays a revenue summary.
*   **Business Value**: Key business performance metrics.
*   **Dependencies**: US-PAY-01.

### Story ID: US-REPT-02
*   **Title**: Generate Load Factor Audits
*   **Priority**: Should Have
*   **User Story**:
    *   **As an** Admin,
    *   **I want to** view load factor reports for trips,
    *   **So that** I can identify routes with low occupancy.
*   **Acceptance Criteria**:
    *   **Given** an admin is on the reports page,
    *   **When** they select a date range,
    *   **Then** the system displays average occupancy rates.
*   **Business Value**: Fleet utilization optimization.
*   **Dependencies**: US-SCHM-01.

### Story ID: US-REPT-03
*   **Title**: Export Reports to CSV
*   **Priority**: Could Have
*   **User Story**:
    *   **As an** Admin,
    *   **I want to** export reports as CSV files,
    *   **So that** I can analyze data in spreadsheet applications.
*   **Acceptance Criteria**:
    *   **Given** a report is generated,
    *   **When** the admin clicks "Export CSV",
    *   **Then** the system generates and downloads the CSV file.
*   **Business Value**: Allows external financial auditing.
*   **Dependencies**: US-REPT-01.

---

## 19. Passenger Verification Module (VERF)

### Story ID: US-VERF-01
*   **Title**: View Conductor Passenger Manifest
*   **Priority**: Must Have
*   **User Story**:
    *   **As a** Conductor,
    *   **I want to** view the passenger manifest and seating chart for my active trip,
    *   **So that** I can verify passenger counts.
*   **Acceptance Criteria**:
    *   **Given** a conductor is logged in and selects a trip,
    *   **When** they open the manifest page,
    *   **Then** the system displays passenger names, seat numbers, and boarding status.
*   **Business Value**: Operational check-in roster.
*   **Dependencies**: US-AUTH-02, US-SCHM-01.

### Story ID: US-VERF-02
*   **Title**: Manual Boarding Override
*   **Priority**: Should Have
*   **User Story**:
    *   **As a** Conductor,
    *   **I want to** manually mark a passenger as boarded,
    *   **So that** I can check in passengers who cannot present a digital ticket.
*   **Acceptance Criteria**:
    *   **Given** a conductor is viewing the manifest list,
    *   **When** they click "Manual Check-In" for a passenger,
    *   **Then** the system updates the ticket status to `BOARDED`.
*   **Business Value**: Fallback for scanning issues.
*   **Dependencies**: US-VERF-01.

---

## 20. QR Ticket Scanning Module (SCAN)

### Story ID: US-SCAN-01
*   **Title**: Mobile Browser QR Camera Scan
*   **Priority**: Must Have
*   **User Story**:
    *   **As a** Conductor,
    *   **I want to** scan ticket QR codes using my mobile device's camera,
    *   **So that** I can verify tickets at boarding.
*   **Acceptance Criteria**:
    *   **Given** a conductor has the scanner open,
    *   **When** they point the camera at a QR code,
    *   **Then** the system captures the image, decodes the payload, and sends it to the server for verification.
*   **Business Value**: Core digital verification mechanism.
*   **Dependencies**: US-AUTH-02.

### Story ID: US-SCAN-02
*   **Title**: Validate QR Expiry & Route Details
*   **Priority**: Must Have
*   **User Story**:
    *   **As a** Conductor,
    *   **I want to** see validation results for scanned tickets,
    *   **So that** I can ensure the ticket is valid for the current trip.
*   **Acceptance Criteria**:
    *   **Given** a conductor scans a QR code,
    *   **When** the server processes the ticket hash,
    *   **Then** it verifies that the ticket is valid for the current trip and date, displaying a success screen.
*   **Business Value**: Prevents unauthorized boarding.
*   **Dependencies**: US-SCAN-01.

### Story ID: US-SCAN-02 (Continued)
*   **Title**: Boarding Duplicate Scan Alert
*   **Priority**: Must Have
*   **User Story**:
    *   **As a** Conductor,
    *   **I want to** see an alert if a ticket has already been scanned,
    *   **So that** I can prevent duplicate boarding attempts.
*   **Acceptance Criteria**:
    *   **Given** a conductor scans a ticket,
    *   **When** the ticket status is already `BOARDED`,
    *   **Then** the system displays a warning screen: "Ticket Already Scanned".
*   **Business Value**: Prevents ticket reuse.
*   **Dependencies**: US-SCAN-01.
