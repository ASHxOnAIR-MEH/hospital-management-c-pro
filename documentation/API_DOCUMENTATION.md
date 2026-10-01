# Hospital Bed Monitoring System — API Documentation

This document describes the RESTful Web App API powering the communication between the **React Frontend**, **Google Apps Script**, and **Google Sheets Database**.

---

## 1. API Architecture Overview

```text
React Frontend (src/services/apiService.ts)
       │
       │ HTTP GET / POST (JSON)
       ▼
Google Apps Script (google-apps-script/Code.gs)
       │
       │ SpreadsheetApp Service API
       ▼
Google Sheets Database (Beds, Wards, Patients, Users, ActivityLog, Settings)
```

### Base URL Configuration
The API endpoint is configured in [`src/config/api.ts`](file:///c:/Users/ASHIK/Desktop/IEDC/src/config/api.ts):

- **Local Development & Testing:**
  ```typescript
  export const API_BASE_URL = "/api";
  ```
- **Live Google Apps Script Web App:**
  ```typescript
  export const API_BASE_URL = "https://script.google.com/macros/s/AKfycb.../exec";
  ```

---

## 2. Universal Protocol & CORS Handling

When connecting directly to Google Apps Script Web Apps:
1. **GET Requests:** Use standard query parameters: `?action=<endpoint_name>` (e.g. `?action=beds`).
2. **POST Requests:** The client transmits the payload as `Content-Type: text/plain;charset=utf-8` containing a stringified JSON body. This avoids browser **CORS Preflight (OPTIONS)** blocks, ensuring seamless cross-origin communication directly from any browser or mobile tablet.

---

## 3. GET Endpoints

### 3.1. `GET /beds`
Retrieves all hospital bed records.

**Response (200 OK):**
```json
{
  "success": true,
  "count": 28,
  "data": [
    {
      "bed_id": "ICU-001",
      "ward_id": "W001",
      "ward_name": "ICU",
      "floor": 1,
      "room": "101",
      "bed_type": "ICU Ventilator",
      "status": "Available",
      "patient_id": "-",
      "last_updated": "2026-10-01 10:30:00",
      "updated_by": "Nurse Sarah",
      "active": true
    }
  ]
}
```

### 3.2. `GET /wards`
Retrieves all active hospital departments.

**Response (200 OK):**
```json
{
  "success": true,
  "count": 5,
  "data": [
    {
      "ward_id": "W001",
      "ward_name": "ICU",
      "floor": 1,
      "total_beds": 6,
      "active": true
    }
  ]
}
```

### 3.3. `GET /patients`
Retrieves all inpatient records with current admission status.

### 3.4. `GET /users`
Retrieves staff profiles and authorization levels.

### 3.5. `GET /activity`
Retrieves the chronological audit log of bed movements and status changes.

### 3.6. `GET /dashboard`
Calculates and returns aggregated operational hospital metrics:
```json
{
  "success": true,
  "data": {
    "metrics": {
      "total_beds": 28,
      "available": 9,
      "occupied": 10,
      "cleaning": 4,
      "reserved": 3,
      "maintenance": 2,
      "occupancy_rate": 36
    },
    "ward_summaries": [ ... ],
    "recent_activity": [ ... ],
    "awaiting_patients_count": 2,
    "timestamp": "2026-10-01 10:35:00"
  }
}
```

---

## 4. POST Endpoints

### 4.1. `POST /bed/update`
Updates status, notes, or patient assignment for an existing bed.

**Request Payload:**
```json
{
  "bed_id": "ICU-001",
  "status": "Available",
  "updated_by": "Sanitation Staff",
  "user_id": "U003",
  "details": "Terminal disinfection complete"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Bed updated successfully",
  "data": { "bed_id": "ICU-001", "status": "Available" }
}
```

---

### 4.2. `POST /patient/assign`
Assigns an inpatient to an operational bed and changes bed status to `Occupied`.

**Request Payload:**
```json
{
  "patient_id": "P1001",
  "bed_id": "ICU-001",
  "admission_date": "2026-10-01",
  "updated_by": "Nurse Sarah",
  "user_id": "U002",
  "details": "Admitted via Emergency"
}
```

**Validation Rules:**
- Rejects if bed does not exist (404).
- Rejects if bed is inactive or under maintenance (400).
- Rejects if bed is already occupied (400).
- Rejects if patient is already assigned to another bed (400).

---

### 4.3. `POST /patient/discharge`
Discharges an inpatient from their bed and automatically moves the bed to sanitization (`Cleaning`).

**Request Payload:**
```json
{
  "bed_id": "ICU-001",
  "target_bed_status": "Cleaning",
  "updated_by": "Dr. Michael Chen",
  "user_id": "U004",
  "details": "Discharged home; routine cleaning initiated"
}
```

---

### 4.4. `POST /bed/create`
Registers a new physical bed in a ward.

**Request Payload:**
```json
{
  "bed_id": "ICU-007",
  "ward_id": "W001",
  "ward_name": "ICU",
  "floor": "1",
  "room": "104",
  "bed_type": "ICU Ventilator",
  "status": "Available",
  "updated_by": "Admin"
}
```

---

### 4.5. `POST /bed/deactivate`
Decommissions a bed, setting `active = FALSE`.

---

### 4.6. `POST /ward/create`
Creates a new clinical department.

---

## 5. Standard Error Responses

Errors return standard JSON structures with descriptive feedback:

```json
{
  "success": false,
  "message": "Duplicate patient assignment: Patient P1001 is already assigned to bed ICU-002"
}
```

Common status codes:
- **`200 OK`**: Operation succeeded.
- **`400 Bad Request`**: Validation failure (empty field, invalid status, duplicate patient).
- **`404 Not Found`**: Bed ID or Patient ID does not exist.
- **`500 Internal Error`**: Google Spreadsheet access issue.
