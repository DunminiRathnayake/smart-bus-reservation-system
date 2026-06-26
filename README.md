# SmartGo – Smart Bus Reservation & Management System

Welcome to the **SmartGo** repository. SmartGo is a modern, scalable, enterprise-grade Bus Reservation & Management System designed to streamline transport operations and enhance the passenger travel booking experience. 

It provides passengers with a seamless web portal to search for buses, check schedules, select seats, make secure online payments, and obtain digital tickets (PDF + QR code). For administrators and transit staff, SmartGo delivers a comprehensive control panel to manage the fleet, routes, schedules, passenger bookings, and real-time transit reports. Conductors are equipped with ticket validation capabilities via QR scanning.

---

## 🎯 Objectives
*   **Seamless Reservation**: Provide an intuitive and responsive interface for passengers to book and pay for bus tickets.
*   **Operational Efficiency**: Empower transit administrators to manage routes, schedules, buses, and fares dynamically.
*   **Security & Compliance**: Secure financial transactions and personal data using industry-standard JWT authentication and TLS/HTTPS encryption.
*   **Digital validation**: Eradicate paper ticketing through secure digital PDF tickets containing verifiable QR codes scanned by conductors in real-time.
*   **Data-Driven Insights**: Offer detailed financial and operational reports to optimize route schedules and resource allocation.

---

## 🚀 Features & Modules

### 1. Authentication & Security
*   Secure registration and login for Passengers, Admins, and Conductors.
*   Stateless authentication using JWT (JSON Web Tokens).
*   Role-Based Access Control (RBAC) to restrict endpoint access.

### 2. Passenger Portal
*   **Search & Filter**: Find buses by departure, destination, date, and class.
*   **Seat Selection**: Real-time visual seat map configuration per bus type.
*   **Secure Payment**: Integrated checkout with mock payment processing.
*   **Digital Tickets**: Access PDF ticket receipts containing secure QR codes.
*   **Travel History**: View active, completed, or cancelled bookings.

### 3. Administrator Dashboard
*   **Fleet Management**: CRUD operations on buses, types, and capacity.
*   **Route & Schedule Planner**: Define routes, stops, distances, pricing, and recurring departure schedules.
*   **User & Conductor Management**: Administer passenger accounts and assign conductors to specific trips.
*   **Financial & Booking Reports**: Interactive charts showing passenger volume, route revenue, and occupancy rates.

### 4. Conductor Console
*   **Trip View**: Monitor assigned trips, schedules, and bus capacity.
*   **Passenger Manifest**: Retrieve the list of ticketed passengers for a trip.
*   **Ticket Verification**: Scan/verify passenger QR codes to register boarding.

---

## 🛠️ Technology Stack

| Layer | Technology | Version / Details |
| :--- | :--- | :--- |
| **Backend** | Java | 21 (LTS) |
| | Spring Boot | 3.x |
| | Security & Auth | Spring Security + JWT Authentication |
| | Database Access | Spring Data JPA + Hibernate |
| | Database Migration | Flyway |
| | Mapping & Helpers | Lombok + MapStruct |
| | Validation | Jakarta Bean Validation (Hibernate Validator) |
| | Documentation | Swagger UI / OpenAPI 3.0 |
| **Frontend** | Framework | React 18+ (SPA) |
| | Build Tool | Vite |
| | Styling | Tailwind CSS |
| | HTTP Client | Axios |
| | Routing | React Router v6 |
| **Database** | RDBMS | PostgreSQL |
| **VCS** | Version Control | Git & GitHub |

---

## 📂 Folder Structure

The repository is structured as a monorepo to organize backend, database scripts, frontend, and design documentation in a unified workspace:

```text
smartgo/
├── backend/                  # Spring Boot 3 Java Backend
├── frontend/                 # React + Vite Frontend Application
├── database/                 # Raw schema scripts, seeds, and migration backups
├── docs/                     # System design and specifications
│   ├── 01_SRS.md             # Software Requirements Specification
│   ├── 02_User_Stories.md    # Agile User Stories and Acceptance Criteria
│   ├── 03_Use_Cases.md       # Major Use Case specifications
│   ├── 04_ER_Diagram.md      # Database Entity-Relationship design
│   ├── 05_Class_Diagram.md   # Architectural Class Diagram documentation
│   ├── 06_API_Design.md      # REST API endpoints contract
│   ├── 07_Project_Architecture.md # Layered architecture, security flows, sequence diagrams
│   └── images/               # Architectural diagrams and mockups
├── .gitignore                # Global git ignore configuration
├── LICENSE                   # Project license (MIT)
└── README.md                 # Project README (This document)
```

---

## 🗺️ Development Roadmap

### Phase 1: Planning & Design (Current)
*   [x] Establish folder structure and repository configuration.
*   [x] Complete Software Requirements Specification (SRS).
*   [x] Design Database Schemas (ER Diagram) and Class Diagrams.
*   [x] Define REST API contract (Swagger/OpenAPI).
*   [x] Document Layered Architecture and Request Lifecycles.

### Phase 2: Database & Backend Foundation
*   [ ] Configure PostgreSQL database and setup Flyway migrations.
*   [ ] Setup Spring Boot project with security filters and JWT processing.
*   [ ] Implement Core Domain Entities and Spring Data Repositories.
*   [ ] Write REST Controllers and Service layers for User Management and Auth.

### Phase 3: Route, Fleet & Booking Engine
*   [ ] Develop Route, Schedule, and Bus management systems.
*   [ ] Create locking mechanisms for Real-time Seat Allocation.
*   [ ] Implement mock Payment gateway and Booking service.
*   [ ] Integrate PDF generation engine and QR Code creator.

### Phase 4: Frontend Development
*   [ ] Initialize React + Vite project with Tailwind CSS.
*   [ ] Implement Routing, Redux/Context state management, and Axios interceptors.
*   [ ] Build Guest search views, Seat maps, Checkout flow, and Profiles.
*   [ ] Build Conductor QR scan panel (mobile-responsive) and Admin Dashboard charts.

### Phase 5: Testing, Security & Optimization
*   [ ] Write Spring Boot integration tests (JUnit 5 + Testcontainers).
*   [ ] Conduct static code analysis and security scans (SonarQube/OWASP Dependency Check).
*   [ ] Optimize database indexes and API query payloads.
*   [ ] Deploy staging environment.

---

## 🔮 Future Enhancements
1.  **GPS Live Bus Tracking**: Integrate IoT GPS tracking to allow passengers to view live bus coordinates on a map.
2.  **Dynamic Pricing**: Algorithm-based pricing adjustments based on passenger demand, seat occupancy, and time remaining.
3.  **Loyalty Program**: Reward passenger travel history with points redeemable for discounts.

---

## 👥 Contributors
*   **Project Lead & Architect**: Antigravity AI
*   **Engineering Team**: SmartGo Dev Team

---

## 📄 License
This project is licensed under the MIT License - see the [LICENSE](file:///d:/smartgo/LICENSE) file for details.
