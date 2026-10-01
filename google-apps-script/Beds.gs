/**
 * Beds.gs - Hospital Bed Monitoring System
 * 
 * Manages bed inventory retrieval, status updates, creation, and deactivation.
 * Server-side validations strictly enforced.
 */

/**
 * Returns all active beds from the Beds sheet.
 */
function getBeds() {
  var sheet = getSheet(CONFIG.SHEETS.BEDS);
  var beds = sheetToObjects(sheet);

  // Return beds with normalized boolean active field
  var formatted = beds.map(function(b) {
    return {
      bed_id: b.bed_id,
      ward_id: b.ward_id,
      ward_name: b.ward_name,
      floor: b.floor,
      room: b.room,
      bed_type: b.bed_type,
      status: b.status,
      patient_id: b.patient_id === '-' ? null : b.patient_id,
      last_updated: b.last_updated,
      updated_by: b.updated_by,
      active: (b.active === true || b.active === 'TRUE' || b.active === 'true')
    };
  });

  return {
    success: true,
    data: formatted,
    count: formatted.length
  };
}

/**
 * Updates an existing bed's status, patient association, and metadata.
 * Logs transition to ActivityLog.
 * 
 * Payload:
 * {
 *   bed_id: 'ICU-001',
 *   status: 'Occupied',
 *   patient_id: 'P1001', // optional or '-'
 *   updated_by: 'Nurse Jhanvi',
 *   user_id: 'U002',
 *   details: 'Admitted from triage'
 * }
 */
function updateBed(payload) {
  if (!payload || !payload.bed_id) {
    return { success: false, message: 'Missing required field: bed_id' };
  }
  if (!payload.status) {
    return { success: false, message: 'Missing required field: status' };
  }

  // Validate status
  if (CONFIG.ALLOWED_STATUSES.indexOf(payload.status) === -1) {
    return { 
      success: false, 
      message: 'Invalid status "' + payload.status + '". Allowed values: ' + CONFIG.ALLOWED_STATUSES.join(', ')
    };
  }

  var sheet = getSheet(CONFIG.SHEETS.BEDS);
  var data = sheet.getDataRange().getValues();
  if (data.length <= 1) {
    return { success: false, message: 'Bed database is empty' };
  }

  var headers = data[0];
  var bedIdCol = headers.indexOf('bed_id');
  var statusCol = headers.indexOf('status');
  var patientIdCol = headers.indexOf('patient_id');
  var lastUpdatedCol = headers.indexOf('last_updated');
  var updatedByCol = headers.indexOf('updated_by');
  var activeCol = headers.indexOf('active');

  if (bedIdCol === -1 || statusCol === -1) {
    return { success: false, message: 'Invalid column layout in Beds sheet' };
  }

  var targetRowIndex = -1;
  var oldBedRecord = null;

  for (var r = 1; r < data.length; r++) {
    if (data[r][bedIdCol] && data[r][bedIdCol].toString().trim() === payload.bed_id.toString().trim()) {
      targetRowIndex = r + 1; // 1-indexed for SpreadsheetApp
      oldBedRecord = {
        bed_id: data[r][bedIdCol],
        status: data[r][statusCol],
        patient_id: data[r][patientIdCol],
        active: data[r][activeCol]
      };
      break;
    }
  }

  // Validate bed existence
  if (targetRowIndex === -1 || !oldBedRecord) {
    return { success: false, message: 'Bed ' + payload.bed_id + ' does not exist' };
  }

  // Validate active status
  var isActive = (oldBedRecord.active === true || oldBedRecord.active === 'TRUE' || oldBedRecord.active === 'true');
  if (!isActive) {
    return { success: false, message: 'Bed ' + payload.bed_id + ' is inactive and cannot be updated' };
  }

  var oldStatus = oldBedRecord.status;
  var newStatus = payload.status;
  var timestamp = formatTimestamp(new Date());
  var updatedBy = payload.updated_by || 'Staff';
  var userId = payload.user_id || 'U001';
  var newPatientId = payload.patient_id !== undefined ? (payload.patient_id || '-') : oldBedRecord.patient_id;

  // Clear patient if status became Available or Cleaning
  if (newStatus === 'Available' || newStatus === 'Cleaning') {
    newPatientId = '-';
  }

  // Write updates to sheet
  sheet.getRange(targetRowIndex, statusCol + 1).setValue(newStatus);
  if (patientIdCol !== -1) {
    sheet.getRange(targetRowIndex, patientIdCol + 1).setValue(newPatientId);
  }
  if (lastUpdatedCol !== -1) {
    sheet.getRange(targetRowIndex, lastUpdatedCol + 1).setValue(timestamp);
  }
  if (updatedByCol !== -1) {
    sheet.getRange(targetRowIndex, updatedByCol + 1).setValue(updatedBy);
  }

  // Log in ActivityLog
  var details = payload.details || ('Status changed from ' + oldStatus + ' to ' + newStatus);
  logActivity(userId, updatedBy, 'STATUS_CHANGE', payload.bed_id, oldStatus, newStatus, details);

  return {
    success: true,
    message: 'Bed ' + payload.bed_id + ' updated successfully',
    data: {
      bed_id: payload.bed_id,
      old_status: oldStatus,
      status: newStatus,
      patient_id: newPatientId === '-' ? null : newPatientId,
      last_updated: timestamp,
      updated_by: updatedBy
    }
  };
}

/**
 * Creates a new bed in the Beds sheet.
 * Validates unique bed_id and required fields.
 */
function createBed(payload) {
  if (!payload || !payload.bed_id) {
    return { success: false, message: 'Missing required field: bed_id' };
  }
  if (!payload.ward_id || !payload.ward_name || !payload.floor || !payload.room) {
    return { success: false, message: 'Missing required location fields (ward_id, ward_name, floor, room)' };
  }

  var sheet = getSheet(CONFIG.SHEETS.BEDS);
  var beds = sheetToObjects(sheet);

  // Check duplicate bed ID
  var exists = beds.some(function(b) {
    return b.bed_id && b.bed_id.toString().toLowerCase() === payload.bed_id.toString().toLowerCase();
  });

  if (exists) {
    return { success: false, message: 'Bed ID ' + payload.bed_id + ' already exists' };
  }

  var status = payload.status || 'Available';
  if (CONFIG.ALLOWED_STATUSES.indexOf(status) === -1) {
    status = 'Available';
  }

  var timestamp = formatTimestamp(new Date());
  var updatedBy = payload.updated_by || 'Admin';

  var newRow = [
    payload.bed_id,
    payload.ward_id,
    payload.ward_name,
    payload.floor,
    payload.room,
    payload.bed_type || 'Standard Care',
    status,
    payload.patient_id || '-',
    timestamp,
    updatedBy,
    'TRUE'
  ];

  sheet.appendRow(newRow);

  logActivity(payload.user_id || 'U001', updatedBy, 'BED_CREATE', payload.bed_id, '-', status, 'New bed added to ward ' + payload.ward_name);

  return {
    success: true,
    message: 'Bed ' + payload.bed_id + ' created successfully'
  };
}

/**
 * Deactivates an existing bed (soft delete).
 */
function deactivateBed(payload) {
  if (!payload || !payload.bed_id) {
    return { success: false, message: 'Missing required field: bed_id' };
  }

  var sheet = getSheet(CONFIG.SHEETS.BEDS);
  var data = sheet.getDataRange().getValues();
  var headers = data[0];
  var bedIdCol = headers.indexOf('bed_id');
  var activeCol = headers.indexOf('active');
  var statusCol = headers.indexOf('status');

  var targetRow = -1;
  for (var r = 1; r < data.length; r++) {
    if (data[r][bedIdCol] && data[r][bedIdCol].toString() === payload.bed_id.toString()) {
      targetRow = r + 1;
      break;
    }
  }

  if (targetRow === -1) {
    return { success: false, message: 'Bed ' + payload.bed_id + ' does not exist' };
  }

  sheet.getRange(targetRow, activeCol + 1).setValue('FALSE');
  var currentStatus = data[targetRow - 1][statusCol];

  logActivity(payload.user_id || 'U001', payload.updated_by || 'Admin', 'BED_DEACTIVATE', payload.bed_id, currentStatus, 'Maintenance', 'Bed decommissioned/deactivated');

  return {
    success: true,
    message: 'Bed ' + payload.bed_id + ' deactivated successfully'
  };
}
