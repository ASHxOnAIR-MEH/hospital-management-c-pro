/**
 * validation.h - Hospital Bed Monitoring System (C Core Module)
 * 
 * Header for data validation functions enforcing clinical integrity rules.
 */

#ifndef VALIDATION_H
#define VALIDATION_H

#include "data.h"

/**
 * Validates bed ID format.
 * Returns 1 if valid, 0 if invalid.
 */
int validateBedID(const char *bed_id);

/**
 * Validates bed status string against allowed statuses:
 * Available, Occupied, Cleaning, Reserved, Maintenance.
 * Returns 1 if valid, 0 if invalid.
 */
int validateStatus(const char *status);

/**
 * Validates patient ID format.
 * Returns 1 if valid, 0 if invalid.
 */
int validatePatientID(const char *patient_id);

/**
 * Validates floor number (must be > 0 and <= 20).
 * Returns 1 if valid, 0 if invalid.
 */
int validateFloor(int floor);

/**
 * Validates room identifier (cannot be empty).
 * Returns 1 if valid, 0 if invalid.
 */
int validateRoom(const char *room);

/**
 * Validates an entire Bed struct before insertion or save.
 * Prints descriptive error messages for any validation failure.
 * Returns 1 if fully valid, 0 otherwise.
 */
int validateBed(const Bed *bed);

/**
 * Checks if a bed_id already exists in the beds array.
 * Returns 1 if duplicate found, 0 if unique.
 */
int isDuplicateBedID(const Bed beds[], int count, const char *bed_id);

/**
 * Checks if a patient is already assigned to another active bed in the hospital.
 * Enforces the rule: A patient cannot occupy multiple beds simultaneously.
 * Returns 1 if patient is already assigned elsewhere, 0 otherwise.
 */
int isPatientAlreadyAssigned(const Bed beds[], int count, const char *patient_id, const char *current_bed_id);

/**
 * Checks whether a proposed status transition is logically valid in a hospital.
 * Returns 1 if valid transition, 0 if invalid.
 */
int isValidTransition(const char *current_status, const char *new_status);

#endif // VALIDATION_H
