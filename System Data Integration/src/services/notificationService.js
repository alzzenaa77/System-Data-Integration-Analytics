const pool = require('../database/pool');

/**
 * Notification Service for managing user notifications
 */

/**
 * Send notification to a user
 * @param {string} userId - User ID to send notification to
 * @param {string} type - Notification type
 * @param {string} message - Notification message
 * @param {Object} metadata - Additional metadata
 * @returns {Promise<Object>} Created notification
 */
async function sendNotification(userId, type, message, metadata = {}) {
  const [result] = await pool.query(
    `INSERT INTO notifications 
    (user_id, type, message, metadata, is_read, created_at)
    VALUES (?, ?, ?, ?, false, NOW())`,
    [userId, type, message, JSON.stringify(metadata)]
  );
  
  // Get the inserted record
  const [rows] = await pool.query('SELECT * FROM notifications WHERE id = ?', [result.insertId]);
  return rows[0];
}

/**
 * Get notifications for a user
 * @param {string} userId - User ID
 * @param {boolean} unreadOnly - Filter for unread only
 * @returns {Promise<Array>} Array of notifications
 */
async function getNotifications(userId, unreadOnly = false) {
  let query = 'SELECT * FROM notifications WHERE user_id = ?';
  const params = [userId];
  
  if (unreadOnly) {
    query += ' AND is_read = false';
  }
  
  query += ' ORDER BY created_at DESC';
  
  const [rows] = await pool.query(query, params);
  
  return rows;
}

/**
 * Mark notification as read
 * @param {string} notificationId - Notification ID
 * @returns {Promise<boolean>} Success status
 */
async function markAsRead(notificationId) {
  const [result] = await pool.query(
    `UPDATE notifications 
    SET is_read = true, read_at = NOW()
    WHERE id = ?`,
    [notificationId]
  );
  
  return result.affectedRows > 0;
}

/**
 * Get unread notification count for a user
 * @param {string} userId - User ID
 * @returns {Promise<number>} Unread count
 */
async function getUnreadCount(userId) {
  const [rows] = await pool.query(
    'SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND is_read = false',
    [userId]
  );
  
  return parseInt(rows[0].count);
}

module.exports = {
  sendNotification,
  getNotifications,
  markAsRead,
  getUnreadCount
};
