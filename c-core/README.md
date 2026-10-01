# Hospital Bed Monitoring System — C Core Module

> **Academic Core Logic Component**  
> *"C is used for implementing the core programming logic of the Hospital Bed Monitoring System, including data validation, filtering, bed-status processing and report generation."*

---

## 1. Overview & Academic Purpose

The **Hospital Bed Monitoring System** is designed with a multi-tier architecture:
- **Tier 1 (Presentation):** React + TypeScript Web Dashboard (optimized for receptionists & nurses).
- **Tier 2 (Cloud Persistence):** Google Sheets database managed via Google Apps Script Web App API.
- **Tier 3 (Core Business Engine):** **C Programming Module (`c-core`)**, an independent, terminal-based engine demonstrating low-level data structures, algorithmic validation, file handling, and clinical status processing.

This module is an **independently executable academic component** suitable for S3/S4 university project evaluation, showcasing fundamental computer science concepts in ANSI C99.

---

## 2. File Structure

```text
c-core/
├── data.h            # Data structures, constants, and capacity limits
├── validation.h      # Validation function prototypes & business rules
├── validation.c      # Clinical validation algorithms & error reporting
├── bed.h             # Bed lifecycle transitions, operations, and prototypes
├── bed.c             # State machine, table formatting, and CSV persistence
├── filter.h          # Search and filtering function declarations
├── filter.c          # Search by Bed ID, Patient, Ward, Floor, and Status
├── report.h          # Analytics, aggregations, and export prototypes
├── report.c          # Occupancy rate calculation and text file reporting
├── main.c            # Interactive terminal menu (Options 1–10)
├── beds_data.csv     # Sample hospital database (25+ beds across 5 wards)
├── bed_report.txt    # Generated bed availability summary report
├── Makefile          # Cross-platform GNU Makefile
├── compile.bat       # Windows build script with auto-compiler detection
└── README.md         # Comprehensive module documentation
```

---

## 3. Data Structure

The core data entity is defined in [`data.h`](file:///c:/Users/ASHIK/Desktop/IEDC/c-core/data.h):

```c
typedef struct {
    char bed_id[20];       // Unique identifier, e.g. "ICU-001"
    char ward[50];         // Department name, e.g. "ICU", "Emergency"
    int floor;             // Floor number (1 to 20)
    char room[20];         // Room or bay identifier, e.g. "101", "Bay 1"
    char bed_type[30];     // Bed specification, e.g. "ICU Ventilator"
    char status[20];       // Available, Occupied, Cleaning, Reserved, Maintenance
    char patient_id[30];   // Patient ID or "-" if vacant
    int active;            // 1 for operational bed, 0 for decommissioned
} Bed;
```

### Bed Status Constants
- `STATUS_AVAILABLE` ("Available"): Clean, sanitized, ready for patient admission.
- `STATUS_OCCUPIED` ("Occupied"): Assigned to an admitted inpatient.
- `STATUS_CLEANING` ("Cleaning"): Patient discharged; undergoing medical sanitization.
- `STATUS_RESERVED` ("Reserved"): Held for incoming emergency or scheduled admission.
- `STATUS_MAINTENANCE` ("Maintenance"): Physical or electrical repair required.

---

## 4. Clinical Validation Module (`validation.c`)

The validation module ensures strict hospital compliance before any record is created or modified:

| Validation Rule | Function | Description |
| :--- | :--- | :--- |
| **Bed ID Format** | `validateBedID()` | Rejects empty strings, length < 2 or ≥ 20, and invalid characters. |
| **Status Whitelist** | `validateStatus()` | Checks status against the 5 allowed clinical statuses. |
| **Duplicate Bed ID** | `isDuplicateBedID()` | Ensures unique bed identifiers across the hospital. |
| **Floor & Room** | `validateFloor()`, `validateRoom()` | Checks floor (1–20) and non-empty room identifiers. |
| **Single Bed Rule** | `isPatientAlreadyAssigned()` | Prevents assigning one patient to multiple beds concurrently. |
| **Lifecycle Transition** | `isValidTransition()` | Enforces logical hospital bed state transitions. |

### Error Reporting Example:
```text
ERROR: Invalid bed ID characters (only letters, numbers, '-' and '_' allowed): ICU@#1
ERROR: Invalid bed status 'Vacant'. Allowed: Available, Occupied, Cleaning, Reserved, Maintenance
ERROR: Bed already exists: ICU-001
ERROR: Patient already assigned: Patient P1001 is already in bed ICU-002
```

---

## 5. Bed Status Lifecycle Processing (`bed.c`)

Hospital hygiene and clinical protocol dictate strict transition sequences:

```text
  +-------------------------------------------------------+
  |                                                       |
  v                                                       |
[Available] ---------> [Occupied] ---------> [Cleaning] --+
     |                       |
     v                       v
 [Reserved]            [Maintenance]
```

1. **Admission:** `Available → Occupied` or `Reserved → Occupied` (requires patient ID).
2. **Discharge:** `Occupied → Cleaning` (moves bed immediately to sanitization; clears patient assignment).
3. **Disinfection Complete:** `Cleaning → Available` (returns bed to intake pool).
4. **Hold / Pre-booking:** `Available → Reserved`.
5. **Engineering Repair:** `Available/Cleaning → Maintenance`.

Whenever a transition occurs, the system logs the old and new status:
```text
Bed ICU-001:
Available -> Occupied
```

---

## 6. Search and Filtering Module (`filter.c`)

Provides linear search algorithms with case-insensitive comparisons:
- **`filterByWard(beds, count, ward)`**: Displays all beds in a ward in concise format (`<bed_id> <status>`) followed by a tabular breakdown.
- **`filterByFloor(beds, count, floor)`**: Filters active beds by hospital building floor.
- **`filterByStatus(beds, count, status)`**: Instantly displays all `Available`, `Occupied`, or `Cleaning` beds.
- **`searchBed(beds, count, bed_id)`**: Direct primary key lookup returning complete bed metadata.
- **`searchPatient(beds, count, patient_id)`**: Inpatient locator displaying assigned ward, room, and bed.

### Sample Filtering Output:
```text
Search:
Ward = ICU

Output:
ICU-001    Available
ICU-002    Occupied
ICU-003    Cleaning
ICU-004    Reserved
ICU-005    Maintenance
ICU-006    Available
```

---

## 7. Report Generation & File Export (`report.c`)

The reporting engine calculates aggregate metrics across the hospital and exports to [`bed_report.txt`](file:///c:/Users/ASHIK/Desktop/IEDC/c-core/bed_report.txt):

1. **Overall Hospital Bed Metrics:** Total beds, available, occupied, cleaning, reserved, maintenance, and occupancy rate percentage.
2. **Ward Summary:** Breakdown for each clinical unit (ICU, General Ward, Emergency, Pediatric, Private Ward).
3. **Floor Summary:** Floor-by-floor utilization table.

### Sample Report Format:
```text
====================================================
                HOSPITAL BED REPORT                 
====================================================
Total Beds      : 25
Available       : 10
Occupied        : 8
Cleaning        : 4
Reserved        : 2
Maintenance     : 1

Occupancy Rate  : 32.0%
----------------------------------------------------

WARD SUMMARY
----------------------------------------------------
ICU
Total           : 6
Available       : 2
Occupied        : 1
Cleaning        : 1
Reserved        : 1
Maintenance     : 1
Occupancy       : 16.7%

General Ward
Total           : 6
Available       : 2
Occupied        : 3
Cleaning        : 1
Occupancy       : 50.0%
...
```

---

## 8. File Handling (`fopen`, `fgets`, `fprintf`, `fclose`)

The module uses clean standard C stream I/O:
- **`loadBeds(beds, &count, "beds_data.csv")`**: Reads comma-separated records using `fopen()`, `fgets()`, and `strtok()`.
- **`saveBeds(beds, count, "beds_data.csv")`**: Writes updated bed records using `fopen()`, `fprintf()`, and `fclose()`.
- **`exportReportToFile(beds, count, "bed_report.txt")`**: Writes the complete formatted report to persistent storage.

---

## 9. Interactive Terminal Menu (`main.c`)

```text
=====================================
 HOSPITAL BED MONITORING SYSTEM
=====================================
1. Add Bed
2. View All Beds
3. Search Bed
4. Filter by Ward
5. Filter by Floor
6. Filter by Status
7. Update Bed Status
8. Generate Report
9. Save Data
10. Exit
=====================================
Enter choice: 
```

---

## 10. How to Compile and Run

### Option A: Standard GCC (Linux / macOS / MinGW / WSL)
```bash
gcc -Wall -Wextra -std=c99 main.c bed.c validation.c filter.c report.c -o hospital_bed
./hospital_bed
```

### Option B: Using Make
```bash
make
./hospital_bed
```

### Option C: Windows Batch Script
```cmd
compile.bat
hospital_bed.exe
```

### Option D: Microsoft Visual C++ (MSVC Developer Command Prompt)
```cmd
cl main.c bed.c validation.c filter.c report.c /Fe:hospital_bed.exe
hospital_bed.exe
```

### Option E: Online C Compiler (OnlineGDB / Replit)
1. Go to [https://www.onlinegdb.com/online_c_compiler](https://www.onlinegdb.com/online_c_compiler)
2. Create tabs for `main.c`, `bed.c`, `bed.h`, `validation.c`, `validation.h`, `filter.c`, `filter.h`, `report.c`, `report.h`, `data.h`, and `beds_data.csv`.
3. Click **Run**.

---

## 11. Cross-Tier Architecture Alignment

The C module mirrors the operational logic executed across the cloud tiers:

| Operation | React Frontend | Google Apps Script Backend | C Core Module |
| :--- | :--- | :--- | :--- |
| **Validation** | Client form validation & UI warnings | Server-side `doPost` checks in `Beds.gs` | `validateBed()`, `isValidTransition()` |
| **Admission** | Click "Admit Patient" in modal | POST `/patient/assign` updates status & log | `occupyBed(bed, patient_id)` |
| **Discharge** | Click "Discharge" button | POST `/patient/discharge` -> `Cleaning` | `releaseBed(bed)` -> `Cleaning` |
| **Sanitize** | Click "Mark Clean" | POST `/bed/update` -> `Available` | `markCleaning(bed)` -> `Available` |
| **Analytics** | Real-time occupancy donut & stat cards | GET `/dashboard` aggregate counts | `generateReport()`, `bed_report.txt` |
| **Persistence**| Local state & fetch calls | Google Sheets (`Beds`, `ActivityLog`) | `beds_data.csv` via `fopen/fprintf` |
