/**
 * data.h - Hospital Bed Monitoring System (C Core Module)
 * 
 * Defines the core Bed structure, capacity limits, and status constants.
 */

#ifndef DATA_H
#define DATA_H

#define MAX_BEDS 150
#define MAX_LINE_LEN 256

// Allowed Bed Status Constants
#define STATUS_AVAILABLE   "Available"
#define STATUS_OCCUPIED    "Occupied"
#define STATUS_CLEANING    "Cleaning"
#define STATUS_RESERVED    "Reserved"
#define STATUS_MAINTENANCE "Maintenance"

/**
 * Bed Data Structure representing a single physical hospital bed.
 */
typedef struct {
    char bed_id[20];       // Unique identifier, e.g. "ICU-001"
    char ward[50];         // Department name, e.g. "ICU", "Emergency"
    int floor;             // Floor number (1 to 10)
    char room[20];         // Room or bay number, e.g. "101", "Bay 1"
    char bed_type[30];     // Type, e.g. "ICU Ventilator", "Standard Care"
    char status[20];       // Current status: Available, Occupied, Cleaning, Reserved, Maintenance
    char patient_id[30];   // Patient ID if assigned, or "-" if vacant
    int active;            // 1 for operational bed, 0 for decommissioned
} Bed;

#endif // DATA_H
