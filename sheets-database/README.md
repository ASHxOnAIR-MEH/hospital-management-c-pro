# 🏥 Google Sheets Database Files: Hospital Bed Monitoring System

This directory contains the database structure, CSV exports, Excel workbook template, and administration documentation for the **Hospital Bed Monitoring System**.

---

## 📂 File Directory

```
sheets-database/
├── Hospital_Bed_Database_Template.xlsx  # Multi-sheet Excel template ready to import into Google Drive
├── DATABASE_GUIDE.md                    # Full operational and data dictionary manual for administrators
├── build_workbook.js                    # Utility script that generates the .xlsx from CSV sources
└── csv/                                 # Individual CSV files for manual import
    ├── Beds.csv                         # 28 sample hospital beds across 5 wards
    ├── Wards.csv                        # 5 clinical departments (ICU, General, Emergency, Pediatric, Private)
    ├── Patients.csv                     # Sample admitted, reserved, and waiting patients
    ├── Users.csv                        # Staff profiles and roles (Admin, Nurse, Receptionist, Viewer)
    ├── ActivityLog.csv                  # Chronological audit trail of bed transitions
    └── Settings.csv                     # Hospital configuration parameters
```

---

## ⚡ Quick Start: 3 Steps to Launch in Google Sheets

1. Go to [Google Drive](https://drive.google.com/).
2. Upload `Hospital_Bed_Database_Template.xlsx`.
3. Right-click the uploaded file and select **Open with** > **Google Sheets**.
4. Click **File** > **Save as Google Sheets**.

Your database is ready with all 6 sheets and sample data.

For comprehensive column explanations, validation rules, and SOPs, read [`DATABASE_GUIDE.md`](./DATABASE_GUIDE.md).
