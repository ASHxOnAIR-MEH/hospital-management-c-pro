/**
 * filter.h - Hospital Bed Monitoring System (C Core Module)
 * 
 * Header for bed search and filtering operations by ward, floor,
 * status, bed ID, and patient assignment.
 */

#ifndef FILTER_H
#define FILTER_H

#include "data.h"

/**
 * Filters and prints beds belonging to a specific ward (case-insensitive substring match).
 * Displays concise "<bed_id> <status>" format as well as detailed table.
 */
void filterByWard(const Bed beds[], int count, const char *ward);

/**
 * Filters and prints beds located on a specific floor.
 */
void filterByFloor(const Bed beds[], int count, int floor);

/**
 * Filters and prints beds having a specific status (Available, Occupied, Cleaning, etc.).
 */
void filterByStatus(const Bed beds[], int count, const char *status);

/**
 * Searches for a specific bed by Bed ID.
 * Returns the index of the bed if found, or -1 if not found.
 */
int searchBed(const Bed beds[], int count, const char *bed_id);

/**
 * Searches for which bed a patient is currently assigned to.
 * Returns the index of the bed if found, or -1 if not found.
 */
int searchPatient(const Bed beds[], int count, const char *patient_id);

#endif // FILTER_H
