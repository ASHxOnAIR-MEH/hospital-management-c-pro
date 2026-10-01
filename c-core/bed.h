/**
 * bed.h - Hospital Bed Monitoring System (C Core Module)
 * 
 * Header for bed management operations, status transitions, and persistence.
 */

#ifndef BED_H
#define BED_H

#include "data.h"

/**
 * Updates a bed's status to new_status with validation of transition rules.
 * Prints:
 *   Bed <bed_id>:
 *   <old_status> -> <new_status>
 * 
 * Returns 1 on success, 0 on validation error.
 */
int updateBedStatus(Bed *bed, const char *new_status, const char *patient_id);

/**
 * Transitions bed to Occupied with patient assignment.
 * Available -> Occupied or Reserved -> Occupied
 */
int occupyBed(Bed *bed, const char *patient_id);

/**
 * Releases an occupied bed. Discharge moves it to Cleaning status.
 * Occupied -> Cleaning
 */
int releaseBed(Bed *bed);

/**
 * Completes sanitization, making the bed ready for intake.
 * Cleaning -> Available
 */
int markCleaning(Bed *bed);

/**
 * Puts bed on medical reservation for incoming patient.
 * Available -> Reserved
 */
int reserveBed(Bed *bed, const char *patient_id);

/**
 * Marks bed out of order for engineering maintenance.
 * Available/Cleaning -> Maintenance
 */
int markMaintenance(Bed *bed);

/**
 * Adds a new bed to the collection after validating uniqueness and fields.
 * Returns 1 on success, 0 on failure.
 */
int addBed(Bed beds[], int *count, const Bed *new_bed);

/**
 * Prints table header for bed listings.
 */
void printBedHeader(void);

/**
 * Prints a single bed's details in tabular format.
 */
void printBed(const Bed *bed);

/**
 * Displays all active beds in the hospital.
 */
void displayAllBeds(const Bed beds[], int count);

/**
 * Loads bed records from a CSV file into the beds array.
 * Demonstrates fopen(), fgets(), fclose().
 * Returns number of beds loaded, or -1 on file error.
 */
int loadBeds(Bed beds[], int *count, const char *filename);

/**
 * Saves current bed records to a CSV file.
 * Demonstrates fopen(), fprintf(), fclose().
 * Returns 1 on success, 0 on error.
 */
int saveBeds(const Bed beds[], int count, const char *filename);

/**
 * Populates sample clinical beds covering ICU, General Ward, Emergency,
 * Pediatric, and Private Ward if file is absent or on initialization.
 */
void initSampleBeds(Bed beds[], int *count);

#endif // BED_H
