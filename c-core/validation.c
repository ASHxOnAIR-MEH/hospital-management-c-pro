/**
 * validation.c - Hospital Bed Monitoring System (C Core Module)
 * 
 * Implements clinical and structural validation functions.
 */

#include <stdio.h>
#include <string.h>
#include <ctype.h>
#include "validation.h"

int validateBedID(const char *bed_id) {
    if (bed_id == NULL || strlen(bed_id) == 0) {
        printf("ERROR: Bed ID cannot be empty.\n");
        return 0;
    }

    int len = strlen(bed_id);
    if (len < 2 || len >= 20) {
        printf("ERROR: Invalid bed ID length (must be 2-19 characters): %s\n", bed_id);
        return 0;
    }

    // Check characters (alphanumeric, hyphen, underscore)
    for (int i = 0; i < len; i++) {
        if (!isalnum((unsigned char)bed_id[i]) && bed_id[i] != '-' && bed_id[i] != '_') {
            printf("ERROR: Invalid bed ID characters (only letters, numbers, '-' and '_' allowed): %s\n", bed_id);
            return 0;
        }
    }

    return 1;
}

int validateStatus(const char *status) {
    if (status == NULL || strlen(status) == 0) {
        printf("ERROR: Bed status cannot be empty.\n");
        return 0;
    }

    if (strcmp(status, STATUS_AVAILABLE) == 0 ||
        strcmp(status, STATUS_OCCUPIED) == 0 ||
        strcmp(status, STATUS_CLEANING) == 0 ||
        strcmp(status, STATUS_RESERVED) == 0 ||
        strcmp(status, STATUS_MAINTENANCE) == 0) {
        return 1;
    }

    printf("ERROR: Invalid bed status '%s'. Allowed: Available, Occupied, Cleaning, Reserved, Maintenance\n", status);
    return 0;
}

int validatePatientID(const char *patient_id) {
    if (patient_id == NULL) return 1;
    if (strcmp(patient_id, "-") == 0 || strlen(patient_id) == 0) return 1;

    int len = strlen(patient_id);
    if (len < 2 || len >= 30) {
        printf("ERROR: Invalid patient ID length (must be 2-29 characters): %s\n", patient_id);
        return 0;
    }

    for (int i = 0; i < len; i++) {
        if (!isalnum((unsigned char)patient_id[i]) && patient_id[i] != '-' && patient_id[i] != '_') {
            printf("ERROR: Invalid patient ID characters: %s\n", patient_id);
            return 0;
        }
    }

    return 1;
}

int validateFloor(int floor) {
    if (floor < 1 || floor > 20) {
        printf("ERROR: Invalid floor number %d. Must be between 1 and 20.\n", floor);
        return 0;
    }
    return 1;
}

int validateRoom(const char *room) {
    if (room == NULL || strlen(room) == 0) {
        printf("ERROR: Room cannot be empty.\n");
        return 0;
    }
    return 1;
}

int validateBed(const Bed *bed) {
    if (bed == NULL) {
        printf("ERROR: Bed pointer is null.\n");
        return 0;
    }

    if (!validateBedID(bed->bed_id)) return 0;
    if (!validateStatus(bed->status)) return 0;
    if (!validateFloor(bed->floor)) return 0;
    if (!validateRoom(bed->room)) return 0;
    if (!validatePatientID(bed->patient_id)) return 0;

    if (bed->ward[0] == '\0') {
        printf("ERROR: Ward name cannot be empty.\n");
        return 0;
    }

    // Business rule: If Occupied, patient_id should not be "-" or empty
    if (strcmp(bed->status, STATUS_OCCUPIED) == 0) {
        if (strcmp(bed->patient_id, "-") == 0 || strlen(bed->patient_id) == 0) {
            printf("ERROR: Occupied bed must have a valid patient ID assigned.\n");
            return 0;
        }
    }

    return 1;
}

int isDuplicateBedID(const Bed beds[], int count, const char *bed_id) {
    if (bed_id == NULL) return 0;

    for (int i = 0; i < count; i++) {
        if (strcmp(beds[i].bed_id, bed_id) == 0) {
            printf("ERROR: Bed already exists: %s\n", bed_id);
            return 1;
        }
    }
    return 0;
}

int isPatientAlreadyAssigned(const Bed beds[], int count, const char *patient_id, const char *current_bed_id) {
    if (patient_id == NULL || strcmp(patient_id, "-") == 0 || strlen(patient_id) == 0) {
        return 0;
    }

    for (int i = 0; i < count; i++) {
        // If bed is active and occupied/reserved by this patient
        if (beds[i].active && 
            (strcmp(beds[i].status, STATUS_OCCUPIED) == 0 || strcmp(beds[i].status, STATUS_RESERVED) == 0)) {
            if (strcmp(beds[i].patient_id, patient_id) == 0) {
                // If it's a different bed
                if (current_bed_id == NULL || strcmp(beds[i].bed_id, current_bed_id) != 0) {
                    printf("ERROR: Patient already assigned: Patient %s is already in bed %s\n", patient_id, beds[i].bed_id);
                    return 1;
                }
            }
        }
    }
    return 0;
}

int isValidTransition(const char *current_status, const char *new_status) {
    if (strcmp(current_status, new_status) == 0) {
        return 1; // No change
    }

    // Transitions from Available
    if (strcmp(current_status, STATUS_AVAILABLE) == 0) {
        if (strcmp(new_status, STATUS_OCCUPIED) == 0 ||
            strcmp(new_status, STATUS_RESERVED) == 0 ||
            strcmp(new_status, STATUS_MAINTENANCE) == 0) {
            return 1;
        }
    }

    // Transitions from Occupied
    if (strcmp(current_status, STATUS_OCCUPIED) == 0) {
        if (strcmp(new_status, STATUS_CLEANING) == 0) {
            return 1; // Standard hospital discharge to sanitization
        }
        if (strcmp(new_status, STATUS_RESERVED) == 0) {
            return 1; // Transfer hold
        }
    }

    // Transitions from Cleaning
    if (strcmp(current_status, STATUS_CLEANING) == 0) {
        if (strcmp(new_status, STATUS_AVAILABLE) == 0 ||
            strcmp(new_status, STATUS_MAINTENANCE) == 0) {
            return 1;
        }
    }

    // Transitions from Reserved
    if (strcmp(current_status, STATUS_RESERVED) == 0) {
        if (strcmp(new_status, STATUS_OCCUPIED) == 0 ||
            strcmp(new_status, STATUS_AVAILABLE) == 0 ||
            strcmp(new_status, STATUS_CLEANING) == 0) {
            return 1;
        }
    }

    // Transitions from Maintenance
    if (strcmp(current_status, STATUS_MAINTENANCE) == 0) {
        if (strcmp(new_status, STATUS_CLEANING) == 0 ||
            strcmp(new_status, STATUS_AVAILABLE) == 0) {
            return 1;
        }
    }

    printf("ERROR: Invalid status transition from %s to %s.\n", current_status, new_status);
    return 0;
}
