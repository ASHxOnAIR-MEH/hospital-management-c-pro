/**
 * report.c - Hospital Bed Monitoring System (C Core Module)
 * 
 * Implements report calculation, ward summaries, floor summaries,
 * occupancy percentage, and file export to bed_report.txt.
 */

#include <stdio.h>
#include <string.h>
#include <time.h>
#include "report.h"

// Ward statistics accumulator structure
typedef struct {
    char name[50];
    int total;
    int available;
    int occupied;
    int cleaning;
    int reserved;
    int maintenance;
} WardStat;

// Floor statistics accumulator structure
typedef struct {
    int floor;
    int total;
    int available;
    int occupied;
    int cleaning;
    int reserved;
    int maintenance;
} FloorStat;

void writeReportStream(const Bed beds[], int count, FILE *out) {
    if (out == NULL) return;

    int total_active = 0;
    int total_inactive = 0;
    int available = 0;
    int occupied = 0;
    int cleaning = 0;
    int reserved = 0;
    int maintenance = 0;

    WardStat wards[20];
    int ward_count = 0;
    memset(wards, 0, sizeof(wards));

    FloorStat floors[20];
    int floor_count = 0;
    memset(floors, 0, sizeof(floors));

    for (int i = 0; i < count; i++) {
        if (!beds[i].active) {
            total_inactive++;
            continue;
        }

        total_active++;

        // Global status tally
        if (strcmp(beds[i].status, STATUS_AVAILABLE) == 0) available++;
        else if (strcmp(beds[i].status, STATUS_OCCUPIED) == 0) occupied++;
        else if (strcmp(beds[i].status, STATUS_CLEANING) == 0) cleaning++;
        else if (strcmp(beds[i].status, STATUS_RESERVED) == 0) reserved++;
        else if (strcmp(beds[i].status, STATUS_MAINTENANCE) == 0) maintenance++;

        // Ward aggregation
        int w_idx = -1;
        for (int w = 0; w < ward_count; w++) {
            if (strcmp(wards[w].name, beds[i].ward) == 0) {
                w_idx = w;
                break;
            }
        }
        if (w_idx == -1 && ward_count < 20) {
            w_idx = ward_count++;
            strncpy(wards[w_idx].name, beds[i].ward, sizeof(wards[w_idx].name) - 1);
        }

        if (w_idx >= 0) {
            wards[w_idx].total++;
            if (strcmp(beds[i].status, STATUS_AVAILABLE) == 0) wards[w_idx].available++;
            else if (strcmp(beds[i].status, STATUS_OCCUPIED) == 0) wards[w_idx].occupied++;
            else if (strcmp(beds[i].status, STATUS_CLEANING) == 0) wards[w_idx].cleaning++;
            else if (strcmp(beds[i].status, STATUS_RESERVED) == 0) wards[w_idx].reserved++;
            else if (strcmp(beds[i].status, STATUS_MAINTENANCE) == 0) wards[w_idx].maintenance++;
        }

        // Floor aggregation
        int f_idx = -1;
        for (int f = 0; f < floor_count; f++) {
            if (floors[f].floor == beds[i].floor) {
                f_idx = f;
                break;
            }
        }
        if (f_idx == -1 && floor_count < 20) {
            f_idx = floor_count++;
            floors[f_idx].floor = beds[i].floor;
        }

        if (f_idx >= 0) {
            floors[f_idx].total++;
            if (strcmp(beds[i].status, STATUS_AVAILABLE) == 0) floors[f_idx].available++;
            else if (strcmp(beds[i].status, STATUS_OCCUPIED) == 0) floors[f_idx].occupied++;
            else if (strcmp(beds[i].status, STATUS_CLEANING) == 0) floors[f_idx].cleaning++;
            else if (strcmp(beds[i].status, STATUS_RESERVED) == 0) floors[f_idx].reserved++;
            else if (strcmp(beds[i].status, STATUS_MAINTENANCE) == 0) floors[f_idx].maintenance++;
        }
    }

    double occupancy_rate = (total_active > 0) ? ((double)occupied / total_active) * 100.0 : 0.0;

    // Header & Summary
    fprintf(out, "====================================================\n");
    fprintf(out, "                HOSPITAL BED REPORT                 \n");
    fprintf(out, "====================================================\n");
    fprintf(out, "Total Beds      : %d\n", total_active);
    fprintf(out, "Available       : %d\n", available);
    fprintf(out, "Occupied        : %d\n", occupied);
    fprintf(out, "Cleaning        : %d\n", cleaning);
    fprintf(out, "Reserved        : %d\n", reserved);
    fprintf(out, "Maintenance     : %d\n", maintenance);
    if (total_inactive > 0) {
        fprintf(out, "Decommissioned  : %d\n", total_inactive);
    }
    fprintf(out, "\nOccupancy Rate  : %.1f%%\n", occupancy_rate);
    fprintf(out, "----------------------------------------------------\n\n");

    // Ward Summary
    fprintf(out, "WARD SUMMARY\n");
    fprintf(out, "----------------------------------------------------\n");
    for (int w = 0; w < ward_count; w++) {
        double ward_occ = (wards[w].total > 0) ? ((double)wards[w].occupied / wards[w].total) * 100.0 : 0.0;
        fprintf(out, "%s\n", wards[w].name);
        fprintf(out, "Total           : %d\n", wards[w].total);
        fprintf(out, "Available       : %d\n", wards[w].available);
        fprintf(out, "Occupied        : %d\n", wards[w].occupied);
        fprintf(out, "Cleaning        : %d\n", wards[w].cleaning);
        if (wards[w].reserved > 0) {
            fprintf(out, "Reserved        : %d\n", wards[w].reserved);
        }
        if (wards[w].maintenance > 0) {
            fprintf(out, "Maintenance     : %d\n", wards[w].maintenance);
        }
        fprintf(out, "Occupancy       : %.1f%%\n\n", ward_occ);
    }

    // Floor Summary
    fprintf(out, "FLOOR SUMMARY\n");
    fprintf(out, "----------------------------------------------------\n");
    for (int f = 0; f < floor_count; f++) {
        double floor_occ = (floors[f].total > 0) ? ((double)floors[f].occupied / floors[f].total) * 100.0 : 0.0;
        fprintf(out, "Floor %d -> Total: %2d | Avail: %2d | Occ: %2d | Clean: %2d | Rate: %4.1f%%\n",
                floors[f].floor,
                floors[f].total,
                floors[f].available,
                floors[f].occupied,
                floors[f].cleaning,
                floor_occ);
    }
    fprintf(out, "====================================================\n");
}

void generateReport(const Bed beds[], int count) {
    printf("\n");
    writeReportStream(beds, count, stdout);
}

int exportReportToFile(const Bed beds[], int count, const char *filename) {
    if (filename == NULL || strlen(filename) == 0) {
        filename = DEFAULT_REPORT_FILE;
    }

    FILE *fp = fopen(filename, "w");
    if (fp == NULL) {
        printf("ERROR: Unable to create report file '%s'.\n", filename);
        return 0;
    }

    writeReportStream(beds, count, fp);
    fclose(fp);

    printf("SUCCESS: Hospital bed report successfully exported to '%s'.\n", filename);
    return 1;
}
