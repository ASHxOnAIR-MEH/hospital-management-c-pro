# 🏥 Google Sheets Database Guide: Hospital Bed Monitoring System

This document provides a comprehensive, non-technical operational manual for managing the **Hospital Bed Monitoring System** backend database in **Google Sheets**.

---

## 📑 Table of Contents

1. [Database Overview & Architecture](#1-database-overview--architecture)
2. [Quick Setup: How to Create the Spreadsheet](#2-quick-setup-how-to-create-the-spreadsheet)
   - [Option A: 1-Click Import using the Excel Template (Recommended)](#option-a-1-click-import-using-the-excel-template-recommended)
   - [Option B: Manual CSV Import](#option-b-manual-csv-import)
3. [Sheet-by-Sheet Specifications & Data Dictionary](#3-sheet-by-sheet-specifications--data-dictionary)
   - [Sheet 1: Beds](#sheet-1-beds)
   - [Sheet 2: Wards](#sheet-2-wards)
   - [Sheet 3: Patients](#sheet-3-patients)
   - [Sheet 4: Users](#sheet-4-users)
   - [Sheet 5: ActivityLog](#sheet-5-activitylog)
   - [Sheet 6: Settings](#sheet-6-settings)
4. [Google Sheet Usability & Visual Enhancements](#4-google-sheet-usability--visual-enhancements)
   - [How to Freeze Header Rows](#how-to-freeze-header-rows)
   - [How to Set Up Data Validation Dropdowns](#how-to-set-up-data-validation-dropdowns)
   - [How to Set Up Status Color Conditional Formatting](#how-to-set-up-status-color-conditional-formatting)
   - [Duplicate Prevention Formulas](#duplicate-prevention-formulas)
5. [Standard Operating Procedures (SOPs)](#5-standard-operating-procedures-sops)
   - [How to Add a New Hospital Bed](#how-to-add-a-new-hospital-bed)
   - [How to Add a New Ward](#how-to-add-a-new-ward)
   - [How to Add a New Staff Member](#how-to-add-a-new-staff-member)
   - [How to Update Sample Data](#how-to-update-sample-data)
6. [Protected Columns & Critical Database Rules](#6-protected-columns--critical-database-rules)

---

## 1. Database Overview & Architecture

The Google Sheet acts as the lightweight, real-time relational backend for the Hospital Bed Monitoring System. It consists of **6 dedicated sheets**:

| Sheet Name | Purpose | Primary Key | Key Relationships |
| :--- | :--- | :--- | :--- |
| **`Beds`** | Master inventory of all physical hospital beds and their live status | `bed_id` | Links to `ward_id` (Wards) and `patient_id` (Patients) |
| **`Wards`** | Department / Clinical Unit directory and total capacities | `ward_id` | Referenced by `Beds` |
| **`Patients`** | Current patient admissions, assigned beds, and discharge history | `patient_id` | Links to `bed_id` (Beds) |
| **`Users`** | Authorized hospital staff, nurses, receptionists, and admins | `user_id` | Referenced in `ActivityLog` & `updated_by` |
| **`ActivityLog`** | Immutable chronological audit trail of all bed status changes | `timestamp` + `bed_id` | Logs user actions and transitions |
| **`Settings`** | Global hospital configuration and system variables | `setting_key` | Read by system applications |

---

## 2. Quick Setup: How to Create the Spreadsheet

### Option A: 1-Click Import using the Excel Template (Recommended)

A pre-built workbook containing all 6 sheets with pre-formatted sample data is generated in:
`sheets-database/Hospital_Bed_Database_Template.xlsx`

1. Open your web browser and go to [Google Drive](https://drive.google.com/).
2. Click **New (+)** > **File upload**.
3. Select `Hospital_Bed_Database_Template.xlsx` from your computer.
4. Once uploaded, double-click the file to open it in Google Drive.
5. Click **File** > **Save as Google Sheets**.
6. Rename the spreadsheet to:
   `Hospital Bed Monitoring Database`

All 6 tabs (`Beds`, `Wards`, `Patients`, `Users`, `ActivityLog`, `Settings`) will immediately be available with all data pre-populated.

---

### Option B: Manual CSV Import

If you prefer importing the sheets individually:
1. Open [Google Sheets](https://sheets.google.com/) and create a **Blank Spreadsheet**.
2. Rename the spreadsheet to `Hospital Bed Monitoring Database`.
3. For each of the 6 CSV files in `sheets-database/csv/`:
   - Click **File** > **Import** > **Upload**.
   - Select the respective file (e.g., `Beds.csv`).
   - For Import location, select **Insert new sheet(s)**.
   - Click **Import data**.
   - Rename the sheet tab to match: `Beds`, `Wards`, `Patients`, `Users`, `ActivityLog`, `Settings`.
4. Delete the original empty `Sheet1` tab.

---

## 3. Sheet-by-Sheet Specifications & Data Dictionary

### Sheet 1: Beds

Stores every bed in the hospital, its physical location, current status, and assigned patient.

#### Column Definitions:

| Column Header | Data Type | Required? | Description & Allowed Values | Example |
| :--- | :--- | :--- | :--- | :--- |
| `bed_id` | Text | **Yes** | Unique identifier for the bed. Must never contain duplicates. | `ICU-001`, `GEN-201` |
| `ward_id` | Text | **Yes** | Foreign key linking to `ward_id` in the `Wards` sheet. | `W001`, `W002` |
| `ward_name` | Text | **Yes** | Friendly display name of the ward. | `ICU`, `Emergency` |
| `floor` | Integer/Text | **Yes** | Floor number or label where the bed resides. | `1`, `2`, `3` |
| `room` | Text | **Yes** | Room number, bay number, or cubicle identifier. | `101`, `Bay 1`, `Room 201` |
| `bed_type` | Text | **Yes** | Clinical classification of bed equipment. | `ICU Ventilator`, `Standard Care` |
| `status` | Dropdown | **Yes** | Must be strictly one of: `Available`, `Occupied`, `Cleaning`, `Reserved`, `Maintenance`. | `Available` |
| `patient_id` | Text | No | Patient ID if bed is Occupied or Reserved. Use `-` if vacant. | `P1001` or `-` |
| `last_updated` | Timestamp | **Yes** | Date and time when the bed status last changed (`YYYY-MM-DD HH:mm`). | `2026-10-01 10:30` |
| `updated_by` | Text | **Yes** | Name of the staff member or role who authorized the update. | `Nurse Jhanvi`, `Admin` |
| `active` | Boolean | **Yes** | Must be `TRUE` (bed is operational) or `FALSE` (permanently decommissioned). | `TRUE` |

---

### Sheet 2: Wards

Stores hospital wards, clinical departments, floor allocation, and total bed capacities.

#### Column Definitions:

| Column Header | Data Type | Required? | Description & Allowed Values | Example |
| :--- | :--- | :--- | :--- | :--- |
| `ward_id` | Text | **Yes** | Unique identifier for the clinical ward. | `W001`, `W002` |
| `ward_name` | Text | **Yes** | Friendly official title of the department. | `ICU`, `General Ward`, `Emergency` |
| `floor` | Integer/Text | **Yes** | Building floor where ward is situated. | `1`, `2`, `3`, `4` |
| `total_beds` | Integer | **Yes** | Total number of physical beds in this ward. | `6`, `20` |
| `active` | Boolean | **Yes** | Must be `TRUE` or `FALSE`. | `TRUE` |

---

### Sheet 3: Patients

Tracks patient admissions, room assignments, and discharge history.

#### Column Definitions:

| Column Header | Data Type | Required? | Description & Allowed Values | Example |
| :--- | :--- | :--- | :--- | :--- |
| `patient_id` | Text | **Yes** | Unique hospital record ID for the patient. | `P1001`, `P1002` |
| `bed_id` | Text | No | Assigned bed code. Use `-` if awaiting a bed or discharged. | `ICU-002` or `-` |
| `admission_date` | Date | **Yes** | Date of initial hospital intake (`YYYY-MM-DD`). | `2026-10-01` |
| `discharge_date` | Date | No | Date when patient was discharged (`YYYY-MM-DD`). Use `-` if active. | `2026-10-01` or `-` |
| `status` | Dropdown | **Yes** | Allowed values: `Admitted`, `Reserved`, `Awaiting Bed`, `Discharged`. | `Admitted` |

> [!IMPORTANT]
> **One-Patient-Per-Bed Rule**: A patient cannot occupy more than one bed simultaneously. If a patient is transferred, update their row's `bed_id` and set the former bed to `Cleaning`.

---

### Sheet 4: Users

Stores authorized staff profiles, roles, and department assignments.

#### Column Definitions:

| Column Header | Data Type | Required? | Description & Allowed Values | Example |
| :--- | :--- | :--- | :--- | :--- |
| `user_id` | Text | **Yes** | Unique staff identifier. | `U001`, `U002` |
| `name` | Text | **Yes** | Full name with title. | `Dr. Rajesh Kumar`, `Nurse Jhanvi` |
| `role` | Dropdown | **Yes** | Must be strictly: `Admin`, `Receptionist`, `Nurse`, `Viewer`. | `Nurse` |
| `department` | Text | **Yes** | Primary clinical department or desk. | `ICU & Critical Care` |
| `active` | Boolean | **Yes** | `TRUE` (active staff) or `FALSE` (inactive/resigned). | `TRUE` |

---

### Sheet 5: ActivityLog

Maintains an immutable chronological audit trail of all bed transitions, occupancy updates, and cleaning requests.

#### Column Definitions:

| Column Header | Data Type | Required? | Description & Allowed Values | Example |
| :--- | :--- | :--- | :--- | :--- |
| `timestamp` | Timestamp | **Yes** | Date and time of the event (`YYYY-MM-DD HH:mm:ss`). | `2026-10-01 10:32:00` |
| `user_id` | Text | **Yes** | ID of the staff member who made the update. | `U002` |
| `user_name` | Text | **Yes** | Name of the staff member at the time of change. | `Nurse Jhanvi Patel` |
| `action` | Text | **Yes** | Action type (e.g. `STATUS_CHANGE`, `PATIENT_ASSIGN`, `DISCHARGE`). | `STATUS_CHANGE` |
| `bed_id` | Text | **Yes** | Target bed identifier. | `ICU-004` |
| `old_status` | Text | **Yes** | Bed status before the update. | `Available` |
| `new_status` | Text | **Yes** | Bed status after the update. | `Occupied` |
| `details` | Text | No | Additional clinical context, patient notes, or reason for change. | `Admitted patient P1002 from ER trauma` |

> [!CAUTION]
> **Do Not Delete**: Never delete rows from `ActivityLog`. This sheet is required for medical governance and hospital compliance audits.

---

### Sheet 6: Settings

Stores facility-wide system configuration variables.

#### Column Definitions:

| Column Header | Data Type | Description | Example |
| :--- | :--- | :--- | :--- |
| `setting_key` | Text | Unique programmatic configuration key (do not rename). | `hospital_name`, `timezone` |
| `setting_value` | Text | Current active configuration value. | `City Memorial Hospital` |
| `description` | Text | Explanation of what this setting controls. | `Official registered facility name` |
| `last_updated` | Timestamp | Timestamp when the setting was last adjusted. | `2026-10-01 00:00:00` |

---

## 4. Google Sheet Usability & Visual Enhancements

For non-technical hospital staff, setting up **Freeze Rows**, **Dropdowns**, and **Conditional Color Formatting** makes data entry intuitive, mistake-proof, and identical to the frontend UI.

### How to Freeze Header Rows

Freezing row 1 ensures the column names remain visible when scrolling down long lists of beds:

1. Click on the tab (e.g., `Beds`).
2. Click menu **View** > **Freeze** > **1 row**.
3. Repeat for all 6 sheets (`Beds`, `Wards`, `Patients`, `Users`, `ActivityLog`, `Settings`).

---

### How to Set Up Data Validation Dropdowns

#### 1. Bed Status Dropdown (`Beds` Sheet, Column G)
1. In the `Beds` sheet, select cells **G2:G100**.
2. Click menu **Data** > **Data validation** > **+ Add rule**.
3. In the **Criteria** dropdown, select **Dropdown**.
4. Add the 5 allowed status values:
   - `Available` (Set pill color to **Green**)
   - `Occupied` (Set pill color to **Red**)
   - `Cleaning` (Set pill color to **Yellow / Orange**)
   - `Reserved` (Set pill color to **Blue**)
   - `Maintenance` (Set pill color to **Grey**)
5. Under Advanced options, set **If the data is invalid** to **Reject the input**.
6. Click **Done**.

#### 2. Active Dropdown (`Beds`, `Wards`, `Users` Sheets)
1. Select the `active` column (e.g., `Beds!K2:K100`, `Wards!E2:E50`, `Users!E2:E50`).
2. Click **Data** > **Data validation** > **+ Add rule**.
3. Set Criteria to **Dropdown**:
   - `TRUE`
   - `FALSE`
4. Click **Done**.

#### 3. User Role Dropdown (`Users` Sheet, Column C)
1. Select cells **C2:C100** in the `Users` sheet.
2. Click **Data** > **Data validation** > **+ Add rule**.
3. Set Criteria to **Dropdown**:
   - `Admin`
   - `Receptionist`
   - `Nurse`
   - `Viewer`
4. Click **Done**.

#### 4. Patient Status Dropdown (`Patients` Sheet, Column E)
1. Select cells **E2:E200** in the `Patients` sheet.
2. Click **Data** > **Data validation** > **+ Add rule**.
3. Set Criteria to **Dropdown**:
   - `Admitted`
   - `Reserved`
   - `Awaiting Bed`
   - `Discharged`
4. Click **Done**.

---

### How to Set Up Status Color Conditional Formatting

This allows hospital staff to immediately spot available beds vs occupied beds in the spreadsheet:

1. In the `Beds` sheet, select the status column **G2:G100**.
2. Click menu **Format** > **Conditional formatting**.
3. Under *Format cells if...*, select **Text is exactly**:
   - Value: `Available` -> Fill color **Light Green** (`#dcfce7`), text color **Dark Green** (`#15803d`).
   - Value: `Occupied` -> Fill color **Light Red** (`#fee2e2`), text color **Dark Red** (`#b91c1c`).
   - Value: `Cleaning` -> Fill color **Light Yellow** (`#fef3c7`), text color **Dark Amber** (`#b45309`).
   - Value: `Reserved` -> Fill color **Light Blue** (`#dbeafe`), text color **Dark Blue** (`#1d4ed8`).
   - Value: `Maintenance` -> Fill color **Light Grey** (`#f1f5f9`), text color **Dark Slate** (`#334155`).
4. Click **Done**.

---

### Duplicate Prevention Formulas

To alert administrators if someone enters a duplicate `bed_id` or assigns a patient to two beds:

#### 1. Unique Bed ID Alert (Beds Sheet)
Add this validation rule to column `A2:A100`:
- Criteria: **Custom formula is**
  ```excel
  =COUNTIF(A:A, A2)=1
  ```
- Reject invalid input. This blocks staff from adding two beds with the same ID!

#### 2. Duplicate Patient Assignment Alert (Patients Sheet)
In the `Patients` sheet, to ensure an active patient is not admitted into two beds:
- In an audit helper column (e.g. Column F), insert:
  ```excel
  =IF(AND(B2<>"-", COUNTIF(B:B, B2)>1), "⚠️ DUPLICATE BED", "OK")
  ```

---

## 5. Standard Operating Procedures (SOPs)

### How to Add a New Hospital Bed
1. Open the `Beds` sheet.
2. Scroll to the first empty row at the bottom.
3. Fill in:
   - **`bed_id`**: Enter a new unique ID following ward convention (e.g., `ICU-007` or `GEN-207`).
   - **`ward_id`**: Enter the matching ward ID from the `Wards` tab (e.g., `W001`).
   - **`ward_name`**: Enter the ward title (e.g., `ICU`).
   - **`floor`**: Enter the floor number (e.g., `1`).
   - **`room`**: Enter room or bay (e.g., `Room 104`).
   - **`bed_type`**: Enter type (e.g., `ICU Ventilator`, `Standard Care`).
   - **`status`**: Select `Available` from the dropdown.
   - **`patient_id`**: Enter `-`.
   - **`last_updated`**: Enter current date and time (e.g., `2026-10-01 11:00`).
   - **`updated_by`**: Enter your name.
   - **`active`**: Select `TRUE`.
4. Open the `Wards` sheet and increment the ward's `total_beds` count by 1.

---

### How to Add a New Ward
1. Open the `Wards` sheet.
2. Add a new row at the bottom:
   - **`ward_id`**: Assign a unique code (e.g., `W006`).
   - **`ward_name`**: Enter the ward name (e.g., `Maternity Ward`, `Orthopedic Recovery`).
   - **`floor`**: Enter building floor (e.g., `4`).
   - **`total_beds`**: Enter initial capacity (e.g., `8`).
   - **`active`**: Select `TRUE`.

---

### How to Add a New Staff Member
1. Open the `Users` sheet.
2. Add a new row:
   - **`user_id`**: Enter next sequential user ID (e.g., `U008`).
   - **`name`**: Staff full name (e.g., `Nurse Priya Nair`).
   - **`role`**: Select `Nurse`, `Receptionist`, `Admin`, or `Viewer`.
   - **`department`**: Primary work unit (e.g., `Maternity Ward`).
   - **`active`**: Select `TRUE`.

---

### How to Update Sample Data
- **To occupy a bed**: In `Beds`, set `status` to `Occupied`, and enter the patient's ID in `patient_id`. In `Patients`, add or update the patient's row with the matching `bed_id`.
- **To send a bed for cleaning**: In `Beds`, change `status` from `Occupied` to `Cleaning`, and clear `patient_id` to `-`.
- **To make a bed ready**: When sanitation finishes, change `status` to `Available`.
- **Always update**: Update `last_updated` with current time and `updated_by` with your staff name.

---

## 6. Protected Columns & Critical Database Rules

### Which Columns Should NOT Be Manually Edited?

| Sheet | Column(s) | Reason |
| :--- | :--- | :--- |
| **`Beds`** | `bed_id` | Changing a bed's ID breaks historical activity logs and patient links. |
| **`Beds`** | `ward_id` | Fixed structural relationship to the `Wards` table. |
| **`Patients`** | `patient_id` | Patient primary key. |
| **`ActivityLog`** | **Entire Sheet** | Read-only audit log. Rows should only be appended, never altered or deleted. |
| **`Settings`** | `setting_key` | Required by the frontend and API. Changing keys breaks system connectivity. |

---

### 8 Mandatory Database Integrity Rules

1. **Unique Bed IDs**: `bed_id` must be completely unique across the entire hospital.
2. **Restricted Statuses**: Status values must strictly be one of: `Available`, `Occupied`, `Cleaning`, `Reserved`, `Maintenance`.
3. **Boolean Flags**: The `active` column must only contain uppercase `TRUE` or `FALSE`.
4. **Single Bed Occupancy**: A patient cannot occupy more than one bed at any given time.
5. **Single Patient Per Bed**: A bed cannot have multiple patients assigned simultaneously.
6. **Immutable Audit Trail**: Never delete or rewrite historical entries in `ActivityLog`.
7. **Consistent Timestamps**: Always store date/time values in `YYYY-MM-DD HH:mm:ss` or `YYYY-MM-DD HH:mm` format.
8. **Stable Column Headers**: Never rename or delete any column headers; future Google Apps Script and API integrations rely on these exact column names.
