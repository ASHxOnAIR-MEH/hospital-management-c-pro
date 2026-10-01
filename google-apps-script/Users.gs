/**
 * Users.gs - Hospital Bed Monitoring System
 * 
 * Manages authorized staff users, clinical roles, and active logins.
 */

/**
 * Retrieves all registered staff users.
 */
function getUsers() {
  var sheet = getSheet(CONFIG.SHEETS.USERS);
  var users = sheetToObjects(sheet);

  var formatted = users.map(function(u) {
    return {
      user_id: u.user_id,
      name: u.name,
      role: u.role,
      department: u.department,
      active: (u.active === true || u.active === 'TRUE' || u.active === 'true')
    };
  });

  return {
    success: true,
    data: formatted,
    count: formatted.length
  };
}
