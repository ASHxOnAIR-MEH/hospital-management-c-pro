# 🏥 Hospital Bed Monitoring System

An integrated, enterprise-grade healthcare management solution designed with a **4-tier architecture**:
1. **Frontend:** React 19 + TypeScript touch dashboard for nurses and receptionists.
2. **Cloud Database:** Google Sheets relational structure (6 tables).
3. **Backend API:** Google Apps Script Web App REST API.
4. **Core Business Logic:** ANSI C99 low-level clinical validation and state machine engine (`/c-core/`).

---

## 🏛️ System Architecture

```text
React Frontend (UI / Touch Dashboard)
      │
      │ HTTPS (JSON over GET/POST)
      ▼
Google Apps Script (Web App REST API)
      │
      │ SpreadsheetApp Service API
      ▼
Google Sheets Database (Beds, Wards, Patients, Users, ActivityLog, Settings)

-------------------------------------------------------------------------
C Programming Core Logic Engine (/c-core/):
├── Data Validation:     validateBed(), validateStatus(), isDuplicateBedID()
├── Filtering & Search:  filterByWard(), filterByFloor(), searchBed()
├── Status State Logic:  Available -> Occupied -> Cleaning -> Available
└── Report Generation:   Ward summaries, occupancy rate, bed_report.txt export
-------------------------------------------------------------------------
```

> **Academic Requirement:**  
> *"C is used for implementing the core programming logic of the Hospital Bed Monitoring System, including data validation, filtering, bed-status processing and report generation."*

---

## 📁 Repository Directory Structure

```text
IEDC/
├── src/                               # Tier 1: React 19 + TypeScript Frontend
│   ├── components/                    # BedCard, BedGrid, Modals, Topbar, Sidebar
│   ├── config/api.ts                  # Centralized API configuration (Web App URL)
│   ├── context/HospitalContext.tsx    # State management, optimistic updates, live sync
│   ├── services/apiService.ts         # Decoupled REST API communication layer
│   └── views/                         # Dashboard, Beds, Wards, Patients, Reports, Activity
├── google-apps-script/                # Tier 2: Server Backend API
│   ├── Code.gs                        # Request router (doGet & doPost)
│   ├── Beds.gs                        # Bed management & state transitions
│   ├── Patients.gs                    # Admission and discharge operations
│   ├── ActivityLog.gs                 # Immutable audit trail logger
│   └── Reports.gs                     # Occupancy analytics calculations
├── sheets-database/                   # Tier 3: Database & Templates
│   ├── Hospital_Bed_Database_Template.xlsx # Multi-tab Excel database template
│   ├── csv/                           # Beds.csv, Wards.csv, Patients.csv, ActivityLog.csv
│   └── DATABASE_GUIDE.md              # Administrator setup manual
├── c-core/                            # Tier 4: Academic C Programming Engine
│   ├── main.c                         # 10-option interactive terminal menu
│   ├── bed.c / bed.h                  # Bed lifecycle state machine & CSV I/O
│   ├── validation.c / validation.h    # Clinical integrity validation
│   ├── filter.c / filter.h            # Linear search & ward/floor filtering
│   ├── report.c / report.h            # Analytics & bed_report.txt file export
│   ├── test_suite.c                   # Automated C unit test runner
│   ├── beds_data.csv                  # 25 sample hospital beds
│   ├── bed_report.txt                 # Exported utilization summary
│   ├── Makefile                       # Cross-platform GNU build file
│   └── README.md                      # Detailed C core documentation
├── server/                            # Local Development & Testing Middleware
│   ├── localApiMiddleware.js          # In-memory / CSV database engine for Vite
│   └── integrationTest.js             # 20-point automated end-to-end test suite
├── PROJECT_ARCHITECTURE.md            # In-depth system architecture documentation
├── TEST_CASES.md                      # Complete QA matrix & acceptance tests
├── API_DOCUMENTATION.md               # Endpoints, payloads, and CORS guide
└── APPS_SCRIPT_DEPLOYMENT_GUIDE.md    # Step-by-step Google Cloud deployment guide
```

---

## 🚀 Quick Start Guide

### 1. Run the Web Application
```bash
# Install dependencies
npm install

# Launch Vite dev server with integrated API middleware
npm run dev
```
Open [http://localhost:5173/](http://localhost:5173/) to interact with the live dashboard.

---

### 2. Run Automated Integration Tests (All 20 Checks)
```bash
node server/integrationTest.js
```
*Executes all 20 clinical workflows: Dashboard loading, bed counts, ward/floor filters, lifecycle transitions (`Available → Occupied → Cleaning → Available`), duplicate patient rejection, and network resilience.*

---

### 3. Compile & Run the C Core Module

#### On Linux / macOS / WSL:
```bash
cd c-core
gcc -Wall -Wextra -std=c99 main.c bed.c validation.c filter.c report.c -o hospital_bed
./hospital_bed
```

#### On Windows:
```cmd
cd c-core
compile.bat run
```

#### Run Automated C Unit Tests:
```bash
cd c-core
gcc test_suite.c bed.c validation.c filter.c report.c -o test_suite
./test_suite
```

---

## 🔄 Verified Acceptance Scenario

The core clinical bed lifecycle was tested across all four tiers:

| Step | State Transition | Frontend | Google Sheets (`Beds.csv`) | ActivityLog | C Core Engine |
| :---: | :---: | :---: | :---: | :---: | :---: |
| **Initial** | `Available` | Card is Emerald | Status = `Available` | Baseline log | Status = `Available` |
| **Admit** | `Available → Occupied` | Card turns Red (`P1001`) | Status = `Occupied`, Pat = `P1001` | `PATIENT_ASSIGN` logged | `occupyBed()` valid |
| **Discharge**| `Occupied → Cleaning` | Card turns Amber | Status = `Cleaning`, Pat = `-` | `PATIENT_DISCHARGE` logged | `releaseBed()` valid |
| **Sanitize** | `Cleaning → Available` | Card returns to Emerald | Status = `Available` | `STATUS_CHANGE` logged | `markCleaning()` valid |

---

## 🔒 Security & Data Integrity
- **No Client Credentials:** No Google Service Account keys or OAuth tokens exist in the React code.
- **Atomic Operations:** Every state change updates both the bed registry and the audit log simultaneously.
- **Single Bed Policy:** Patients cannot be assigned to multiple beds simultaneously across any layer.
