/**
 * filter.c - Hospital Bed Monitoring System (C Core Module)
 * 
 * Implements searching and filtering algorithms across bed attributes.
 */

#include <stdio.h>
#include <string.h>
#include <ctype.h>
#include "filter.h"
#include "bed.h"

// Case-insensitive string comparison helper
static int equalsIgnoreCase(const char *s1, const char *s2) {
    if (!s1 || !s2) return 0;
    while (*s1 && *s2) {
        if (tolower((unsigned char)*s1) != tolower((unsigned char)*s2)) {
            return 0;
        }
        s1++;
        s2++;
    }
    return *s1 == *s2;
}

// Case-insensitive substring search helper
static int containsIgnoreCase(const char *haystack, const char *needle) {
    if (!haystack || !needle) return 0;
    if (strlen(needle) == 0) return 1;

    int nlen = strlen(needle);
    int hlen = strlen(haystack);
    if (nlen > hlen) return 0;

    for (int i = 0; i <= hlen - nlen; i++) {
        int match = 1;
        for (int j = 0; j < nlen; j++) {
            if (tolower((unsigned char)haystack[i + j]) != tolower((unsigned char)needle[j])) {
                match = 0;
                break;
            }
        }
        if (match) return 1;
    }
    return 0;
}

void filterByWard(const Bed beds[], int count, const char *ward) {
    if (ward == NULL || strlen(ward) == 0) {
        printf("ERROR: Ward name cannot be empty.\n");
        return;
    }

    printf("\nSearch:\nWard = %s\n\nOutput:\n", ward);

    int found = 0;
    for (int i = 0; i < count; i++) {
        if (beds[i].active && containsIgnoreCase(beds[i].ward, ward)) {
            printf("%-10s %s\n", beds[i].bed_id, beds[i].status);
            found++;
        }
    }

    if (found == 0) {
        printf("No beds found matching ward '%s'.\n", ward);
        return;
    }

    // Also display detailed tabular layout
    printf("\nDetailed View for Ward: %s (%d beds)\n", ward, found);
    printBedHeader();
    for (int i = 0; i < count; i++) {
        if (beds[i].active && containsIgnoreCase(beds[i].ward, ward)) {
            printBed(&beds[i]);
        }
    }
    printf("+------------+--------------------+-------+--------+----------------------+--------------+--------------+\n");
}

void filterByFloor(const Bed beds[], int count, int floor) {
    printf("\nSearch:\nFloor = %d\n\n", floor);

    int found = 0;
    for (int i = 0; i < count; i++) {
        if (beds[i].active && beds[i].floor == floor) {
            found++;
        }
    }

    if (found == 0) {
        printf("No active beds found on floor %d.\n", floor);
        return;
    }

    printf("Beds on Floor %d (%d beds):\n", floor, found);
    printBedHeader();
    for (int i = 0; i < count; i++) {
        if (beds[i].active && beds[i].floor == floor) {
            printBed(&beds[i]);
        }
    }
    printf("+------------+--------------------+-------+--------+----------------------+--------------+--------------+\n");
}

void filterByStatus(const Bed beds[], int count, const char *status) {
    if (status == NULL || strlen(status) == 0) {
        printf("ERROR: Status cannot be empty.\n");
        return;
    }

    printf("\nSearch:\nStatus = %s\n\n", status);

    int found = 0;
    for (int i = 0; i < count; i++) {
        if (beds[i].active && equalsIgnoreCase(beds[i].status, status)) {
            found++;
        }
    }

    if (found == 0) {
        printf("No beds found with status '%s'.\n", status);
        return;
    }

    printf("Beds with status '%s' (%d beds):\n", status, found);
    printBedHeader();
    for (int i = 0; i < count; i++) {
        if (beds[i].active && equalsIgnoreCase(beds[i].status, status)) {
            printBed(&beds[i]);
        }
    }
    printf("+------------+--------------------+-------+--------+----------------------+--------------+--------------+\n");
}

int searchBed(const Bed beds[], int count, const char *bed_id) {
    if (bed_id == NULL || strlen(bed_id) == 0) {
        printf("ERROR: Bed ID cannot be empty.\n");
        return -1;
    }

    for (int i = 0; i < count; i++) {
        if (equalsIgnoreCase(beds[i].bed_id, bed_id)) {
            printf("\nBed Found:\n");
            printf("----------------------------------------\n");
            printf("Bed ID      : %s\n", beds[i].bed_id);
            printf("Ward        : %s\n", beds[i].ward);
            printf("Floor       : %d\n", beds[i].floor);
            printf("Room        : %s\n", beds[i].room);
            printf("Type        : %s\n", beds[i].bed_type);
            printf("Status      : %s\n", beds[i].status);
            printf("Patient ID  : %s\n", (strlen(beds[i].patient_id) > 0) ? beds[i].patient_id : "-");
            printf("Operational : %s\n", beds[i].active ? "Yes" : "No (Decommissioned)");
            printf("----------------------------------------\n");
            return i;
        }
    }

    printf("ERROR: Bed with ID '%s' not found.\n", bed_id);
    return -1;
}

int searchPatient(const Bed beds[], int count, const char *patient_id) {
    if (patient_id == NULL || strlen(patient_id) == 0 || strcmp(patient_id, "-") == 0) {
        printf("ERROR: Invalid patient ID.\n");
        return -1;
    }

    for (int i = 0; i < count; i++) {
        if (beds[i].active && equalsIgnoreCase(beds[i].patient_id, patient_id)) {
            printf("\nPatient Assignment Found:\n");
            printf("----------------------------------------\n");
            printf("Patient ID  : %s\n", beds[i].patient_id);
            printf("Bed ID      : %s\n", beds[i].bed_id);
            printf("Ward        : %s\n", beds[i].ward);
            printf("Floor       : %d\n", beds[i].floor);
            printf("Room        : %s\n", beds[i].room);
            printf("Bed Status  : %s\n", beds[i].status);
            printf("----------------------------------------\n");
            return i;
        }
    }

    printf("No active bed assignment found for patient '%s'.\n", patient_id);
    return -1;
}
