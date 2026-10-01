import fs from 'fs';
import path from 'path';

const CSV_DIR = path.resolve(process.cwd(), 'sheets-database', 'csv');

const ALLOWED_STATUSES = ['Available', 'Occupied', 'Cleaning', 'Reserved', 'Maintenance'];

function parseCsv(content) {
  return content.trim().split('\n').map(line => line.split(',').map(s => s.trim()));
}

function writeCsv(filePath, headers, rows) {
  const content = [headers.join(','), ...rows.map(r => r.join(','))].join('\n') + '\n';
  fs.writeFileSync(filePath, content, 'utf8');
}

function getNowTimestamp() {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  const hh = String(now.getHours()).padStart(2, '0');
  const min = String(now.getMinutes()).padStart(2, '0');
  const ss = String(now.getSeconds()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd} ${hh}:${min}:${ss}`;
}

function getTodayDate() {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

function readBeds() {
  const file = path.join(CSV_DIR, 'Beds.csv');
  if (!fs.existsSync(file)) return [];
  const lines = parseCsv(fs.readFileSync(file, 'utf8'));
  const headers = lines[0];
  return lines.slice(1).map(row => {
    const obj = {};
    headers.forEach((h, i) => obj[h] = row[i] || '');
    return obj;
  });
}

function saveBeds(beds) {
  const file = path.join(CSV_DIR, 'Beds.csv');
  const headers = ['bed_id', 'ward_id', 'ward_name', 'floor', 'room', 'bed_type', 'status', 'patient_id', 'last_updated', 'updated_by', 'active'];
  const rows = beds.map(b => [
    b.bed_id, b.ward_id, b.ward_name, b.floor, b.room, b.bed_type, b.status, b.patient_id || '-', b.last_updated, b.updated_by, b.active
  ]);
  writeCsv(file, headers, rows);
}

function readPatients() {
  const file = path.join(CSV_DIR, 'Patients.csv');
  if (!fs.existsSync(file)) return [];
  const lines = parseCsv(fs.readFileSync(file, 'utf8'));
  const headers = lines[0];
  return lines.slice(1).map(row => {
    const obj = {};
    headers.forEach((h, i) => obj[h] = row[i] || '');
    return obj;
  });
}

function savePatients(patients) {
  const file = path.join(CSV_DIR, 'Patients.csv');
  const headers = ['patient_id', 'bed_id', 'admission_date', 'discharge_date', 'status'];
  const rows = patients.map(p => [
    p.patient_id, p.bed_id || '-', p.admission_date, p.discharge_date || '-', p.status
  ]);
  writeCsv(file, headers, rows);
}

function readActivityLogs() {
  const file = path.join(CSV_DIR, 'ActivityLog.csv');
  if (!fs.existsSync(file)) return [];
  const lines = parseCsv(fs.readFileSync(file, 'utf8'));
  const headers = lines[0];
  return lines.slice(1).map(row => {
    const obj = {};
    headers.forEach((h, i) => obj[h] = row[i] || '');
    return obj;
  });
}

function appendActivityLog(entry) {
  const file = path.join(CSV_DIR, 'ActivityLog.csv');
  const timestamp = getNowTimestamp();
  const row = [
    timestamp,
    entry.user_id,
    entry.user_name,
    entry.action,
    entry.bed_id,
    entry.old_status,
    entry.new_status,
    `"${(entry.details || '').replace(/"/g, '""')}"`
  ];
  fs.appendFileSync(file, row.join(',') + '\n', 'utf8');
}

function readWards() {
  const file = path.join(CSV_DIR, 'Wards.csv');
  if (!fs.existsSync(file)) return [];
  const lines = parseCsv(fs.readFileSync(file, 'utf8'));
  const headers = lines[0];
  return lines.slice(1).map(row => {
    const obj = {};
    headers.forEach((h, i) => obj[h] = row[i] || '');
    return {
      ward_id: obj.ward_id,
      ward_name: obj.ward_name,
      floor: obj.floor,
      total_beds: parseInt(obj.total_beds, 10) || 0,
      active: obj.active === 'TRUE'
    };
  });
}

function readUsers() {
  const file = path.join(CSV_DIR, 'Users.csv');
  if (!fs.existsSync(file)) return [];
  const lines = parseCsv(fs.readFileSync(file, 'utf8'));
  const headers = lines[0];
  return lines.slice(1).map(row => {
    const obj = {};
    headers.forEach((h, i) => obj[h] = row[i] || '');
    return {
      user_id: obj.user_id,
      name: obj.name,
      role: obj.role,
      department: obj.department,
      active: obj.active === 'TRUE'
    };
  });
}

export function handleLocalApi(req, res) {
  const urlObj = new URL(req.url || '', `http://${req.headers.host || 'localhost'}`);
  const pathname = urlObj.pathname;
  
  if (!pathname.startsWith('/api')) {
    return false;
  }

  const actionParam = urlObj.searchParams.get('action');
  let action = actionParam || pathname.replace(/^\/api\/?/, '');
  if (!action) action = 'dashboard';

  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    res.end();
    return true;
  }

  const sendJson = (status, data) => {
    res.statusCode = status;
    res.end(JSON.stringify(data));
  };

  // GET Requests
  if (req.method === 'GET') {
    switch (action) {
      case 'beds':
      case 'beds/': {
        const beds = readBeds().map(b => ({
          ...b,
          active: b.active === 'TRUE',
          patient_id: b.patient_id === '-' ? null : b.patient_id
        }));
        sendJson(200, { success: true, data: beds, count: beds.length });
        return true;
      }
      case 'wards':
      case 'wards/': {
        const wards = readWards();
        sendJson(200, { success: true, data: wards, count: wards.length });
        return true;
      }
      case 'patients':
      case 'patients/': {
        const patients = readPatients();
        sendJson(200, { success: true, data: patients, count: patients.length });
        return true;
      }
      case 'users':
      case 'users/': {
        const users = readUsers();
        sendJson(200, { success: true, data: users, count: users.length });
        return true;
      }
      case 'activity':
      case 'activity/': {
        const logs = readActivityLogs().reverse();
        sendJson(200, { success: true, data: logs, count: logs.length });
        return true;
      }
      case 'dashboard':
      case 'dashboard/': {
        const beds = readBeds().filter(b => b.active === 'TRUE');
        const wards = readWards();
        const logs = readActivityLogs().reverse();
        const patients = readPatients();

        const total = beds.length;
        const available = beds.filter(b => b.status === 'Available').length;
        const occupied = beds.filter(b => b.status === 'Occupied').length;
        const cleaning = beds.filter(b => b.status === 'Cleaning').length;
        const reserved = beds.filter(b => b.status === 'Reserved').length;
        const maintenance = beds.filter(b => b.status === 'Maintenance').length;
        const occupancyRate = total > 0 ? Math.round((occupied / total) * 100) : 0;

        const wardSummaries = wards.map(w => {
          const wBeds = beds.filter(b => b.ward_id === w.ward_id);
          const wTotal = wBeds.length;
          const wOcc = wBeds.filter(b => b.status === 'Occupied').length;
          const wAvail = wBeds.filter(b => b.status === 'Available').length;
          return {
            ward_id: w.ward_id,
            ward_name: w.ward_name,
            floor: w.floor,
            total_beds: wTotal,
            available_beds: wAvail,
            occupied_beds: wOcc,
            occupancy_rate: wTotal > 0 ? Math.round((wOcc / wTotal) * 100) : 0
          };
        });

        sendJson(200, {
          success: true,
          data: {
            metrics: {
              total_beds: total,
              available,
              occupied,
              cleaning,
              reserved,
              maintenance,
              occupancy_rate: occupancyRate
            },
            ward_summaries: wardSummaries,
            recent_activity: logs.slice(0, 10),
            awaiting_patients_count: patients.filter(p => p.status === 'Awaiting Bed').length,
            timestamp: getNowTimestamp()
          }
        });
        return true;
      }
      default:
        sendJson(404, { success: false, message: `Unknown GET endpoint: ${action}` });
        return true;
    }
  }

  // POST Requests
  if (req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      let payload = {};
      try {
        if (body.trim()) payload = JSON.parse(body);
      } catch (e) {
        sendJson(400, { success: false, message: `Malformed JSON payload: ${e.message}` });
        return;
      }

      const postAction = payload.action || action;

      switch (postAction) {
        case 'bed/update':
        case '/bed/update': {
          if (!payload.bed_id) {
            sendJson(400, { success: false, message: 'Missing required field: bed_id' });
            return;
          }
          if (!payload.status) {
            sendJson(400, { success: false, message: 'Missing required field: status' });
            return;
          }
          if (!ALLOWED_STATUSES.includes(payload.status)) {
            sendJson(400, {
              success: false,
              message: `Invalid status "${payload.status}". Allowed values: ${ALLOWED_STATUSES.join(', ')}`
            });
            return;
          }

          const beds = readBeds();
          const targetIndex = beds.findIndex(b => b.bed_id.toLowerCase() === payload.bed_id.toLowerCase());
          if (targetIndex === -1) {
            sendJson(404, { success: false, message: `Bed ${payload.bed_id} does not exist` });
            return;
          }

          const bed = beds[targetIndex];
          if (bed.active !== 'TRUE') {
            sendJson(400, { success: false, message: `Bed ${payload.bed_id} is inactive and cannot be updated` });
            return;
          }

          const oldStatus = bed.status;
          const newStatus = payload.status;
          const nowTs = getNowTimestamp();
          const updatedBy = payload.updated_by || 'Staff';
          const userId = payload.user_id || 'U001';

          let newPatientId = payload.patient_id !== undefined ? payload.patient_id : bed.patient_id;
          if (newStatus === 'Available' || newStatus === 'Cleaning') {
            newPatientId = '-';
          }

          bed.status = newStatus;
          bed.patient_id = newPatientId || '-';
          bed.last_updated = nowTs;
          bed.updated_by = updatedBy;

          saveBeds(beds);

          appendActivityLog({
            user_id: userId,
            user_name: updatedBy,
            action: 'STATUS_CHANGE',
            bed_id: bed.bed_id,
            old_status: oldStatus,
            new_status: newStatus,
            details: payload.details || `Status changed from ${oldStatus} to ${newStatus}`
          });

          sendJson(200, {
            success: true,
            message: 'Bed updated successfully',
            data: bed
          });
          return;
        }

        case 'bed/create':
        case '/bed/create': {
          if (!payload.bed_id || !payload.ward_id || !payload.ward_name || !payload.floor || !payload.room) {
            sendJson(400, { success: false, message: 'Missing required fields for bed creation' });
            return;
          }

          const beds = readBeds();
          if (beds.some(b => b.bed_id.toLowerCase() === payload.bed_id.toLowerCase())) {
            sendJson(400, { success: false, message: `Bed ID ${payload.bed_id} already exists` });
            return;
          }

          const newBed = {
            bed_id: payload.bed_id,
            ward_id: payload.ward_id,
            ward_name: payload.ward_name,
            floor: payload.floor,
            room: payload.room,
            bed_type: payload.bed_type || 'Standard Care',
            status: payload.status || 'Available',
            patient_id: payload.patient_id || '-',
            last_updated: getNowTimestamp(),
            updated_by: payload.updated_by || 'Admin',
            active: 'TRUE'
          };

          beds.push(newBed);
          saveBeds(beds);

          appendActivityLog({
            user_id: payload.user_id || 'U001',
            user_name: payload.updated_by || 'Admin',
            action: 'BED_CREATE',
            bed_id: newBed.bed_id,
            old_status: '-',
            new_status: newBed.status,
            details: `Created new bed in ${payload.ward_name}`
          });

          sendJson(200, { success: true, message: `Bed ${payload.bed_id} created successfully`, data: newBed });
          return;
        }

        case 'bed/deactivate':
        case '/bed/deactivate': {
          if (!payload.bed_id) {
            sendJson(400, { success: false, message: 'Missing required field: bed_id' });
            return;
          }
          const beds = readBeds();
          const target = beds.find(b => b.bed_id.toLowerCase() === payload.bed_id.toLowerCase());
          if (!target) {
            sendJson(404, { success: false, message: `Bed ${payload.bed_id} does not exist` });
            return;
          }
          target.active = 'FALSE';
          saveBeds(beds);

          appendActivityLog({
            user_id: payload.user_id || 'U001',
            user_name: payload.updated_by || 'Admin',
            action: 'BED_DEACTIVATE',
            bed_id: target.bed_id,
            old_status: target.status,
            new_status: 'Maintenance',
            details: 'Bed deactivated'
          });

          sendJson(200, { success: true, message: `Bed ${payload.bed_id} deactivated successfully` });
          return;
        }

        case 'patient/assign':
        case '/patient/assign': {
          if (!payload.patient_id || !payload.bed_id) {
            sendJson(400, { success: false, message: 'Missing patient_id or bed_id' });
            return;
          }

          const beds = readBeds();
          const targetBed = beds.find(b => b.bed_id.toLowerCase() === payload.bed_id.toLowerCase());
          if (!targetBed) {
            sendJson(404, { success: false, message: `Bed ${payload.bed_id} does not exist` });
            return;
          }
          if (targetBed.active !== 'TRUE') {
            sendJson(400, { success: false, message: `Bed ${payload.bed_id} is inactive` });
            return;
          }
          if (targetBed.status === 'Occupied') {
            sendJson(400, { success: false, message: `Bed ${payload.bed_id} is already occupied` });
            return;
          }
          if (targetBed.status === 'Maintenance') {
            sendJson(400, { success: false, message: `Bed ${payload.bed_id} is under maintenance` });
            return;
          }

          const patients = readPatients();
          const duplicate = patients.find(p => p.patient_id.toLowerCase() === payload.patient_id.toLowerCase() && p.status === 'Admitted' && p.bed_id !== '-' && p.bed_id.toLowerCase() !== payload.bed_id.toLowerCase());
          if (duplicate) {
            sendJson(400, {
              success: false,
              message: `Duplicate patient assignment: Patient ${payload.patient_id} is already assigned to bed ${duplicate.bed_id}`
            });
            return;
          }

          const oldStatus = targetBed.status;
          const nowTs = getNowTimestamp();
          const today = getTodayDate();
          const updatedBy = payload.updated_by || 'Staff';
          const userId = payload.user_id || 'U001';

          targetBed.status = 'Occupied';
          targetBed.patient_id = payload.patient_id;
          targetBed.last_updated = nowTs;
          targetBed.updated_by = updatedBy;
          saveBeds(beds);

          const existingPat = patients.find(p => p.patient_id.toLowerCase() === payload.patient_id.toLowerCase());
          if (existingPat) {
            existingPat.bed_id = targetBed.bed_id;
            existingPat.status = 'Admitted';
            if (payload.admission_date) existingPat.admission_date = payload.admission_date;
          } else {
            patients.push({
              patient_id: payload.patient_id,
              bed_id: targetBed.bed_id,
              admission_date: payload.admission_date || today,
              discharge_date: '-',
              status: 'Admitted'
            });
          }
          savePatients(patients);

          appendActivityLog({
            user_id: userId,
            user_name: updatedBy,
            action: 'PATIENT_ASSIGN',
            bed_id: targetBed.bed_id,
            old_status: oldStatus,
            new_status: 'Occupied',
            details: payload.details || `Assigned patient ${payload.patient_id} to ${targetBed.bed_id}`
          });

          sendJson(200, {
            success: true,
            message: `Patient ${payload.patient_id} successfully assigned to ${targetBed.bed_id}`
          });
          return;
        }

        case 'patient/discharge':
        case '/patient/discharge': {
          if (!payload.bed_id && !payload.patient_id) {
            sendJson(400, { success: false, message: 'Missing bed_id or patient_id' });
            return;
          }

          const beds = readBeds();
          const targetBed = beds.find(b => 
            (payload.bed_id && b.bed_id.toLowerCase() === payload.bed_id.toLowerCase()) ||
            (payload.patient_id && b.patient_id.toLowerCase() === payload.patient_id.toLowerCase())
          );

          if (!targetBed) {
            sendJson(404, { success: false, message: 'Specified bed or patient was not found' });
            return;
          }

          const dischargedPatId = payload.patient_id || targetBed.patient_id;
          const nextStatus = payload.target_bed_status || 'Cleaning';
          const nowTs = getNowTimestamp();
          const today = getTodayDate();
          const updatedBy = payload.updated_by || 'Staff';
          const userId = payload.user_id || 'U001';

          targetBed.status = nextStatus;
          targetBed.patient_id = '-';
          targetBed.last_updated = nowTs;
          targetBed.updated_by = updatedBy;
          saveBeds(beds);

          const patients = readPatients();
          const pat = patients.find(p => p.patient_id === dischargedPatId && p.status === 'Admitted');
          if (pat) {
            pat.bed_id = '-';
            pat.status = 'Discharged';
            pat.discharge_date = today;
            savePatients(patients);
          }

          appendActivityLog({
            user_id: userId,
            user_name: updatedBy,
            action: 'PATIENT_DISCHARGE',
            bed_id: targetBed.bed_id,
            old_status: 'Occupied',
            new_status: nextStatus,
            details: payload.details || `Patient ${dischargedPatId} discharged; bed set to ${nextStatus}`
          });

          sendJson(200, {
            success: true,
            message: `Patient discharged successfully. Bed ${targetBed.bed_id} marked as ${nextStatus}`
          });
          return;
        }

        case 'ward/create':
        case '/ward/create': {
          if (!payload.ward_id || !payload.ward_name || !payload.floor) {
            sendJson(400, { success: false, message: 'Missing required fields for ward creation' });
            return;
          }
          const file = path.join(CSV_DIR, 'Wards.csv');
          const lines = parseCsv(fs.readFileSync(file, 'utf8'));
          if (lines.slice(1).some(r => r[0].toLowerCase() === payload.ward_id.toLowerCase())) {
            sendJson(400, { success: false, message: `Ward ID ${payload.ward_id} already exists` });
            return;
          }
          const row = [payload.ward_id, payload.ward_name, payload.floor, payload.total_beds || '0', 'TRUE'];
          fs.appendFileSync(file, row.join(',') + '\n', 'utf8');

          appendActivityLog({
            user_id: payload.user_id || 'U001',
            user_name: payload.updated_by || 'Admin',
            action: 'WARD_CREATE',
            bed_id: '-',
            old_status: '-',
            new_status: '-',
            details: `Created new ward ${payload.ward_name}`
          });

          sendJson(200, { success: true, message: `Ward ${payload.ward_name} created successfully` });
          return;
        }

        default:
          sendJson(404, { success: false, message: `Unknown POST endpoint: ${postAction}` });
          return;
      }
    });
    return true;
  }

  return false;
}
