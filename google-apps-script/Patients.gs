/**
 * Patients.gs - Hospital Bed Monitoring System
 * 
 * Manages patient listings, bed assignments, and discharge transitions.
 * Enforces:
 *  - A patient cannot occupy multiple beds simultaneously.
 *  - A bed cannot have multiple patients assigned simultaneously.
 */

/**
 * Retrieves all patient records from Patients sheet.
 */
function getPatients() {
  var sheet = getSheet(CONFIG.SHEETS.PATIENTS);
  var patients = sheetToObjects(sheet);

  return {
    success: true,
    data: patients,
    count: patients.length
  };
}

/**
 * Assigns a patient to an available bed.
 * 
 * Server-side checks:
 * 1. Bed must exist, be active, and not already Occupied/Maintenance.
 * 2. Patient cannot already be assigned to another active bed.
 * 3. Updates both Beds and Patients sheets.
 * 4. Records event in ActivityLog.
 * 
 * Payload:
 * {
 *   patient_id: 'P1001',
 *   bed_id: 'ICU-001',
 *   patient_name: 'Robert Vance', // optional
 *   user_id: 'U002',
 *   updated_by: 'Nurse Jhanvi',
 *   admission_date: '2026-10-01',
 *   details: 'Admitted from triage'
 * }
 */
function assignPatient(payload) {
  if (!payload || !payload.patient_id) {
    return { success: false, message: 'Missing required field: patient_id' };
  }
  if (!payload.bed_id) {
    return { success: false, message: 'Missing required field: bed_id' };
  }

  var bedsSheet = getSheet(CONFIG.SHEETS.BEDS);
  var beds = sheetToObjects(bedsSheet);

  // 1. Find target bed
  var targetBed = null;
  for (var b = 0; b < beds.length; b++) {
    if (beds[b].bed_id && beds[b].bed_id.toString().trim() === payload.bed_id.toString().trim()) {
      targetBed = beds[b];
      break;
    }
  }

  if (!targetBed) {
    return { success: false, message: 'Bed ' + payload.bed_id + ' does not exist' };
  }

  var isBedActive = (targetBed.active === true || targetBed.active === 'TRUE' || targetBed.active === 'true');
  if (!isBedActive) {
    return { success: false, message: 'Bed ' + payload.bed_id + ' is decommissioned / inactive' };
  }

  if (targetBed.status === 'Occupied') {
    return { 
      success: false, 
      message: 'Bed ' + payload.bed_id + ' is already occupied by patient ' + (targetBed.patient_id || 'another patient')
    };
  }
  if (targetBed.status === 'Maintenance') {
    return { success: false, message: 'Bed ' + payload.bed_id + ' is under maintenance and cannot receive patients' };
  }

  // 2. Check if patient is already assigned to ANY other bed
  var patientsSheet = getSheet(CONFIG.SHEETS.PATIENTS);
  var patients = sheetToObjects(patientsSheet);

  var existingPatientRow = null;
  for (var p = 0; p < patients.length; p++) {
    var pat = patients[p];
    if (pat.patient_id && pat.patient_id.toString().trim() === payload.patient_id.toString().trim()) {
      if (pat.status === 'Admitted' && pat.bed_id && pat.bed_id !== '-' && pat.bed_id !== payload.bed_id) {
        return {
          success: false,
          message: 'Duplicate patient assignment: Patient ' + payload.patient_id + ' is already assigned to bed ' + pat.bed_id
        };
      }
      existingPatientRow = pat;
    }
  }

  var timestamp = formatTimestamp(new Date());
  var todayDate = formatDate(new Date());
  var updatedBy = payload.updated_by || 'Staff';
  var userId = payload.user_id || 'U001';

  // 3. Update the Beds sheet
  var bedRowIndex = targetBed._rowIndex;
  var bedHeaders = bedsSheet.getDataRange().getValues()[0];
  var statusCol = bedHeaders.indexOf('status') + 1;
  var patientCol = bedHeaders.indexOf('patient_id') + 1;
  var lastUpdatedCol = bedHeaders.indexOf('last_updated') + 1;
  var updatedByCol = bedHeaders.indexOf('updated_by') + 1;

  bedsSheet.getRange(bedRowIndex, statusCol).setValue('Occupied');
  bedsSheet.getRange(bedRowIndex, patientCol).setValue(payload.patient_id);
  bedsSheet.getRange(bedRowIndex, lastUpdatedCol).setValue(timestamp);
  bedsSheet.getRange(bedRowIndex, updatedByCol).setValue(updatedBy);

  // 4. Update or append to Patients sheet
  if (existingPatientRow) {
    var patRowIndex = existingPatientRow._rowIndex;
    var patHeaders = patientsSheet.getDataRange().getValues()[0];
    var patBedCol = patHeaders.indexOf('bed_id') + 1;
    var patStatusCol = patHeaders.indexOf('status') + 1;
    var patAdminDateCol = patHeaders.indexOf('admission_date') + 1;

    patientsSheet.getRange(patRowIndex, patBedCol).setValue(payload.bed_id);
    patientsSheet.getRange(patRowIndex, patStatusCol).setValue('Admitted');
    if (payload.admission_date) {
      patientsSheet.getRange(patRowIndex, patAdminDateCol).setValue(payload.admission_date);
    }
  } else {
    // New patient intake record
    patientsSheet.appendRow([
      payload.patient_id,
      payload.bed_id,
      payload.admission_date || todayDate,
      '-',
      'Admitted'
    ]);
  }

  // 5. Activity log
  var oldStatus = targetBed.status;
  var details = payload.details || ('Assigned patient ' + payload.patient_id + ' to bed ' + payload.bed_id);
  logActivity(userId, updatedBy, 'PATIENT_ASSIGN', payload.bed_id, oldStatus, 'Occupied', details);

  return {
    success: true,
    message: 'Patient ' + payload.patient_id + ' successfully assigned to ' + payload.bed_id
  };
}

/**
 * Discharges a patient from a bed and queues bed for sanitization (Cleaning).
 * 
 * Payload:
 * {
 *   bed_id: 'ICU-001',
 *   patient_id: 'P1001', // optional if bed_id provided
 *   target_bed_status: 'Cleaning', // defaults to Cleaning
 *   user_id: 'U002',
 *   updated_by: 'Nurse Jhanvi',
 *   details: 'Post-op recovery complete'
 * }
 */
function dischargePatient(payload) {
  if (!payload || (!payload.bed_id && !payload.patient_id)) {
    return { success: false, message: 'Missing bed_id or patient_id for discharge' };
  }

  var bedsSheet = getSheet(CONFIG.SHEETS.BEDS);
  var beds = sheetToObjects(bedsSheet);

  var targetBed = null;
  for (var b = 0; b < beds.length; b++) {
    if (payload.bed_id && beds[b].bed_id === payload.bed_id) {
      targetBed = beds[b];
      break;
    }
    if (payload.patient_id && beds[b].patient_id === payload.patient_id) {
      targetBed = beds[b];
      break;
    }
  }

  if (!targetBed) {
    return { success: false, message: 'Specified bed or patient was not found' };
  }

  var dischargedPatientId = payload.patient_id || targetBed.patient_id;
  var nextStatus = payload.target_bed_status || 'Cleaning';
  var timestamp = formatTimestamp(new Date());
  var todayDate = formatDate(new Date());
  var updatedBy = payload.updated_by || 'Staff';
  var userId = payload.user_id || 'U001';

  // 1. Update Beds sheet
  var bedRowIndex = targetBed._rowIndex;
  var bedHeaders = bedsSheet.getDataRange().getValues()[0];
  var statusCol = bedHeaders.indexOf('status') + 1;
  var patientCol = bedHeaders.indexOf('patient_id') + 1;
  var lastUpdatedCol = bedHeaders.indexOf('last_updated') + 1;
  var updatedByCol = bedHeaders.indexOf('updated_by') + 1;

  bedsSheet.getRange(bedRowIndex, statusCol).setValue(nextStatus);
  bedsSheet.getRange(bedRowIndex, patientCol).setValue('-');
  bedsSheet.getRange(bedRowIndex, lastUpdatedCol).setValue(timestamp);
  bedsSheet.getRange(bedRowIndex, updatedByCol).setValue(updatedBy);

  // 2. Update Patients sheet
  var patientsSheet = getSheet(CONFIG.SHEETS.PATIENTS);
  var patients = sheetToObjects(patientsSheet);

  for (var p = 0; p < patients.length; p++) {
    if (patients[p].patient_id === dischargedPatientId && patients[p].status === 'Admitted') {
      var patRowIndex = patients[p]._rowIndex;
      var patHeaders = patientsSheet.getDataRange().getValues()[0];
      var patBedCol = patHeaders.indexOf('bed_id') + 1;
      var patStatusCol = patHeaders.indexOf('status') + 1;
      var patDischargeCol = patHeaders.indexOf('discharge_date') + 1;

      patientsSheet.getRange(patRowIndex, patBedCol).setValue('-');
      patientsSheet.getRange(patRowIndex, patStatusCol).setValue('Discharged');
      patientsSheet.getRange(patRowIndex, patDischargeCol).setValue(todayDate);
      break;
    }
  }

  // 3. Log Activity
  var details = payload.details || ('Patient ' + (dischargedPatientId || 'unknown') + ' discharged; bed placed in ' + nextStatus);
  logActivity(userId, updatedBy, 'PATIENT_DISCHARGE', targetBed.bed_id, 'Occupied', nextStatus, details);

  return {
    success: true,
    message: 'Patient discharged successfully. Bed ' + targetBed.bed_id + ' marked as ' + nextStatus
  };
}
