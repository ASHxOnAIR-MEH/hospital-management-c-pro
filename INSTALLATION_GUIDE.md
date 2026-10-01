# Hospital Bed Monitoring System — Installation & Setup Guide

A complete guide for setting up, compiling, and deploying all four tiers of the Hospital Bed Monitoring System.

---

## 1. Prerequisites

| Component | Prerequisite | Recommended Version |
| :--- | :--- | :--- |
| **Frontend & API Middleware** | Node.js & npm | Node.js v18.0.0+ / npm v9.0.0+ |
| **Web Browser** | Modern Desktop/Tablet Browser | Google Chrome, Edge, Safari, Firefox |
| **Database & Cloud API** | Google Account | Free Google Account (Google Drive, Sheets, Apps Script) |
| **C Core Module** | C99-compliant C Compiler | GCC (MinGW-w64 on Windows / Linux), Clang, MSVC, or OnlineGDB |

---

## 2. Step 1: Frontend & Local Development Setup

### 1. Clone or Extract the Repository
```bash
cd c:/Users/ASHIK/Desktop/IEDC
```

### 2. Install Node Dependencies
```bash
npm install
```

### 3. Launch the Development Server
```bash
npm run dev
```
- Open [http://localhost:5173](http://localhost:5173).
- The built-in Vite API middleware automatically connects to `sheets-database/csv/` to provide a complete offline hospital backend environment.

### 4. Build Production Bundle
```bash
npm run build
```
Creates production-ready assets in `dist/`.

---

## 3. Step 2: Google Sheets Cloud Database Setup

1. Open [Google Drive](https://drive.google.com).
2. Click **New** $\rightarrow$ **File upload**.
3. Select `sample-data/Hospital_Bed_Database_Template.xlsx` (or `sheets-database/Hospital_Bed_Database_Template.xlsx`).
4. Double-click the uploaded file and select **Open with Google Sheets**.
5. Click **File** $\rightarrow$ **Save as Google Sheets**.
6. Verify that all 6 sheets are present:
   - `Beds`
   - `Wards`
   - `Patients`
   - `Users`
   - `ActivityLog`
   - `Settings`
7. Copy the Spreadsheet ID from the browser URL:
   `https://docs.google.com/spreadsheets/d/`**`<YOUR_SPREADSHEET_ID>`**`/edit`

---

## 4. Step 3: Google Apps Script Backend Deployment

1. Inside your Google Sheet, click **Extensions** $\rightarrow$ **Apps Script**.
2. Rename the project to `Hospital-Bed-API`.
3. Create 8 script files matching `google-apps-script/`:
   - `Code.gs`
   - `Config.gs`
   - `Beds.gs`
   - `Wards.gs`
   - `Patients.gs`
   - `Users.gs`
   - `Reports.gs`
   - `ActivityLog.gs`
4. Copy and paste the corresponding code from the `google-apps-script/` folder.
5. In `Config.gs`, paste your Spreadsheet ID:
   ```javascript
   var SPREADSHEET_ID = "YOUR_SPREADSHEET_ID_HERE";
   ```
6. Click **Deploy** $\rightarrow$ **New deployment**.
7. Configuration:
   - **Select type:** Web app
   - **Description:** Hospital Bed Monitoring System API v1
   - **Execute as:** Me (your Google account)
   - **Who has access:** Anyone
8. Click **Deploy** and grant Google OAuth permissions.
9. Copy the **Web App URL**:
   `https://script.google.com/macros/s/AKfycb.../exec`
10. Open [`src/config/api.ts`](src/config/api.ts) in your project and update:
    ```typescript
    export const API_BASE_URL = "https://script.google.com/macros/s/AKfycb.../exec";
    ```

---

## 5. Step 4: Compiling & Running the C Core Module

### Option A: Using Windows Batch Script (Fastest on Windows)
```cmd
cd c-core
compile.bat run
```

### Option B: Using GCC (Linux, macOS, WSL, or MinGW)
```bash
cd c-core
gcc -Wall -Wextra -std=c99 main.c bed.c validation.c filter.c report.c -o hospital_bed
./hospital_bed
```

### Option C: Using Make
```bash
cd c-core
make
./hospital_bed
```

### Option D: Using Online C Compiler (OnlineGDB / Replit)
1. Open [https://www.onlinegdb.com/online_c_compiler](https://www.onlinegdb.com/online_c_compiler)
2. Add tabs for: `main.c`, `bed.c`, `bed.h`, `validation.c`, `validation.h`, `filter.c`, `filter.h`, `report.c`, `report.h`, `data.h`, and `beds_data.csv`.
3. Click **Run**.

---

## 6. Step 5: Running the Quality Assurance Suite

Execute the automated 20-point test runner:
```bash
node server/integrationTest.js
```
Expected output:
```text
===============================================================
 FINAL RESULTS: 21 / 21 TESTS PASSED (100%)
===============================================================
```
