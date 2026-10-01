/**
 * ActivityLog.gs - Hospital Bed Monitoring System
 * 
 * Handles appending audit logs and retrieving historical activity.
 * All bed-status changes MUST record an entry through logActivity().
 */

/**
 * Retrieves all activity log entries, ordered newest to oldest.
 */
function getActivityLogs() {
  var sheet = getSheet(CONFIG.SHEETS.ACTIVITY_LOG);
  var logs = sheetToObjects(sheet);

  // Return in reverse chronological order (newest first)
  logs.reverse();

  return {
    success: true,
    data: logs,
    count: logs.length
  };
}

/**
 * Appends a new activity log entry to the ActivityLog sheet.
 * 
 * @param {string} userId - User ID who triggered the action
 * @param {string} userName - Full name of the user
 * @param {string} action - Action identifier (e.g. STATUS_CHANGE, PATIENT_ASSIGN, DISCHARGE, BED_CREATE)
 * @param {string} bedId - Target bed code (e.g. ICU-001)
 * @param {string} oldStatus - Previous status
 * @param {string} newStatus - New status
 * @param {string} details - Clinical notes or transfer context
 */
function logActivity(userId, userName, action, bedId, oldStatus, newStatus, details) {
  var sheet = getSheet(CONFIG.SHEETS.ACTIVITY_LOG);
  var timestamp = formatTimestamp(new Date());

  var newRow = [
    timestamp,
    userId || 'U001',
    userName || 'Staff',
    action || 'STATUS_CHANGE',
    bedId || '-',
    oldStatus || '-',
    newStatus || '-',
    details || ''
  ];

  sheet.appendRow(newRow);
  return {
    success: true,
    timestamp: timestamp
  };
}
