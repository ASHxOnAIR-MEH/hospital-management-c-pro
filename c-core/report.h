/**
 * report.h - Hospital Bed Monitoring System (C Core Module)
 * 
 * Header for analytics, occupancy calculations, ward-wise summaries,
 * and report file generation (bed_report.txt).
 */

#ifndef REPORT_H
#define REPORT_H

#include <stdio.h>
#include "data.h"

#define DEFAULT_REPORT_FILE "bed_report.txt"

/**
 * Formats and writes the full clinical bed utilization report to any output stream (stdout or FILE*).
 */
void writeReportStream(const Bed beds[], int count, FILE *out);

/**
 * Generates and displays the complete hospital bed utilization report on the console.
 */
void generateReport(const Bed beds[], int count);

/**
 * Generates and exports the report to a specified text file (default: bed_report.txt).
 * Demonstrates fopen(), fprintf(), fclose().
 * Returns 1 on success, 0 on failure.
 */
int exportReportToFile(const Bed beds[], int count, const char *filename);

#endif // REPORT_H
