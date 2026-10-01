# Hospital Bed Monitoring System — User Manual

A non-technical operational manual for hospital receptionists, triage nurses, ward managers, and hospital administrators.

---

## 1. System Overview & User Roles

The Hospital Bed Monitoring System provides real-time visibility into bed occupancy across all hospital floors. It is designed to be touch-friendly, fast, and simple to use on tablets, smartphones, and desktop workstations.

### User Roles:
- **Reception Desk:** Searches bed availability, directs admissions, views daily counts.
- **Triage Nurse:** Assigns awaiting emergency patients to sanitized beds.
- **Ward Nurse:** Marks discharges, monitors room statuses, triggers cleaning.
- **Sanitation Staff:** Marks sanitized beds ready for incoming admissions.
- **Biomedical Engineering:** Flags damaged beds for electrical/mechanical maintenance.

---

## 2. Color Coding Guide

Every bed in the hospital is displayed with a high-contrast clinical status badge:

| Status | Color | Meaning | Allowed Actions |
| :--- | :--- | :--- | :--- |
| **Available** | 🟢 Emerald Green | Bed is sanitized, inspected, and ready for patient intake. | Admit Patient, Reserve Bed, Flag Maintenance |
| **Occupied** | 🔴 Crimson Red | Inpatient currently admitted and resting in this bed. | View Patient, Discharge Patient, Transfer |
| **Cleaning** | 🟡 Amber Yellow | Patient discharged; undergoing medical sanitization. | Mark Cleaned / Ready, Flag Maintenance |
| **Reserved** | 🔵 Royal Blue | Held for incoming emergency transfer or booked surgery. | Confirm Admission, Cancel Reservation |
| **Maintenance**| ⚫ Slate Grey | Out of order; under biomedical or mechanical repair. | Return to Sanitization / Available |

---

## 3. Daily Clinical Workflows

### Workflow 1: Admitting a Patient to an Available Bed
1. On the **Dashboard**, locate an available bed (Emerald Green card) in the desired ward.
2. Tap the bed card to open the **Bed Details Modal**.
3. Tap **Admit Patient**.
4. Enter the **Patient ID** (e.g. `P1001`) and admission notes.
5. Tap **Confirm Admission**.
   - *Result:* The bed card turns Red (`OCCUPIED`), displays the patient ID, updates the total available bed count, and logs the action in the Activity Log.

---

### Workflow 2: Discharging an Inpatient
1. Tap the occupied bed card on the Dashboard or go to the **Patients** tab.
2. Tap the red **Discharge Patient** button.
3. A confirmation dialog appears: *"Are you sure you want to discharge Patient P1001?"*
4. Tap **Confirm Discharge**.
   - *Result:* The bed immediately transitions to **Cleaning** (Amber badge), the patient is unlinked, and the bed enters the sanitation queue.

---

### Workflow 3: Marking a Bed Cleaned & Ready
1. Once sanitation staff finishes UV disinfection and fresh linen change, locate the amber **Cleaning** bed.
2. Tap the bed card and click **Mark Sanitized & Ready**.
   - *Result:* The bed returns to **Available** (Green badge) and becomes available for emergency or scheduled intake.

---

### Workflow 4: Searching & Filtering
- **Live Search Bar (Topbar):** Type any Bed ID (`ICU-001`), Room number (`101`), or Patient ID (`P1001`) to immediately highlight matching beds.
- **Ward Filter:** Filter by department: *ICU, General Ward, Emergency, Pediatric, Private Ward*.
- **Floor Filter:** Filter by building level: *Floor 1, Floor 2, Floor 3, Floor 4*.
- **Status Filter:** Select *Available* to view only open beds across the hospital.

---

## 4. Reports & Printing

1. Click **Reports** in the navigation sidebar.
2. Review aggregated metrics:
   - Hospital-wide occupancy rate percentage.
   - Breakdown of beds by department and floor.
3. Click **Print Summary** to generate a clean, printer-formatted shift handover report.
4. Click **Download CSV** to export tabular availability data for hospital reporting.

---

## 5. Audit Trail & Activity Log

Every action performed in the system is logged in the **Activity Log** view:
- **Timestamp:** Exact date and time of the modification.
- **Staff Member:** Staff name and professional role.
- **Bed ID:** Target bed identifier.
- **Transition:** Prior status $\rightarrow$ New status (e.g., `Available → Occupied`).
- **Notes:** Clinical reason or procedure notes.
