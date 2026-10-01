/**
 * Wards.gs - Hospital Bed Monitoring System
 * 
 * Manages clinical ward directories and capacity information.
 */

/**
 * Retrieves all hospital wards.
 */
function getWards() {
  var sheet = getSheet(CONFIG.SHEETS.WARDS);
  var wards = sheetToObjects(sheet);

  var formatted = wards.map(function(w) {
    return {
      ward_id: w.ward_id,
      ward_name: w.ward_name,
      floor: w.floor,
      total_beds: parseInt(w.total_beds, 10) || 0,
      active: (w.active === true || w.active === 'TRUE' || w.active === 'true')
    };
  });

  return {
    success: true,
    data: formatted,
    count: formatted.length
  };
}

/**
 * Creates a new ward.
 * Validates unique ward_id and required fields.
 * 
 * Payload:
 * {
 *   ward_id: 'W006',
 *   ward_name: 'Maternity Ward',
 *   floor: '4',
 *   total_beds: 10,
 *   user_id: 'U001',
 *   updated_by: 'Admin'
 * }
 */
function createWard(payload) {
  if (!payload || !payload.ward_id) {
    return { success: false, message: 'Missing required field: ward_id' };
  }
  if (!payload.ward_name || !payload.floor) {
    return { success: false, message: 'Missing required fields: ward_name, floor' };
  }

  var sheet = getSheet(CONFIG.SHEETS.WARDS);
  var wards = sheetToObjects(sheet);

  var exists = wards.some(function(w) {
    return w.ward_id && w.ward_id.toString().toLowerCase() === payload.ward_id.toString().toLowerCase();
  });

  if (exists) {
    return { success: false, message: 'Ward ID ' + payload.ward_id + ' already exists' };
  }

  var newRow = [
    payload.ward_id,
    payload.ward_name,
    payload.floor,
    payload.total_beds || 0,
    'TRUE'
  ];

  sheet.appendRow(newRow);

  logActivity(
    payload.user_id || 'U001',
    payload.updated_by || 'Admin',
    'WARD_CREATE',
    '-',
    '-',
    '-',
    'Created new ward ' + payload.ward_name + ' (' + payload.ward_id + ') on floor ' + payload.floor
  );

  return {
    success: true,
    message: 'Ward ' + payload.ward_name + ' created successfully'
  };
}
