const pool = require('../database/pool');

/**
 * Point Service for managing contributor points
 */

/**
 * Award points to a contributor
 * @param {string} contributorId - Contributor ID
 * @param {string} dataId - Data ID that earned points
 * @param {string} dataType - Type of data (FEE_DATA or CROSS_DIVISION_DATA)
 * @param {number} points - Number of points to award
 * @returns {Promise<Object>} Point transaction record
 */
async function awardPoints(contributorId, dataId, dataType, points) {
  const description = `Points earned from ${dataType === 'FEE_DATA' ? 'fee data' : 'cross-division data'} acceptance`;
  
  const [result] = await pool.query(
    `INSERT INTO point_transactions 
    (contributor_id, data_id, data_type, points, description, created_at)
    VALUES (?, ?, ?, ?, ?, NOW())`,
    [contributorId, dataId, dataType, points, description]
  );
  
  // Get the inserted record
  const [rows] = await pool.query('SELECT * FROM point_transactions WHERE id = ?', [result.insertId]);
  return rows[0];
}

/**
 * Get total points for a contributor
 * @param {string} contributorId - Contributor ID
 * @returns {Promise<number>} Total points
 */
async function getContributorPoints(contributorId) {
  const [rows] = await pool.query(
    'SELECT COALESCE(SUM(points), 0) as total FROM point_transactions WHERE contributor_id = ?',
    [contributorId]
  );
  
  return parseInt(rows[0].total);
}

/**
 * Get point history for a contributor
 * @param {string} contributorId - Contributor ID
 * @returns {Promise<Array>} Array of point transactions
 */
async function getPointHistory(contributorId) {
  const [rows] = await pool.query(
    'SELECT * FROM point_transactions WHERE contributor_id = ? ORDER BY created_at DESC',
    [contributorId]
  );
  
  return rows;
}

/**
 * Check redeemable points for a contributor
 * @param {string} contributorId - Contributor ID
 * @returns {Promise<Object>} Redeemable points info
 */
async function checkRedeemablePoints(contributorId) {
  const totalPoints = await getContributorPoints(contributorId);
  const redeemableMultiples = Math.floor(totalPoints / 5);
  const canRedeem = redeemableMultiples > 0;
  
  return {
    totalPoints,
    redeemableMultiples,
    canRedeem
  };
}

module.exports = {
  awardPoints,
  getContributorPoints,
  getPointHistory,
  checkRedeemablePoints
};
