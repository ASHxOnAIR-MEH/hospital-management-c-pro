/**
 * main.c - Hospital Bed Monitoring System (C Core Module)
 * 
 * Interactive terminal menu providing clinical bed management,
 * validation, search, filtering, and report generation.
 */

#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <ctype.h>
#include "data.h"
#include "validation.h"
#include "bed.h"
#include "filter.h"
#include "report.h"

#define DEFAULT_DATA_FILE "beds_data.csv"

// Input helper to clear stdin buffer
static void clearInputBuffer(void) {
    int c;
    while ((c = getchar()) != '\n' && c != EOF) {}
}

// Safe string reading from stdin
static void safeGetLine(char *buffer, int size) {
    if (fgets(buffer, size, stdin) != NULL) {
        buffer[strcspn(buffer, "\r\n")] = '\0';
    } else {
        buffer[0] = '\0';
    }
}

// Display top-level system menu
static void displayMenu(void) {
    printf("\n");
    printf("=====================================\n");
    printf(" HOSPITAL BED MONITORING SYSTEM\n");
    printf("=====================================\n");
    printf("1. Add Bed\n");
    printf("2. View All Beds\n");
    printf("3. Search Bed\n");
    printf("4. Filter by Ward\n");
    printf("5. Filter by Floor\n");
    printf("6. Filter by Status\n");
    printf("7. Update Bed Status\n");
    printf("8. Generate Report\n");
    printf("9. Save Data\n");
    printf("10. Exit\n");
    printf("=====================================\n");
    printf("Enter choice: ");
}

// Menu Action 1: Add Bed
static void handleAddBed(Bed beds[], int *count, int *unsaved_changes) {
    printf("\n--- ADD NEW HOSPITAL BED ---\n");

    Bed b;
    memset(&b, 0, sizeof(Bed));
    b.active = 1;

    printf("Enter Bed ID (e.g. ICU-007, GEN-207): ");
    safeGetLine(b.bed_id, sizeof(b.bed_id));

    printf("Enter Ward Name (e.g. ICU, General Ward, Emergency): ");
    safeGetLine(b.ward, sizeof(b.ward));

    char floor_str[16];
    printf("Enter Floor Number (1-10): ");
    safeGetLine(floor_str, sizeof(floor_str));
    b.floor = atoi(floor_str);

    printf("Enter Room/Bay Number (e.g. 101, Bay 1): ");
    safeGetLine(b.room, sizeof(b.room));

    printf("Enter Bed Type (e.g. ICU Ventilator, Standard Ward): ");
    safeGetLine(b.bed_type, sizeof(b.bed_type));

    printf("Enter Initial Status [Available / Occupied / Cleaning / Reserved / Maintenance]: ");
    safeGetLine(b.status, sizeof(b.status));

    // If status is empty, default to Available
    if (strlen(b.status) == 0) {
        strcpy(b.status, STATUS_AVAILABLE);
    }

    if (strcmp(b.status, STATUS_OCCUPIED) == 0 || strcmp(b.status, STATUS_RESERVED) == 0) {
        printf("Enter Patient ID (e.g. P1011): ");
        safeGetLine(b.patient_id, sizeof(b.patient_id));
    } else {
        strcpy(b.patient_id, "-");
    }

    if (addBed(beds, count, &b)) {
        *unsaved_changes = 1;
    }
}

// Menu Action 3: Search Bed
static void handleSearchBed(const Bed beds[], int count) {
    printf("\n--- SEARCH BED OR PATIENT ---\n");
    printf("1. Search by Bed ID\n");
    printf("2. Search by Patient ID\n");
    printf("Enter sub-choice (1 or 2): ");

    char sub_str[16];
    safeGetLine(sub_str, sizeof(sub_str));
    int sub = atoi(sub_str);

    if (sub == 1) {
        char query[30];
        printf("Enter Bed ID to search: ");
        safeGetLine(query, sizeof(query));
        searchBed(beds, count, query);
    } else if (sub == 2) {
        char query[30];
        printf("Enter Patient ID to search: ");
        safeGetLine(query, sizeof(query));
        searchPatient(beds, count, query);
    } else {
        printf("Invalid search sub-choice.\n");
    }
}

// Menu Action 4: Filter by Ward
static void handleFilterByWard(const Bed beds[], int count) {
    char ward[50];
    printf("\nEnter Ward Name (e.g. ICU, General Ward, Emergency, Pediatric, Private Ward): ");
    safeGetLine(ward, sizeof(ward));
    filterByWard(beds, count, ward);
}

// Menu Action 5: Filter by Floor
static void handleFilterByFloor(const Bed beds[], int count) {
    char floor_str[16];
    printf("\nEnter Floor Number (1-10): ");
    safeGetLine(floor_str, sizeof(floor_str));
    int floor = atoi(floor_str);
    if (!validateFloor(floor)) return;
    filterByFloor(beds, count, floor);
}

// Menu Action 6: Filter by Status
static void handleFilterByStatus(const Bed beds[], int count) {
    printf("\nFilter by Status options:\n");
    printf("  1. Available\n");
    printf("  2. Occupied\n");
    printf("  3. Cleaning\n");
    printf("  4. Reserved\n");
    printf("  5. Maintenance\n");
    printf("Enter status name or number (1-5): ");

    char input[30];
    safeGetLine(input, sizeof(input));

    if (strcmp(input, "1") == 0) filterByStatus(beds, count, STATUS_AVAILABLE);
    else if (strcmp(input, "2") == 0) filterByStatus(beds, count, STATUS_OCCUPIED);
    else if (strcmp(input, "3") == 0) filterByStatus(beds, count, STATUS_CLEANING);
    else if (strcmp(input, "4") == 0) filterByStatus(beds, count, STATUS_RESERVED);
    else if (strcmp(input, "5") == 0) filterByStatus(beds, count, STATUS_MAINTENANCE);
    else filterByStatus(beds, count, input);
}

// Menu Action 7: Update Bed Status
static void handleUpdateStatus(Bed beds[], int count, int *unsaved_changes) {
    printf("\n--- UPDATE BED STATUS ---\n");
    char id[30];
    printf("Enter Bed ID: ");
    safeGetLine(id, sizeof(id));

    int idx = -1;
    for (int i = 0; i < count; i++) {
        if (strcmp(beds[i].bed_id, id) == 0) {
            idx = i;
            break;
        }
    }

    if (idx == -1) {
        printf("ERROR: Bed ID '%s' not found.\n", id);
        return;
    }

    Bed *b = &beds[idx];
    printf("Current State for %s: Status = %s | Patient = %s\n\n",
           b->bed_id, b->status, b->patient_id);

    printf("Select Status Action:\n");
    printf("1. Occupy Bed (Available/Reserved -> Occupied)\n");
    printf("2. Release Bed (Occupied -> Cleaning for sanitization)\n");
    printf("3. Mark Cleaning Complete (Cleaning -> Available)\n");
    printf("4. Reserve Bed (Available -> Reserved)\n");
    printf("5. Mark Maintenance (Available/Cleaning -> Maintenance)\n");
    printf("6. Custom Status Transition\n");
    printf("Enter choice (1-6): ");

    char act_str[16];
    safeGetLine(act_str, sizeof(act_str));
    int act = atoi(act_str);

    int ok = 0;
    if (act == 1) {
        char pid[30];
        printf("Enter Patient ID to admit (e.g. P1015): ");
        safeGetLine(pid, sizeof(pid));
        if (isPatientAlreadyAssigned(beds, count, pid, b->bed_id)) return;
        ok = occupyBed(b, pid);
    } else if (act == 2) {
        ok = releaseBed(b);
    } else if (act == 3) {
        ok = markCleaning(b);
    } else if (act == 4) {
        char pid[30];
        printf("Enter Patient ID for reservation (optional, '-' if none): ");
        safeGetLine(pid, sizeof(pid));
        ok = reserveBed(b, pid);
    } else if (act == 5) {
        ok = markMaintenance(b);
    } else if (act == 6) {
        char new_stat[30];
        char pid[30] = "-";
        printf("Enter target status (Available/Occupied/Cleaning/Reserved/Maintenance): ");
        safeGetLine(new_stat, sizeof(new_stat));
        if (strcmp(new_stat, STATUS_OCCUPIED) == 0 || strcmp(new_stat, STATUS_RESERVED) == 0) {
            printf("Enter Patient ID: ");
            safeGetLine(pid, sizeof(pid));
            if (isPatientAlreadyAssigned(beds, count, pid, b->bed_id)) return;
        }
        ok = updateBedStatus(b, new_stat, pid);
    } else {
        printf("Invalid action choice.\n");
    }

    if (ok) {
        *unsaved_changes = 1;
    }
}

// Menu Action 8: Generate Report & Export
static void handleGenerateReport(const Bed beds[], int count) {
    generateReport(beds, count);

    printf("\nExport summary to file 'bed_report.txt'? (y/n) [default: y]: ");
    char ans[16];
    safeGetLine(ans, sizeof(ans));

    if (strlen(ans) == 0 || ans[0] == 'y' || ans[0] == 'Y') {
        exportReportToFile(beds, count, DEFAULT_REPORT_FILE);
    }
}

// Menu Action 9: Save Data
static void handleSaveData(const Bed beds[], int count, int *unsaved_changes) {
    printf("\nEnter target CSV filename [press Enter for '%s']: ", DEFAULT_DATA_FILE);
    char fname[100];
    safeGetLine(fname, sizeof(fname));

    const char *target = (strlen(fname) > 0) ? fname : DEFAULT_DATA_FILE;
    if (saveBeds(beds, count, target)) {
        *unsaved_changes = 0;
    }
}

int main(void) {
    Bed beds[MAX_BEDS];
    int count = 0;
    int unsaved_changes = 0;

    printf("\n=====================================================\n");
    printf("   WELCOME TO HOSPITAL BED MONITORING SYSTEM (C CORE) \n");
    printf("=====================================================\n");

    // Attempt to load existing bed data from CSV
    int loaded = loadBeds(beds, &count, DEFAULT_DATA_FILE);
    if (loaded > 0) {
        printf("Loaded %d bed records from '%s'.\n", loaded, DEFAULT_DATA_FILE);
    } else {
        printf("No existing '%s' detected. Initializing 25 clinical sample beds...\n", DEFAULT_DATA_FILE);
        initSampleBeds(beds, &count);
        saveBeds(beds, count, DEFAULT_DATA_FILE);
    }

    int choice = 0;
    char input_line[32];

    while (1) {
        displayMenu();
        safeGetLine(input_line, sizeof(input_line));
        choice = atoi(input_line);

        switch (choice) {
            case 1:
                handleAddBed(beds, &count, &unsaved_changes);
                break;
            case 2:
                displayAllBeds(beds, count);
                break;
            case 3:
                handleSearchBed(beds, count);
                break;
            case 4:
                handleFilterByWard(beds, count);
                break;
            case 5:
                handleFilterByFloor(beds, count);
                break;
            case 6:
                handleFilterByStatus(beds, count);
                break;
            case 7:
                handleUpdateStatus(beds, count, &unsaved_changes);
                break;
            case 8:
                handleGenerateReport(beds, count);
                break;
            case 9:
                handleSaveData(beds, count, &unsaved_changes);
                break;
            case 10:
                if (unsaved_changes) {
                    printf("\nYou have unsaved modifications. Save to '%s' before exiting? (y/n) [default: y]: ", DEFAULT_DATA_FILE);
                    char save_ans[16];
                    safeGetLine(save_ans, sizeof(save_ans));
                    if (strlen(save_ans) == 0 || save_ans[0] == 'y' || save_ans[0] == 'Y') {
                        saveBeds(beds, count, DEFAULT_DATA_FILE);
                    }
                }
                printf("\nExiting Hospital Bed Monitoring System. Goodbye.\n\n");
                return 0;
            default:
                printf("\nInvalid selection! Please enter a number between 1 and 10.\n");
                break;
        }
    }

    return 0;
}
