/**
 * Reports.gs - Hospital Bed Monitoring System
 * 
 * Aggregates live occupancy analytics, department capacity summaries,
 * and high-priority alerts for the dashboard.
 */

/**
 * Generates real-time dashboard analytics directly from the database sheets.
 */
function getDashboard() {
  var bedsResult = getBeds();
  var wardsResult = getWards();
  var logsResult = getActivityLogs();
  var patientsResult = getPatients();

  var beds = bedsResult.data || [];
  var wards = wardsResult.data || [];
  var logs = logsResult.data || [];
  var patients = patientsResult.data || [];

  // Active beds only
  var activeBeds = beds.filter(function(b) { return b.active; });
  var total = activeBeds.length;
  var available = activeBeds.filter(function(b) { return b.status === 'Available'; }).length;
  var occupied = activeBeds.filter(function(b) { return b.status === 'Occupied'; }).length;
  var cleaning = activeBeds.filter(function(b) { return b.status === 'Cleaning'; }).length;
  var reserved = activeBeds.filter(function(b) { return b.status === 'Reserved'; }).length;
  var maintenance = activeBeds.filter(function(b) { return b.status === 'Maintenance'; }).length;

  var occupancyRate = total > 0 ? Math.round((occupied / total) * 100) : 0;

  // Ward summaries
  var wardSummaries = wards.map(function(w) {
    var wBeds = activeBeds.filter(function(b) { return b.ward_id === w.ward_id; });
    var wTotal = wBeds.length;
    var wOccupied = wBeds.filter(function(b) { return b.status === 'Occupied'; }).length;
    var wAvailable = wBeds.filter(function(b) { return b.status === 'Available'; }).length;
    var wRate = wTotal > 0 ? Math.round((wOccupied / wTotal) * 100) : 0;

    return {
      ward_id: w.ward_id,
      ward_name: w.ward_name,
      floor: w.floor,
      total_beds: wTotal,
      available_beds: wAvailable,
      occupied_beds: wOccupied,
      occupancy_rate: wRate
    };
  });

  return {
    success: true,
    data: {
      metrics: {
        total_beds: total,
        available: available,
        occupied: occupied,
        cleaning: cleaning,
        reserved: reserved,
        maintenance: maintenance,
        occupancy_rate: occupancyRate
      },
      ward_summaries: wardSummaries,
      recent_activity: logs.slice(0, 10),
      awaiting_patients_count: patients.filter(function(p) { return p.status === 'Awaiting Bed'; }).length,
      timestamp: formatTimestamp(new Date())
    }
  };
}
