/**
 * Config.gs - Hospital Bed Monitoring System
 * 
 * Central configuration, schema constants, and helper utilities
 * for Google Sheets database integration.
 */

var CONFIG = {
  // Exact Sheet Names in Google Spreadsheet
  SHEETS: {
    BEDS: 'Beds',
    WARDS: 'Wards',
    PATIENTS: 'Patients',
    USERS: 'Users',
    ACTIVITY_LOG: 'ActivityLog',
    SETTINGS: 'Settings'
  },

  // Allowed bed status values
  ALLOWED_STATUSES: [
    'Available',
    'Occupied',
    'Cleaning',
    'Reserved',
    'Maintenance'
  ],

  // Allowed patient status values
  PATIENT_STATUSES: [
    'Admitted',
    'Reserved',
    'Awaiting Bed',
    'Discharged'
  ],

  // Allowed user roles
  USER_ROLES: [
    'Admin',
    'Receptionist',
    'Nurse',
    'Viewer'
  ],

  // Default timezone
  TIMEZONE: 'Asia/Kolkata',

  // Date format string
  DATE_FORMAT: 'yyyy-MM-dd HH:mm:ss'
};

/**
 * Returns the active spreadsheet reference.
 */
function getSpreadsheet() {
  return SpreadsheetApp.getActiveSpreadsheet();
}

/**
 * Returns a specific sheet by its configured name.
 * Throws an error if the sheet does not exist.
 */
function getSheet(sheetName) {
  var ss = getSpreadsheet();
  var sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    throw new Error('Required sheet "' + sheetName + '" was not found in spreadsheet.');
  }
  return sheet;
}

/**
 * Formats a Date object or current date to consistent string: YYYY-MM-DD HH:mm:ss
 */
function formatTimestamp(dateObj) {
  var d = dateObj || new Date();
  return Utilities.formatDate(d, CONFIG.TIMEZONE, CONFIG.DATE_FORMAT);
}

/**
 * Formats a Date object to YYYY-MM-DD
 */
function formatDate(dateObj) {
  var d = dateObj || new Date();
  return Utilities.formatDate(d, CONFIG.TIMEZONE, 'yyyy-MM-dd');
}

/**
 * Reads all rows from a sheet as an array of JavaScript objects
 * mapped by header column names in row 1.
 */
function sheetToObjects(sheet) {
  var data = sheet.getDataRange().getValues();
  if (data.length <= 1) return [];

  var headers = data[0];
  var rows = [];

  for (var i = 1; i < data.length; i++) {
    var row = data[i];
    // Skip completely empty rows
    var hasContent = row.some(function(cell) { return cell !== '' && cell !== null; });
    if (!hasContent) continue;

    var obj = { _rowIndex: i + 1 }; // 1-based index in sheet
    for (var h = 0; h < headers.length; h++) {
      var headerName = headers[h].toString().trim();
      obj[headerName] = row[h];
    }
    rows.push(obj);
  }

  return rows;
}
