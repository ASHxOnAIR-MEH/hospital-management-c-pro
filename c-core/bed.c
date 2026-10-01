/**
 * bed.c - Hospital Bed Monitoring System (C Core Module)
 * 
 * Implements bed management logic, status lifecycle transitions,
 * terminal rendering, and CSV file persistence.
 */

#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <ctype.h>
#include "bed.h"
#include "validation.h"

int updateBedStatus(Bed *bed, const char *new_status, const char *patient_id) {
    if (bed == NULL) {
        printf("ERROR: Bed pointer is null.\n");
        return 0;
    }

    if (!bed->active) {
        printf("ERROR: Inactive bed %s cannot be modified.\n", bed->bed_id);
        return 0;
    }

    if (!validateStatus(new_status)) {
        return 0;
    }

    // Verify clinical status transition logic
    if (!isValidTransition(bed->status, new_status)) {
        return 0;
    }

    // Save old status for reporting
    char old_status[20];
    strncpy(old_status, bed->status, sizeof(old_status) - 1);
    old_status[sizeof(old_status) - 1] = '\0';

    // Apply new status
    strncpy(bed->status, new_status, sizeof(bed->status) - 1);
    bed->status[sizeof(bed->status) - 1] = '\0';

    // Update patient assignment based on new status
    if (strcmp(new_status, STATUS_OCCUPIED) == 0 || strcmp(new_status, STATUS_RESERVED) == 0) {
        if (patient_id != NULL && strlen(patient_id) > 0 && strcmp(patient_id, "-") != 0) {
            strncpy(bed->patient_id, patient_id, sizeof(bed->patient_id) - 1);
            bed->patient_id[sizeof(bed->patient_id) - 1] = '\0';
        }
    } else {
        // Discharged or sanitized - vacant
        strncpy(bed->patient_id, "-", sizeof(bed->patient_id) - 1);
        bed->patient_id[sizeof(bed->patient_id) - 1] = '\0';
    }

    // Print transition confirmation
    printf("\nBed %s:\n%s -> %s\n", bed->bed_id, old_status, new_status);
    return 1;
}

int occupyBed(Bed *bed, const char *patient_id) {
    if (patient_id == NULL || strlen(patient_id) == 0 || strcmp(patient_id, "-") == 0) {
        printf("ERROR: Occupying a bed requires a valid patient ID.\n");
        return 0;
    }
    return updateBedStatus(bed, STATUS_OCCUPIED, patient_id);
}

int releaseBed(Bed *bed) {
    // Releasing an occupied bed moves it to Cleaning for disinfection
    return updateBedStatus(bed, STATUS_CLEANING, "-");
}

int markCleaning(Bed *bed) {
    // Sanitization complete: Cleaning -> Available
    return updateBedStatus(bed, STATUS_AVAILABLE, "-");
}

int reserveBed(Bed *bed, const char *patient_id) {
    if (patient_id == NULL || strlen(patient_id) == 0) {
        patient_id = "-";
    }
    return updateBedStatus(bed, STATUS_RESERVED, patient_id);
}

int markMaintenance(Bed *bed) {
    return updateBedStatus(bed, STATUS_MAINTENANCE, "-");
}

int addBed(Bed beds[], int *count, const Bed *new_bed) {
    if (beds == NULL || count == NULL || new_bed == NULL) {
        printf("ERROR: Invalid arguments to addBed.\n");
        return 0;
    }

    if (*count >= MAX_BEDS) {
        printf("ERROR: Hospital bed capacity reached (limit %d beds).\n", MAX_BEDS);
        return 0;
    }

    // Validate bed structural integrity
    if (!validateBed(new_bed)) {
        return 0;
    }

    // Check duplicate bed ID
    if (isDuplicateBedID(beds, *count, new_bed->bed_id)) {
        return 0;
    }

    // Check duplicate patient assignment
    if (isPatientAlreadyAssigned(beds, *count, new_bed->patient_id, new_bed->bed_id)) {
        return 0;
    }

    // Insert into array
    beds[*count] = *new_bed;
    (*count)++;

    printf("SUCCESS: Bed %s added to %s (Floor %d, Room %s).\n", 
           new_bed->bed_id, new_bed->ward, new_bed->floor, new_bed->room);
    return 1;
}

void printBedHeader(void) {
    printf("+------------+--------------------+-------+--------+----------------------+--------------+--------------+\n");
    printf("| %-10s | %-18s | %-5s | %-6s | %-20s | %-12s | %-12s |\n", 
           "BED ID", "WARD", "FLOOR", "ROOM", "TYPE", "STATUS", "PATIENT ID");
    printf("+------------+--------------------+-------+--------+----------------------+--------------+--------------+\n");
}

void printBed(const Bed *bed) {
    if (bed == NULL) return;
    printf("| %-10s | %-18s | %-5d | %-6s | %-20s | %-12s | %-12s |\n",
           bed->bed_id,
           bed->ward,
           bed->floor,
           bed->room,
           bed->bed_type,
           bed->status,
           (strlen(bed->patient_id) > 0) ? bed->patient_id : "-");
}

void displayAllBeds(const Bed beds[], int count) {
    if (count <= 0) {
        printf("\nNo beds registered in the system.\n");
        return;
    }

    printf("\n================================= HOSPITAL BEDS REGISTRY (%d BEDS) =================================\n", count);
    printBedHeader();
    for (int i = 0; i < count; i++) {
        if (beds[i].active) {
            printBed(&beds[i]);
        }
    }
    printf("+------------+--------------------+-------+--------+----------------------+--------------+--------------+\n");
}

int loadBeds(Bed beds[], int *count, const char *filename) {
    FILE *fp = fopen(filename, "r");
    if (fp == NULL) {
        return -1; // File not found or unreadable
    }

    char line[MAX_LINE_LEN];
    int loaded = 0;

    // Check first line for header
    if (fgets(line, sizeof(line), fp) != NULL) {
        // If line contains header text, skip it; otherwise rewind
        if (strstr(line, "bed_id") == NULL) {
            rewind(fp);
        }
    }

    while (fgets(line, sizeof(line), fp) != NULL && loaded < MAX_BEDS) {
        // Strip trailing \r and \n
        line[strcspn(line, "\r\n")] = '\0';
        if (strlen(line) == 0) continue;

        Bed b;
        memset(&b, 0, sizeof(Bed));
        b.active = 1;

        // Parse CSV format: bed_id,ward,floor,room,bed_type,status,patient_id,active
        char *token;
        char *rest = line;

        // 1. bed_id
        token = strtok(rest, ",");
        if (!token) continue;
        strncpy(b.bed_id, token, sizeof(b.bed_id) - 1);

        // 2. ward
        token = strtok(NULL, ",");
        if (!token) continue;
        strncpy(b.ward, token, sizeof(b.ward) - 1);

        // 3. floor
        token = strtok(NULL, ",");
        if (!token) continue;
        b.floor = atoi(token);

        // 4. room
        token = strtok(NULL, ",");
        if (!token) continue;
        strncpy(b.room, token, sizeof(b.room) - 1);

        // 5. bed_type
        token = strtok(NULL, ",");
        if (!token) continue;
        strncpy(b.bed_type, token, sizeof(b.bed_type) - 1);

        // 6. status
        token = strtok(NULL, ",");
        if (!token) continue;
        strncpy(b.status, token, sizeof(b.status) - 1);

        // 7. patient_id (might be empty: ",,")
        token = strtok(NULL, ",");
        if (token && strlen(token) > 0) {
            strncpy(b.patient_id, token, sizeof(b.patient_id) - 1);
        } else {
            strcpy(b.patient_id, "-");
        }

        // 8. active (optional, default 1)
        token = strtok(NULL, ",");
        if (token) {
            b.active = atoi(token);
        } else {
            b.active = 1;
        }

        beds[loaded++] = b;
    }

    fclose(fp);
    *count = loaded;
    return loaded;
}

int saveBeds(const Bed beds[], int count, const char *filename) {
    FILE *fp = fopen(filename, "w");
    if (fp == NULL) {
        printf("ERROR: Could not open file '%s' for writing.\n", filename);
        return 0;
    }

    // Write CSV header
    fprintf(fp, "bed_id,ward,floor,room,bed_type,status,patient_id,active\n");

    for (int i = 0; i < count; i++) {
        const char *pid = (strcmp(beds[i].patient_id, "-") == 0) ? "" : beds[i].patient_id;
        fprintf(fp, "%s,%s,%d,%s,%s,%s,%s,%d\n",
                beds[i].bed_id,
                beds[i].ward,
                beds[i].floor,
                beds[i].room,
                beds[i].bed_type,
                beds[i].status,
                pid,
                beds[i].active);
    }

    fclose(fp);
    printf("SUCCESS: %d bed records saved to '%s'.\n", count, filename);
    return 1;
}

void initSampleBeds(Bed beds[], int *count) {
    static const Bed samples[] = {
        // ICU Ward (Floor 1)
        {"ICU-001", "ICU", 1, "101", "ICU Ventilator", STATUS_AVAILABLE, "-", 1},
        {"ICU-002", "ICU", 1, "102", "ICU Ventilator", STATUS_OCCUPIED, "P1001", 1},
        {"ICU-003", "ICU", 1, "103", "ICU Step-down",  STATUS_CLEANING, "-", 1},
        {"ICU-004", "ICU", 1, "104", "ICU Step-down",  STATUS_RESERVED, "P1002", 1},
        {"ICU-005", "ICU", 1, "105", "ICU Isolation",  STATUS_MAINTENANCE, "-", 1},
        {"ICU-006", "ICU", 1, "106", "ICU Ventilator", STATUS_AVAILABLE, "-", 1},

        // General Ward (Floor 2)
        {"GEN-201", "General Ward", 2, "201", "Standard Ward", STATUS_AVAILABLE, "-", 1},
        {"GEN-202", "General Ward", 2, "201", "Standard Ward", STATUS_OCCUPIED, "P1003", 1},
        {"GEN-203", "General Ward", 2, "202", "Standard Ward", STATUS_OCCUPIED, "P1004", 1},
        {"GEN-204", "General Ward", 2, "202", "Standard Ward", STATUS_CLEANING, "-", 1},
        {"GEN-205", "General Ward", 2, "203", "Semi-Fowler",   STATUS_AVAILABLE, "-", 1},
        {"GEN-206", "General Ward", 2, "203", "Semi-Fowler",   STATUS_OCCUPIED, "P1005", 1},

        // Emergency Ward (Floor 1)
        {"EMG-101", "Emergency", 1, "Bay 1", "Trauma Bed",       STATUS_OCCUPIED, "P1006", 1},
        {"EMG-102", "Emergency", 1, "Bay 2", "Trauma Bed",       STATUS_AVAILABLE, "-", 1},
        {"EMG-103", "Emergency", 1, "Bay 3", "Resuscitation Bed", STATUS_AVAILABLE, "-", 1},
        {"EMG-104", "Emergency", 1, "Bay 4", "Observation Bed",  STATUS_CLEANING, "-", 1},
        {"EMG-105", "Emergency", 1, "Bay 5", "Observation Bed",  STATUS_MAINTENANCE, "-", 1},

        // Pediatric Ward (Floor 3)
        {"PED-301", "Pediatric", 3, "301", "Pediatric Crib",  STATUS_AVAILABLE, "-", 1},
        {"PED-302", "Pediatric", 3, "301", "Pediatric Bed",   STATUS_OCCUPIED, "P1007", 1},
        {"PED-303", "Pediatric", 3, "302", "Pediatric Bed",   STATUS_OCCUPIED, "P1008", 1},
        {"PED-304", "Pediatric", 3, "302", "Pediatric Isolation", STATUS_AVAILABLE, "-", 1},

        // Private Ward (Floor 4)
        {"PVT-401", "Private Ward", 4, "Deluxe 1", "Deluxe Electric", STATUS_AVAILABLE, "-", 1},
        {"PVT-402", "Private Ward", 4, "Deluxe 2", "Deluxe Electric", STATUS_OCCUPIED, "P1009", 1},
        {"PVT-403", "Private Ward", 4, "Suite 1",  "Executive Suite", STATUS_RESERVED, "P1010", 1},
        {"PVT-404", "Private Ward", 4, "Suite 2",  "Executive Suite", STATUS_CLEANING, "-", 1}
    };

    int total_samples = sizeof(samples) / sizeof(samples[0]);
    for (int i = 0; i < total_samples; i++) {
        beds[i] = samples[i];
    }
    *count = total_samples;
}
