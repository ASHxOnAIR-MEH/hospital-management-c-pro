# Hospital Bed Monitoring System — Test Cases & Quality Assurance

Comprehensive verification matrix documenting all 20 integrated end-to-end tests, C unit tests, and acceptance test scenarios.

---

## 1. Automated Integration Test Suite Matrix

Executed via `node server/integrationTest.js` against the running live API and database:

| # | Test Case Description | Test Procedure | Expected Outcome | Result |
| :---: | :--- | :--- | :--- | :---: |
| **1** | **Load Dashboard** | Send `GET /dashboard` request | HTTP 200 returned with system metrics & ward summaries | **PASSED** |
| **2** | **Fetch Beds** | Send `GET /beds` request | HTTP 200 with an array of active hospital beds | **PASSED** |
| **3** | **Bed Count Accuracy** | Compare `dashboard.metrics.occupied` against bed list sum | Counts match perfectly | **PASSED** |
| **4** | **Search Bed** | Query bed record by primary key `ICU-001` | Record located with complete metadata | **PASSED** |
| **5** | **Filter by Ward** | Filter dataset where `ward_name == 'ICU'` | Only ICU department beds returned | **PASSED** |
| **6** | **Filter by Floor** | Filter dataset where `floor == 1` | Only Floor 1 beds returned | **PASSED** |
| **7** | **Filter by Status** | Filter dataset where `status == 'Available'` | Only available/ready beds returned | **PASSED** |
| **8** | **Open Bed Details** | Inspect detailed bed telemetry fields | Room, bed type, status, and history populated | **PASSED** |
| **9** | **Available → Occupied** | Assign patient `P9001` to `ICU-001` via `POST /patient/assign` | State changes to `Occupied`, patient ID assigned | **PASSED** |
| **10**| **Assign Patient** | Check bed model for `patient_id: P9001` | Patient assigned to target bed | **PASSED** |
| **11**| **Confirm Sheet Update** | Read `sheets-database/csv/Beds.csv` row for `ICU-001` | Status = `Occupied`, patient = `P9001` | **PASSED** |
| **12**| **Confirm ActivityLog** | Inspect `sheets-database/csv/ActivityLog.csv` | Chronological row added with timestamp & staff ID | **PASSED** |
| **13**| **Occupied → Cleaning** | Discharge patient via `POST /patient/discharge` | Bed moves to `Cleaning`, patient unassigned | **PASSED** |
| **14**| **Cleaning → Available** | Send `POST /bed/update` with status `Available` | Bed returns to intake pool | **PASSED** |
| **15**| **Generate Report** | Fetch `/dashboard` ward summaries & occupancy rate | Valid occupancy % and departmental breakdown | **PASSED** |
| **16**| **Invalid Bed ID** | Send `POST /bed/update` for `INVALID-999` | HTTP 404 with error "Bed does not exist" | **PASSED** |
| **17**| **Duplicate Patient** | Attempt to assign patient already in `GEN-201` to `ER-102` | HTTP 400 "Duplicate patient assignment" | **PASSED** |
| **18**| **Invalid Status** | Send `POST /bed/update` with `status: "VacantUnknown"` | HTTP 400 "Invalid status" | **PASSED** |
| **19**| **Inactive Bed** | Deactivate `PVT-404`, then attempt status update | HTTP 400 "Bed is inactive and cannot be updated"| **PASSED** |
| **20**| **Network / API Offline**| Disconnect or target unreachable port | Frontend catches error, displays friendly alert | **PASSED** |

---

## 2. C Core Logic Test Matrix (`c-core/test_suite.c`)

The C module tests algorithmic integrity, state machines, and file I/O:

| Test Routine | Target Function | Test Assertion | Status |
| :--- | :--- | :--- | :---: |
| `test_validate_bed_id` | `validateBedID()` | Rejects empty strings, short IDs, and special characters | **PASSED** |
| `test_validate_status` | `validateStatus()` | Accepts only 5 allowed clinical statuses | **PASSED** |
| `test_duplicate_bed_id`| `isDuplicateBedID()` | Detects collision with existing bed array | **PASSED** |
| `test_duplicate_patient`| `isPatientAlreadyAssigned()` | Prevents multi-bed assignment for one patient | **PASSED** |
| `test_status_transitions`| `isValidTransition()` | Enforces hygiene transitions; blocks `Occupied -> Available` | **PASSED** |
| `test_bed_lifecycle` | `occupyBed()`, `releaseBed()`, `markCleaning()` | Full transition cycle: `Available → Occupied → Cleaning → Available` | **PASSED** |
| `test_bed_search` | `searchBed()` | Primary key search with index retrieval | **PASSED** |
| `test_report_export` | `exportReportToFile()` | Formats stream and writes `test_bed_report.txt` | **PASSED** |

---

## 3. Final Acceptance Scenario Walkthrough

### Scenario Objective
Demonstrate complete bed lifecycle on bed **`ICU-001`**:
`Available` $\rightarrow$ `Occupied` (Patient P1001) $\rightarrow$ `Cleaning` $\rightarrow$ `Available`.

### Phase 1: Initial State
- **Bed:** `ICU-001`
- **Initial Status:** `Available`
- **Patient ID:** `-` (Vacant)
- **Frontend Metric:** Available beds count increments.
- **Database (`Beds.csv`):** `ICU-001,W001,ICU,1,101,ICU Ventilator,Available,-,...`

### Phase 2: Action 1 — Admit Patient P1001
- **Trigger:** Receptionist/Nurse assigns patient `P1001`.
- **API Call:** `POST /patient/assign` $\rightarrow$ `{ patient_id: "P1001", bed_id: "ICU-001", updated_by: "Nurse Sarah" }`
- **Verification:**
  - [x] **Frontend:** `ICU-001` card turns Red (`OCCUPIED`), displays `Patient P1001`.
  - [x] **Google Sheet:** Status changed to `Occupied`, patient cell set to `P1001`.
  - [x] **ActivityLog:** Appended: `2026-10-01 10:30, U002, Nurse Sarah, PATIENT_ASSIGN, ICU-001, Available, Occupied, "Assigned patient P1001"`
  - [x] **C Core Logic:** `occupyBed(&b, "P1001")` returns success; logs `Bed ICU-001: Available -> Occupied`.

### Phase 3: Action 2 — Discharge Patient
- **Trigger:** Attending physician clicks "Discharge Patient".
- **API Call:** `POST /patient/discharge` $\rightarrow$ `{ bed_id: "ICU-001", target_bed_status: "Cleaning" }`
- **Verification:**
  - [x] **Frontend:** `ICU-001` card turns Amber (`CLEANING`), patient unlinked.
  - [x] **Google Sheet:** Status set to `Cleaning`, patient set to `-`.
  - [x] **ActivityLog:** Appended: `PATIENT_DISCHARGE, ICU-001, Occupied, Cleaning`.
  - [x] **C Core Logic:** `releaseBed(&b)` returns success; logs `Bed ICU-001: Occupied -> Cleaning`.

### Phase 4: Action 3 — Mark Sanitized & Available
- **Trigger:** Cleaning staff completes UV sterilization, clicks "Mark Clean".
- **API Call:** `POST /bed/update` $\rightarrow$ `{ bed_id: "ICU-001", status: "Available" }`
- **Verification:**
  - [x] **Frontend:** `ICU-001` card returns to Emerald (`AVAILABLE`).
  - [x] **Google Sheet:** Status set to `Available`.
  - [x] **ActivityLog:** Appended: `STATUS_CHANGE, ICU-001, Cleaning, Available`.
  - [x] **C Core Logic:** `markCleaning(&b)` returns success; logs `Bed ICU-001: Cleaning -> Available`.
  - [x] **Report Generation:** `bed_report.txt` and dashboard reflect updated available count.

---

## 4. How to Run the Verification Tests

### Run Automated End-to-End Tests:
```bash
node server/integrationTest.js
```

### Run C Core Module Test Suite:
```bash
cd c-core
gcc -Wall -Wextra -std=c99 test_suite.c bed.c validation.c filter.c report.c -o test_suite
./test_suite
```
*(On Windows with MinGW: `gcc test_suite.c bed.c validation.c filter.c report.c -o test_suite.exe && test_suite.exe`)*
