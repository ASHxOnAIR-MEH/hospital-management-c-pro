/**
 * Code.gs - Hospital Bed Monitoring System
 * 
 * Main Web App Entry Point & API Router
 * 
 * Routes incoming GET and POST HTTP requests to their respective handlers,
 * wraps output in JSON, and sets appropriate MIME types.
 */

/**
 * Handles all incoming GET requests.
 * 
 * Supported endpoints:
 *   GET /beds       or ?action=beds
 *   GET /wards      or ?action=wards
 *   GET /patients   or ?action=patients
 *   GET /users      or ?action=users
 *   GET /activity   or ?action=activity
 *   GET /dashboard  or ?action=dashboard
 */
function doGet(e) {
  try {
    var action = normalizeAction(e);

    var result;
    switch (action) {
      case 'beds':
      case '/beds':
        result = getBeds();
        break;

      case 'wards':
      case '/wards':
        result = getWards();
        break;

      case 'patients':
      case '/patients':
        result = getPatients();
        break;

      case 'users':
      case '/users':
        result = getUsers();
        break;

      case 'activity':
      case '/activity':
        result = getActivityLogs();
        break;

      case 'dashboard':
      case '/dashboard':
        result = getDashboard();
        break;

      default:
        result = {
          success: false,
          message: 'Unknown GET endpoint "' + action + '". Supported: /beds, /wards, /patients, /users, /activity, /dashboard'
        };
        break;
    }

    return createJsonResponse(result);
  } catch (error) {
    return createJsonResponse({
      success: false,
      message: 'Server Error: ' + error.message
    });
  }
}

/**
 * Handles all incoming POST requests.
 * 
 * Supported endpoints:
 *   POST /bed/update       or action="bed/update"
 *   POST /bed/create       or action="bed/create"
 *   POST /bed/deactivate   or action="bed/deactivate"
 *   POST /patient/assign   or action="patient/assign"
 *   POST /patient/discharge or action="patient/discharge"
 *   POST /ward/create      or action="ward/create"
 */
function doPost(e) {
  try {
    var payload = {};

    if (e && e.postData && e.postData.contents) {
      try {
        payload = JSON.parse(e.postData.contents);
      } catch (parseErr) {
        return createJsonResponse({
          success: false,
          message: 'Malformed JSON payload: ' + parseErr.message
        });
      }
    }

    var action = normalizeAction(e, payload);

    var result;
    switch (action) {
      case 'bed/update':
      case '/bed/update':
        result = updateBed(payload);
        break;

      case 'bed/create':
      case '/bed/create':
        result = createBed(payload);
        break;

      case 'bed/deactivate':
      case '/bed/deactivate':
        result = deactivateBed(payload);
        break;

      case 'patient/assign':
      case '/patient/assign':
        result = assignPatient(payload);
        break;

      case 'patient/discharge':
      case '/patient/discharge':
        result = dischargePatient(payload);
        break;

      case 'ward/create':
      case '/ward/create':
        result = createWard(payload);
        break;

      default:
        result = {
          success: false,
          message: 'Unknown POST endpoint "' + action + '". Supported: /bed/update, /bed/create, /bed/deactivate, /patient/assign, /patient/discharge, /ward/create'
        };
        break;
    }

    return createJsonResponse(result);
  } catch (error) {
    return createJsonResponse({
      success: false,
      message: 'Server Error: ' + error.message
    });
  }
}

/**
 * Normalizes the action identifier from query parameters, pathInfo, or payload.
 */
function normalizeAction(e, payload) {
  if (e && e.parameter && e.parameter.action) {
    return e.parameter.action.trim();
  }
  if (payload && payload.action) {
    return payload.action.trim();
  }
  if (e && e.pathInfo) {
    return e.pathInfo.replace(/^\/+/, '');
  }
  // Default to dashboard
  return 'dashboard';
}

/**
 * Formats a JavaScript object into a JSON TextOutput response.
 */
function createJsonResponse(data) {
  var output = ContentService.createTextOutput(JSON.stringify(data));
  output.setMimeType(ContentService.MimeType.JSON);
  return output;
}
