# Hospital Bed Monitoring System — Project Architecture

A comprehensive documentation of the **4-Tier Architecture** powering the Hospital Bed Monitoring System.

---

## 1. High-Level Architecture Diagram

```text
+-----------------------------------------------------------------------------------+
|                           TIER 1: FRONTEND PRESENTATION                           |
|                       React 19 + TypeScript + Modern CSS                          |
|         (Touch-Friendly Nurse/Receptionist Dashboard, Filter Bar, Real-time Grid)  |
+-----------------------------------------+-----------------------------------------+
                                          |
                                          | JSON over HTTPS (GET / POST)
                                          | CORS-Safe text/plain payload
                                          v
+-----------------------------------------------------------------------------------+
|                        TIER 2: BACKEND API & VALIDATION                           |
|                         Google Apps Script Web App API                            |
|             (Action Dispatcher, Data Validation, Audit Logger, JSON Engine)       |
+-----------------------------------------+-----------------------------------------+
                                          |
                                          | Google SpreadsheetApp Service API
                                          | Row Locking & Formula Recalculation
                                          v
+-----------------------------------------------------------------------------------+
|                         TIER 3: CLOUD DATABASE ENGINE                             |
|                        Google Sheets Relational Database                          |
|            (6 Tables: Beds, Wards, Patients, Users, ActivityLog, Settings)        |
+-----------------------------------------------------------------------------------+

                                          *
                                          * (Mirrored Logic & Academic Standard)
                                          *
+-----------------------------------------------------------------------------------+
|                         TIER 4: C PROGRAMMING CORE LOGIC                          |
|                    Independent ANSI C99 Clinical Logic Engine                     |
|                                                                                   |
|   1. Data Validation:     validateBed(), validateStatus(), isDuplicateBedID()    |
|   2. Status Lifecycle:    Available -> Occupied -> Cleaning -> Available          |
|   3. Search & Filter:     filterByWard(), filterByFloor(), searchBed()            |
|   4. Analytics & Report:  generateReport(), bed_report.txt, File I/O (fopen)     |
+-----------------------------------------------------------------------------------+
```

---

## 2. Component Breakdown

### Tier 1: React Frontend (Presentation Layer)
- **Role:** Interactive dashboard designed for hospital ward nurses and non-technical receptionists.
- **Key Modules:**
  - `src/views/DashboardView.tsx`: Overview KPI metric cards (Available, Occupied, Cleaning, Reserved, Maintenance) and live ward grid.
  - `src/components/BedModal.tsx`: Visual bed details card and one-tap status action triggers.
  - `src/components/ConfirmationModal.tsx`: Safety dialog preventing inadvertent status changes.
  - `src/context/HospitalContext.tsx`: Central state hub managing real-time synchronization, toasts, and optimistic rendering.
  - `src/services/apiService.ts`: Decoupled API service connecting the UI to Google Apps Script.

### Tier 2: Google Apps Script Backend (API Layer)
- **Role:** Server-side gateway between the web browser and Google Sheets.
- **Key Files ([`google-apps-script/`](file:///c:/Users/ASHIK/Desktop/IEDC/google-apps-script/)):**
  - `Code.gs`: Request router for HTTP `GET` (`doGet`) and `POST` (`doPost`).
  - `Config.gs`: Configuration, sheet naming constants, allowed status definitions.
  - `Beds.gs`: Bed CRUD, status updates, and integrity checks.
  - `Patients.gs`: Inpatient admission and discharge management.
  - `Wards.gs`: Ward listing and dynamic bed count queries.
  - `ActivityLog.gs`: Automatic audit logging for every database modification.
  - `Reports.gs`: Aggregate occupancy and department summary calculator.

### Tier 3: Google Sheets Database (Persistence Layer)
- **Role:** Zero-maintenance, collaborative tabular database manageable by non-technical administrators.
- **Sheet Entities ([`sheets-database/`](file:///c:/Users/ASHIK/Desktop/IEDC/sheets-database/)):**
  1. `Beds`: Primary bed inventory (ID, ward, floor, room, status, patient assignment, active).
  2. `Wards`: Department master data (ID, name, floor, total beds).
  3. `Patients`: Patient roster (ID, bed assignment, admission & discharge dates).
  4. `Users`: System staff and access roles (Admin, Nurse, Receptionist, Doctor).
  5. `ActivityLog`: Immutable chronological audit trail.
  6. `Settings`: System-wide parameters and validation rules.

### Tier 4: C Programming Core Module (Academic Engine)
- **Role:** **Required academic component** implementing low-level algorithms, pointer-based structures, file streaming, and strict state transitions.
- **Key Files ([`c-core/`](file:///c:/Users/ASHIK/Desktop/IEDC/c-core/)):**
  - `data.h`: Defines the `Bed` struct and clinical status constants.
  - `validation.c` / `validation.h`: Enforces structural rules (unique bed IDs, single patient assignment, allowed statuses).
  - `bed.c` / `bed.h`: State machine controlling bed hygiene (`Available → Occupied → Cleaning → Available`).
  - `filter.c` / `filter.h`: Linear search and case-insensitive filtering by ward, floor, status, bed, and patient.
  - `report.c` / `report.h`: File I/O stream exporter generating `bed_report.txt`.
  - `main.c`: Interactive terminal menu (Options 1–10).

---

## 3. Data Consistency & State Synchronization

To ensure zero conflicting data across hospital desks:
1. **Atomic Updates:** Every bed status update (`/bed/update`) modifies both the `Beds` table and appends a corresponding record to `ActivityLog`.
2. **Discharge Hygiene:** When a patient is discharged, the backend automatically transitions the bed to `Cleaning` and clears the `patient_id` pointer.
3. **Single Inpatient Rule:** A patient cannot be admitted to multiple beds simultaneously. Both Google Apps Script and C Core logic enforce this constraint.
4. **Data Equality:**
   $$\text{Frontend Status} = \text{Google Sheets Status} = \text{ActivityLog Status} = \text{C Core State}$$

---

## 4. Security & Network Design

- **Zero Credential Exposure:** No Google Service Account private keys or Google Cloud client secrets are bundled into client-side JavaScript.
- **CORS Compatibility:** Asynchronous POST requests to Google Apps Script use `text/plain` serialization to bypass restrictive browser preflight (`OPTIONS`) blocks while safely transmitting JSON.
- **Server-Side Validation:** All requests are validated on the Apps Script layer before interacting with the spreadsheet.
