# Hospital Bed Monitoring System — C Core Module Documentation

> **Academic Requirement Statement:**  
> *"C is used for implementing the core programming logic of the Hospital Bed Monitoring System, including data validation, filtering, bed-status processing and report generation."*

---

## 1. Academic Rationale & Context

In modern distributed software, high-level frameworks (React, Google Apps Script) excel at presentation and cloud connectivity, while systems languages like **C (ANSI C99)** represent the computational core where data integrity, low-level memory layout, algorithmic complexity, and deterministic state transitions are strictly controlled.

This C component is an **independently executable, standalone academic module** developed for university evaluation. It implements all core business logic without external dependencies.

---

## 2. Low-Level Data Design ([`data.h`](file:///c:/Users/ASHIK/Desktop/IEDC/c-core/data.h))

```c
#define MAX_BEDS 150
#define MAX_LINE_LEN 256

// Status Constants
#define STATUS_AVAILABLE   "Available"
#define STATUS_OCCUPIED    "Occupied"
#define STATUS_CLEANING    "Cleaning"
#define STATUS_RESERVED    "Reserved"
#define STATUS_MAINTENANCE "Maintenance"

typedef struct {
    char bed_id[20];       // Unique primary key, e.g. "ICU-001"
    char ward[50];         // Department name, e.g. "ICU", "Emergency"
    int floor;             // Floor number (1 to 20)
    char room[20];         // Room or bay number, e.g. "101", "Bay 1"
    char bed_type[30];     // Bed specification, e.g. "ICU Ventilator"
    char status[20];       // Current clinical status
    char patient_id[30];   // Patient ID or "-" if vacant
    int active;            // 1 = operational, 0 = decommissioned
} Bed;
```

---

## 3. Key Algorithmic Modules

### 3.1. Clinical Validation Module ([`validation.c`](file:///c:/Users/ASHIK/Desktop/IEDC/c-core/validation.c))
- **`validateBedID(const char *bed_id)`**: Ensures non-empty string, length between 2 and 19 characters, and valid characters (alphanumeric, hyphens, underscores).
- **`validateStatus(const char *status)`**: Checks against the 5 allowed clinical statuses.
- **`isDuplicateBedID(const Bed beds[], int count, const char *bed_id)`**: Performs an $O(N)$ linear uniqueness scan. Emits `ERROR: Bed already exists`.
- **`isPatientAlreadyAssigned(const Bed beds[], int count, const char *patient_id, ...)`**: Enforces the clinical rule that an inpatient cannot occupy multiple beds simultaneously. Emits `ERROR: Patient already assigned`.
- **`isValidTransition(const char *current_status, const char *new_status)`**: Enforces the hospital sanitation lifecycle graph.

### 3.2. Status Lifecycle State Machine ([`bed.c`](file:///c:/Users/ASHIK/Desktop/IEDC/c-core/bed.c))
Transitions enforce hospital protocol:
$$\text{Available} \xrightarrow{\text{occupyBed}} \text{Occupied} \xrightarrow{\text{releaseBed}} \text{Cleaning} \xrightarrow{\text{markCleaning}} \text{Available}$$

State change logging:
```text
Bed ICU-001:
Available -> Occupied
```

### 3.3. Search and Filtering ([`filter.c`](file:///c:/Users/ASHIK/Desktop/IEDC/c-core/filter.c))
- **`filterByWard()`**: Filters beds by ward with case-insensitive substring search.
- **`filterByFloor()`**: Filters beds by building floor.
- **`filterByStatus()`**: Filters beds matching a status.
- **`searchBed()`**: Returns array index of the matching bed or `-1`.
- **`searchPatient()`**: Locates an inpatient's bed across all active wards.

### 3.4. Analytics & Report Exporter ([`report.c`](file:///c:/Users/ASHIK/Desktop/IEDC/c-core/report.c))
Calculates aggregations in a single pass:
- Total operational vs decommissioned beds.
- Global and departmental occupancy rates:
  $$\text{Occupancy Rate} = \left(\frac{\text{Occupied Beds}}{\text{Total Active Beds}}\right) \times 100\%$$
- Stream output to both standard output and persistent text file [`bed_report.txt`](file:///c:/Users/ASHIK/Desktop/IEDC/c-core/bed_report.txt).

### 3.5. File Persistence Engine ([`bed.c`](file:///c:/Users/ASHIK/Desktop/IEDC/c-core/bed.c))
Demonstrates standard C stream I/O:
- `fopen(filename, "r")` & `fgets(line, sizeof(line), fp)`: Line-by-line CSV parser with `strtok()`.
- `fopen(filename, "w")` & `fprintf(fp, ...)`: Formatted CSV file writer with automatic headers.
- `fclose(fp)`: Resource deallocation.

---

## 4. Interactive Terminal Menu ([`main.c`](file:///c:/Users/ASHIK/Desktop/IEDC/c-core/main.c))

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

## 5. Compilation & Evaluation Instructions

### Compilation with GCC:
```bash
cd c-core
gcc -Wall -Wextra -std=c99 main.c bed.c validation.c filter.c report.c -o hospital_bed
./hospital_bed
```

### Automated Unit Test Suite:
```bash
cd c-core
gcc test_suite.c bed.c validation.c filter.c report.c -o test_suite
./test_suite
```

### Windows Batch Script:
```cmd
cd c-core
compile.bat run
```
