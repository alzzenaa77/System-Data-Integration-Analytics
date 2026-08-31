const db = require('../config/database');

/**
 * Audit Service
 * Requirements: 13.2, 15.3, 10.5
 */

async function logAudit(userId, action, resourceType, resourceId, changes, ipAddress, userAgent) {
  const [result] = await db.query(
    `INSERT INTO audit_logs (user_id, action, resource_type, resource_id, changes, ip_address, user_agent)
    VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [userId, action, resourceType, resourceId, JSON.stringify(changes), ipAddress, userAgent]
  );
  
  // Get the inserted record
  const [rows] = await db.query('SELECT * FROM audit_logs WHERE id = ?', [result.insertId]);
  return rows[0];
}

module.exports = {
  logAudit
};
