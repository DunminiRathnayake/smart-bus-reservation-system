# User Stories

This document outlines the user stories and acceptance criteria for the three primary roles in the **SmartGo** ecosystem: **Passenger**, **Administrator (Admin)**, and **Conductor**.

---

## 1. Passenger User Stories

### US-PAS-01: User Registration
*   **As a** Guest passenger,
*   **I want to** register for an account using my email and phone number,
*   **So that** I can purchase tickets, track my booking history, and save my preferences.
*   **Acceptance Criteria**:
    *   **Scenario 1: Successful Registration**
        *   **Given** a guest passenger is on the registration page,
        *   **When** they submit a valid email, unique phone number, name, and password,
        *   **Then** the system registers the account and sends a welcome notification.
    *   **Scenario 2: Duplicate Email or Phone**
        *   **Given** a passenger attempts to register,
        *   **When** they enter an email or phone number that already exists in the system,
        *   **Then** registration fails, displaying an error message: "Account already exists with this email/phone number."

### US-PAS-02: Search Buses
*   **As a** Passenger,
*   **I want to** search for buses by entering my origin, destination, and travel date,
*   **So that** I can view a list of available trips and fares matching my travel plans.
*   **Acceptance Criteria**:
    *   **Given** an authenticated or guest passenger is on the home page,
    *   **When** they select an origin, destination, and a valid future date,
    *   **Then** the system returns a list of active trips showing bus model, type (AC/Non-AC), departure/arrival times, travel duration, available seats, and ticket price.
    *   **Given** the search results are loaded,
    *   **When** the passenger filters by bus type or departure time,
    *   **Then** the results are instantly narrowed down based on selection.

### US-PAS-03: Real-Time Seat Selection
*   **As a** Passenger,
*   **I want to** view a visual representation of the bus seat layout,
*   **So that** I can select my preferred seat(s) before proceeding to check out.
*   **Acceptance Criteria**:
    *   **Given** a passenger is on the trip details page,
    *   **When** they select "Choose Seats",
    *   **Then** the system displays a seat map indicating which seats are booked, available, or currently locked.
    *   **When** the passenger clicks on an available seat,
    *   **Then** the seat highlights as "Selected" and is temporarily locked for 10 minutes.

### US-PAS-04: Booking & Payment Checkout
*   **As a** Passenger,
*   **I want to** pay for my selected seats using a secure payment method,
*   **So that** my reservation is confirmed and my digital ticket is issued.
*   **Acceptance Criteria**:
    *   **Given** a passenger has selected seats and entered passenger details,
    *   **When** they submit valid mock payment details (simulated card processing),
    *   **Then** the system processes the payment, updates the booking status to `CONFIRMED`, locks the seats permanently for that trip, and generates a digital QR-enabled ticket.
    *   **When** the checkout process takes longer than 10 minutes without completion,
    *   **Then** the system automatically expires the temporary seat locks and frees the seats.

### US-PAS-05: Digital Ticket Download
*   **As a** Passenger,
*   **I want to** view and download my booked tickets in PDF format,
*   **So that** I can present it offline during boarding.
*   **Acceptance Criteria**:
    *   **Given** a passenger has a confirmed booking,
    *   **When** they navigate to "My Bookings" and select "Download PDF",
    *   **Then** the system generates and streams a PDF containing the boarding details, seat numbers, billing info, and a high-resolution QR code.

---

## 2. Administrator (Admin) User Stories

### US-ADM-01: Bus Fleet Management
*   **As an** Admin,
*   **I want to** manage the bus catalog by creating, editing, and disabling buses,
*   **So that** the schedule planner always assigns functional vehicles with correct seating configurations.
*   **Acceptance Criteria**:
    *   **Given** an logged-in Admin is on the "Bus Fleet" portal,
    *   **When** they create a new bus with registration number, vehicle model, capacity, and seat layout type,
    *   **Then** the bus is added to the system and is available for scheduling.
    *   **When** they mark a bus as "Maintenance",
    *   **Then** the system prevents scheduling new trips with this bus, but allows existing trips to continue (raising a warning flag).

### US-ADM-02: Route Configuration
*   **As an** Admin,
*   **I want to** create and modify routes with sequenced stops and distances,
*   **So that** trips can be scheduled along defined paths with calculated durations.
*   **Acceptance Criteria**:
    *   **Given** an logged-in Admin is on the "Route Planner" portal,
    *   **When** they define a route from "City A" to "City B" with intermediate stops "City C" and "City D",
    *   **Then** the system saves the route sequence and automatically computes cumulative distance.
    *   **When** the admin updates a stop location in an active route,
    *   **Then** the changes propagate to all future scheduled trips of that route.

### US-ADM-03: Trip Schedule Generation
*   **As an** Admin,
*   **I want to** schedule recurring bus trips on routes with specific departure dates, times, base fares, and assigned buses,
*   **So that** passengers can discover them when searching.
*   **Acceptance Criteria**:
    *   **Given** an Admin is creating a trip schedule,
    *   **When** they specify a route, bus, daily repetition, start/end dates, and base price,
    *   **Then** the system generates active trip instances for those dates, initializing empty seat map configurations.

### US-ADM-04: Dashboard & Revenue Reports
*   **As an** Admin/Transit Operator,
*   **I want to** view dashboard charts showing revenue, passenger volume, and route performance metrics,
*   **So that** I can make data-driven scheduling and pricing adjustments.
*   **Acceptance Criteria**:
    *   **Given** an logged-in Admin lands on the dashboard,
    *   **Then** the system displays real-time statistics for daily active bookings, gross revenue, and pending issues.
    *   **When** they request a monthly report by route,
    *   **Then** the system aggregates bookings and payment history to render a visual chart of seat occupancy and revenue per kilometer.

---

## 3. Conductor User Stories

### US-CON-01: View Assigned Trips
*   **As a** Conductor,
*   **I want to** login and view my assigned trips for the day,
*   **So that** I know which route, bus, and departure times I am coordinating.
*   **Acceptance Criteria**:
    *   **Given** an authenticated Conductor opens the mobile portal,
    *   **When** they load the homepage,
    *   **Then** they see their assigned active trips for today and tomorrow, ordered by departure time.

### US-CON-02: Passenger Manifest Verification
*   **As a** Conductor,
*   **I want to** view the passenger manifest and seat distribution for my active trip,
*   **So that** I can check passenger counts and boarding status.
*   **Acceptance Criteria**:
    *   **Given** a Conductor has selected an assigned trip,
    *   **When** they view "Passenger Manifest",
    *   **Then** the system displays a list of confirmed bookings showing seat numbers, passenger names, and boarding status (Checked-In, Pending).

### US-CON-03: QR Boarding Scanner
*   **As a** Conductor,
*   **I want to** scan the QR code on a passenger’s digital ticket using my mobile browser's camera,
*   **So that** the ticket is authenticated and the passenger is marked as boarded.
*   **Acceptance Criteria**:
    *   **Given** a Conductor has the scanner overlay open on their mobile device,
    *   **When** they scan a passenger's ticket QR code,
    *   **Then** the system calls the backend to validate the token.
    *   **Scenario 1: Successful Ticket Verification**
        *   **When** the ticket is valid, belongs to the current trip, and has status `CONFIRMED`,
        *   **Then** the system updates the ticket status to `BOARDED` and displays a green success checkmark with seat details.
    *   **Scenario 2: Ticket Already Scanned**
        *   **When** the scanned ticket already has status `BOARDED`,
        *   **Then** the system displays a red warning: "Ticket Already Scanned - Possible Duplicate Entry".
    *   **Scenario 3: Invalid Trip Match**
        *   **When** the ticket is valid but belongs to a different trip or different date,
        *   **Then** the system displays a red warning: "Invalid Trip - Expected Trip ID: XYZ".
