# 🚀 Google Apps Script Web App API Deployment Guide

Complete step-by-step guide to deploying the **Hospital Bed Monitoring System** backend using **Google Sheets** and **Google Apps Script**.

---

## 📑 Table of Contents

1. [Step 1: Create the Google Sheet](#step-1-create-the-google-sheet)
2. [Step 2: Add Required Sheets](#step-2-add-required-sheets)
3. [Step 3: Add Apps Script Code Files](#step-3-add-apps-script-code-files)
4. [Step 4: Deploy Apps Script as a Web App](#step-4-deploy-apps-script-as-a-web-app)
5. [Step 5: Set Access Permissions](#step-5-set-access-permissions)
6. [Step 6: Copy the Web App Deployment URL](#step-6-copy-the-web-app-deployment-url)
7. [Step 7: Add URL to Frontend Configuration](#step-7-add-url-to-frontend-configuration)
8. [Step 8: Run the Frontend](#step-8-run-the-frontend)
9. [Step 9: Test Bed Updates](#step-9-test-bed-updates)
10. [Step 10: Verify ActivityLog Records](#step-10-verify-activitylog-records)
11. [Troubleshooting & CORS Best Practices](#troubleshooting--cors-best-practices)

---

## Step 1: Create the Google Sheet

1. Open your browser and go to [Google Sheets](https://sheets.google.com/) or [Google Drive](https://drive.google.com/).
2. Create a new spreadsheet by clicking **Blank spreadsheet (+)**.
3. Rename the spreadsheet to:
   ```text
   Hospital Bed Monitoring Database
   ```

*(Fast Option: You can also upload `sheets-database/Hospital_Bed_Database_Template.xlsx` directly to Google Drive, right-click and select **Open with Google Sheets**.)*

---

## Step 2: Add Required Sheets

Make sure your spreadsheet contains these exact **6 sheet tabs** (sheet names are case-sensitive):

1. **`Beds`**
2. **`Wards`**
3. **`Patients`**
4. **`Users`**
5. **`ActivityLog`**
6. **`Settings`**

### Exact Column Headers for Row 1:

- **`Beds`**:
  `bed_id,ward_id,ward_name,floor,room,bed_type,status,patient_id,last_updated,updated_by,active`
- **`Wards`**:
  `ward_id,ward_name,floor,total_beds,active`
- **`Patients`**:
  `patient_id,bed_id,admission_date,discharge_date,status`
- **`Users`**:
  `user_id,name,role,department,active`
- **`ActivityLog`**:
  `timestamp,user_id,user_name,action,bed_id,old_status,new_status,details`
- **`Settings`**:
  `setting_key,setting_value,description,last_updated`

*(You can copy and paste the pre-filled sample rows from `sheets-database/csv/` into each sheet.)*

---

## Step 3: Add Apps Script Code Files

1. In your Google Sheet, click menu **Extensions** > **Apps Script**.
2. Rename the project from *"Untitled project"* to:
   ```text
   Hospital Bed API
   ```
3. In the left panel under **Files (+)**, create these 8 script files and copy the code from your repository:

| Script File Name | Repository Source File | Purpose |
| :--- | :--- | :--- |
| **`Code.gs`** | [`google-apps-script/Code.gs`](./google-apps-script/Code.gs) | Main `doGet` and `doPost` API router |
| **`Config.gs`** | [`google-apps-script/Config.gs`](./google-apps-script/Config.gs) | Sheet names, allowed statuses, and formatting |
| **`Beds.gs`** | [`google-apps-script/Beds.gs`](./google-apps-script/Beds.gs) | Bed retrieval, updates, creation, and deactivation |
| **`Wards.gs`** | [`google-apps-script/Wards.gs`](./google-apps-script/Wards.gs) | Ward directory retrieval and creation |
| **`Patients.gs`** | [`google-apps-script/Patients.gs`](./google-apps-script/Patients.gs) | Patient admissions, assignments, and discharges |
| **`Users.gs`** | [`google-apps-script/Users.gs`](./google-apps-script/Users.gs) | Authorized staff directory |
| **`Reports.gs`** | [`google-apps-script/Reports.gs`](./google-apps-script/Reports.gs) | Live occupancy and dashboard statistics |
| **`ActivityLog.gs`** | [`google-apps-script/ActivityLog.gs`](./google-apps-script/ActivityLog.gs) | Audit trail logger |

4. Press **Ctrl + S** (or click the disk icon 💾) to save all files.

---

## Step 4: Deploy Apps Script as a Web App

1. In the top-right corner of the Apps Script editor, click the blue **Deploy** button.
2. Select **New deployment**.
3. Next to *Select type*, click the gear icon (⚙️) and select **Web app**.
4. Configure the deployment settings:
   - **Description**: `Hospital Bed API v1`
   - **Execute as**: **Me (your_email@gmail.com)**
   - **Who has access**: **Anyone**

> [!IMPORTANT]
> **Who has access MUST be set to "Anyone"**: Hospital receptionists and nursing tablets access the system without needing individual Google Cloud service accounts.

---

## Step 5: Set Access Permissions

1. Click **Deploy**.
2. If prompted with *"Authorization required"*, click **Authorize access**.
3. Select your Google account.
4. If Google displays *"Google hasn't verified this app"*:
   - Click **Advanced** (bottom left).
   - Click **Go to Hospital Bed API (unsafe)**.
   - Click **Allow** to grant read/write access to your spreadsheet.

---

## Step 6: Copy the Web App Deployment URL

1. After deployment completes, Google will display:
   ```text
   Web app URL:
   https://script.google.com/macros/s/AKfycbxXXXXXXXXXXXXXXXXXXXXXXXXXXXX/exec
   ```
2. Click **Copy** next to the Web app URL.

---

## Step 7: Add URL to Frontend Configuration

1. Open your project file: [`src/config/api.ts`](src/config/api.ts).
2. Replace `API_BASE_URL` with your copied URL:
   ```typescript
   export const API_BASE_URL = "https://script.google.com/macros/s/AKfycbxXXXXXXXXXXXXXXXXXXXXXXXXXXXX/exec";
   ```
3. Save the file.

---

## Step 8: Run the Frontend

Start the Vite development server:
```bash
npm run dev
```
Open **[http://localhost:5173/](http://localhost:5173/)** in your browser.

- You will see the loading bar momentarily fetch the live beds, wards, patients, and activity logs from your Google Sheet.
- If the URL is incorrect or permissions are missing, the system will clearly show:
  > **Database Connection Error**: *Unable to connect to the hospital database. Please check your connection and try again.*

---

## Step 9: Test Bed Updates

Test the complete live update cycle:

1. Locate bed **`ICU-001`** on the dashboard (initially **Available**).
2. Click the bed card to open the **Bed Details Modal**.
3. Click the **Occupy Bed** button.
4. A safety dialog will appear: *"Are you sure you want to mark ICU-001 as Occupied?"*.
5. Click **Yes, Mark as Occupied**.
6. Observe:
   - Button shows loading state (`Saving...`).
   - Frontend sends `POST` request to Google Apps Script.
   - Apps Script updates the `status` column in the `Beds` sheet to `Occupied`.
   - Apps Script appends a row to `ActivityLog`.
   - Toast notification appears: *"Bed ICU-001 updated successfully"*.
   - Bed card turns **Red (Occupied)** on the dashboard.

---

## Step 10: Verify ActivityLog Records

1. In the frontend sidebar, click **Activity Log**.
2. Verify that the top row contains:
   - **Time**: Current timestamp
   - **Staff**: Active staff member
   - **Bed**: `ICU-001`
   - **Action**: `STATUS_CHANGE`
   - **Previous Status**: `Available`
   - **New Status**: `Occupied`
3. Switch over to your **Google Sheet** tab in your browser.
4. Click the **`ActivityLog`** tab and the **`Beds`** tab to verify that the rows physically updated in the spreadsheet!

---

## 💡 Troubleshooting & CORS Best Practices

### Problem: "Unable to connect to the hospital database"
- **Cause 1**: The Web App was deployed with access restricted to *"Only myself"*.
  - **Fix**: Re-deploy via **Deploy** > **Manage deployments** > edit > set *Who has access* to **Anyone** > create new version.
- **Cause 2**: The Google Sheet ID or tab names do not match.
  - **Fix**: Ensure your sheet tabs are named exactly: `Beds`, `Wards`, `Patients`, `Users`, `ActivityLog`, `Settings`.

### Problem: Browser CORS Errors with POST
- **Why this happens**: Google Apps Script Web Apps do not support HTTP `OPTIONS` preflight requests.
- **Solution already built into frontend**: [`src/services/apiService.ts`](src/services/apiService.ts) automatically sends requests to Google Apps Script with `Content-Type: text/plain;charset=utf-8`. This bypasses browser preflight checks and allows transparent 302 redirection directly to Google's response endpoint.
