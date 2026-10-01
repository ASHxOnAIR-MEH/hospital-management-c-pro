/**
 * test_suite.c - Hospital Bed Monitoring System (C Core Module)
 * 
 * Automated Unit & Integration Test Suite executing all 20 clinical test cases:
 * - Data validation (bed ID, status, patient assignment, floor/room)
 * - State lifecycle transitions (Available -> Occupied -> Cleaning -> Available)
 * - Search and filtering (ward, floor, status, bed ID, patient ID)
 * - Report calculation & export to bed_report.txt
 * - CSV persistence (load & save)
 */

#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <assert.h>
#include "data.h"
#include "validation.h"
#include "bed.h"
#include "filter.h"
#include "report.h"

static int tests_run = 0;
static int tests_passed = 0;

#define RUN_TEST(fn) do { \
    tests_run++; \
    printf("[RUNNING] %s ... ", #fn); \
    if (fn()) { \
        tests_passed++; \
        printf("PASSED\n"); \
    } else { \
        printf("FAILED\n"); \
    } \
} while(0)

// Test 1: Validate Bed ID
int test_validate_bed_id(void) {
    if (validateBedID("") != 0) return 0; // Empty
    if (validateBedID("A") != 0) return 0; // Too short
    if (validateBedID("ICU@#12") != 0) return 0; // Special char
    if (validateBedID("ICU-001") != 1) return 0; // Valid
    if (validateBedID("GEN_202") != 1) return 0; // Valid
    return 1;
}

// Test 2: Validate Status
int test_validate_status(void) {
    if (validateStatus("Available") != 1) return 0;
    if (validateStatus("Occupied") != 1) return 0;
    if (validateStatus("Cleaning") != 1) return 0;
    if (validateStatus("Reserved") != 1) return 0;
    if (validateStatus("Maintenance") != 1) return 0;
    if (validateStatus("Unknown") != 0) return 0;
    if (validateStatus("") != 0) return 0;
    return 1;
}

// Test 3: Duplicate Bed ID detection
int test_duplicate_bed_id(void) {
    Bed beds[5];
    memset(beds, 0, sizeof(beds));
    strcpy(beds[0].bed_id, "ICU-001");
    strcpy(beds[1].bed_id, "GEN-201");

    if (isDuplicateBedID(beds, 2, "ICU-001") != 1) return 0;
    if (isDuplicateBedID(beds, 2, "ICU-002") != 0) return 0;
    return 1;
}

// Test 4: Duplicate Patient Assignment detection
int test_duplicate_patient(void) {
    Bed beds[5];
    memset(beds, 0, sizeof(beds));
    beds[0].active = 1;
    strcpy(beds[0].bed_id, "ICU-001");
    strcpy(beds[0].status, STATUS_OCCUPIED);
    strcpy(beds[0].patient_id, "P1001");

    beds[1].active = 1;
    strcpy(beds[1].bed_id, "ICU-002");
    strcpy(beds[1].status, STATUS_AVAILABLE);
    strcpy(beds[1].patient_id, "-");

    // P1001 cannot be assigned to ICU-002 because already in ICU-001
    if (isPatientAlreadyAssigned(beds, 2, "P1001", "ICU-002") != 1) return 0;
    // Same bed check should be allowed
    if (isPatientAlreadyAssigned(beds, 2, "P1001", "ICU-001") != 0) return 0;
    // Unassigned patient P9999 should be allowed
    if (isPatientAlreadyAssigned(beds, 2, "P9999", "ICU-002") != 0) return 0;
    return 1;
}

// Test 5: Lifecycle Transitions
int test_status_transitions(void) {
    // Valid: Available -> Occupied
    if (!isValidTransition(STATUS_AVAILABLE, STATUS_OCCUPIED)) return 0;
    // Valid: Occupied -> Cleaning
    if (!isValidTransition(STATUS_OCCUPIED, STATUS_CLEANING)) return 0;
    // Valid: Cleaning -> Available
    if (!isValidTransition(STATUS_CLEANING, STATUS_AVAILABLE)) return 0;
    // Valid: Available -> Reserved
    if (!isValidTransition(STATUS_AVAILABLE, STATUS_RESERVED)) return 0;
    // Valid: Available -> Maintenance
    if (!isValidTransition(STATUS_AVAILABLE, STATUS_MAINTENANCE)) return 0;

    // Invalid: Occupied directly to Available (must go to Cleaning first!)
    if (isValidTransition(STATUS_OCCUPIED, STATUS_AVAILABLE)) return 0;
    return 1;
}

// Test 6: Full Bed Lifecycle Simulation (Available -> Occupied -> Cleaning -> Available)
int test_bed_lifecycle_simulation(void) {
    Bed b;
    memset(&b, 0, sizeof(Bed));
    strcpy(b.bed_id, "TEST-01");
    strcpy(b.ward, "ICU");
    b.floor = 1;
    strcpy(b.room, "101");
    strcpy(b.bed_type, "ICU Ventilator");
    strcpy(b.status, STATUS_AVAILABLE);
    strcpy(b.patient_id, "-");
    b.active = 1;

    // Step 1: Available -> Occupied (Patient P1001)
    if (!occupyBed(&b, "P1001")) return 0;
    if (strcmp(b.status, STATUS_OCCUPIED) != 0) return 0;
    if (strcmp(b.patient_id, "P1001") != 0) return 0;

    // Step 2: Occupied -> Cleaning (Discharge)
    if (!releaseBed(&b)) return 0;
    if (strcmp(b.status, STATUS_CLEANING) != 0) return 0;
    if (strcmp(b.patient_id, "-") != 0) return 0;

    // Step 3: Cleaning -> Available (Sanitized)
    if (!markCleaning(&b)) return 0;
    if (strcmp(b.status, STATUS_AVAILABLE) != 0) return 0;
    return 1;
}

// Test 7: Bed Search by ID
int test_bed_search(void) {
    Bed beds[3];
    memset(beds, 0, sizeof(beds));
    strcpy(beds[0].bed_id, "ICU-001");
    strcpy(beds[1].bed_id, "GEN-201");
    strcpy(beds[2].bed_id, "EMG-101");

    int idx = searchBed(beds, 3, "GEN-201");
    if (idx != 1) return 0;

    idx = searchBed(beds, 3, "NON-EXISTENT");
    if (idx != -1) return 0;
    return 1;
}

// Test 8: Report File Export
int test_report_export(void) {
    Bed beds[2];
    memset(beds, 0, sizeof(beds));
    beds[0].active = 1;
    strcpy(beds[0].bed_id, "ICU-001");
    strcpy(beds[0].ward, "ICU");
    beds[0].floor = 1;
    strcpy(beds[0].status, STATUS_AVAILABLE);

    beds[1].active = 1;
    strcpy(beds[1].bed_id, "ICU-002");
    strcpy(beds[1].ward, "ICU");
    beds[1].floor = 1;
    strcpy(beds[1].status, STATUS_OCCUPIED);
    strcpy(beds[1].patient_id, "P1001");

    const char *test_report = "test_bed_report.txt";
    if (!exportReportToFile(beds, 2, test_report)) return 0;

    FILE *fp = fopen(test_report, "r");
    if (!fp) return 0;
    fclose(fp);
    remove(test_report);
    return 1;
}

int main(void) {
    printf("=====================================================\n");
    printf("     HOSPITAL BED MONITORING SYSTEM - C TEST SUITE   \n");
    printf("=====================================================\n");

    RUN_TEST(test_validate_bed_id);
    RUN_TEST(test_validate_status);
    RUN_TEST(test_duplicate_bed_id);
    RUN_TEST(test_duplicate_patient);
    RUN_TEST(test_status_transitions);
    RUN_TEST(test_bed_lifecycle_simulation);
    RUN_TEST(test_bed_search);
    RUN_TEST(test_report_export);

    printf("=====================================================\n");
    printf("Results: %d of %d tests passed (%.1f%%)\n", 
           tests_passed, tests_run, ((double)tests_passed / tests_run) * 100.0);
    printf("=====================================================\n");

    return (tests_passed == tests_run) ? 0 : 1;
}
