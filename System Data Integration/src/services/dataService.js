const pool = require('../database/pool');

/**
 * Data Service for managing FeeData and CrossDivisionData
 */

// ============= FeeData Operations =============

/**
 * Create new fee data
 * @param {Object} data - Fee data input
 * @param {string} contributorId - ID of contributor
 * @returns {Promise<Object>} Created fee data
 */
async function createFeeData(data, contributorId) {
  const { 
    submitterName, submitterDivision, submitterInputDate,
    serviceProvider, serviceRecipient,
    serviceType, scopeOfWork, taxYear,
    financialType, financialDescription, feeScheme, feeAmount, currency = 'IDR', financialDate
  } = data;
  
  const [result] = await pool.query(
    `INSERT INTO fee_data 
    (contributor_id, submitter_name, submitter_division, submitter_input_date,
     service_provider, service_recipient, service_type, scope_of_work, tax_year,
     financial_type, financial_description, fee_scheme, fee_amount, currency, financial_date,
     status, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'PENDING', NOW(), NOW())`,
    [contributorId, submitterName, submitterDivision, submitterInputDate,
     serviceProvider, serviceRecipient, serviceType, scopeOfWork, taxYear,
     financialType, financialDescription, feeScheme, feeAmount, currency, financialDate]
  );
  
  // Get the inserted record
  const [rows] = await pool.query('SELECT * FROM fee_data WHERE id = ?', [result.insertId]);
  return rows[0];
}

/**
 * Get fee data by ID
 * @param {string} id - Fee data ID
 * @returns {Promise<Object>} Fee data
 */
async function getFeeDataById(id) {
  const [rows] = await pool.query(
    'SELECT * FROM fee_data WHERE id = ?',
    [id]
  );
  
  return rows[0] || null;
}

/**
 * Update fee data status
 * @param {string} id - Fee data ID
 * @param {string} status - New status
 * @param {string} notes - Validation notes
 * @returns {Promise<Object>} Updated fee data
 */
async function updateFeeDataStatus(id, status, notes) {
  await pool.query(
    `UPDATE fee_data 
    SET status = ?, validation_notes = ?, updated_at = NOW()
    WHERE id = ?`,
    [status, notes, id]
  );
  
  // Get the updated record
  const [rows] = await pool.query('SELECT * FROM fee_data WHERE id = ?', [id]);
  return rows[0] || null;
}

/**
 * Get fee data by status
 * @param {string} status - Status to filter by
 * @returns {Promise<Array>} Array of fee data
 */
async function getFeeDataByStatus(status) {
  const [rows] = await pool.query(
    'SELECT * FROM fee_data WHERE status = ? ORDER BY created_at DESC',
    [status]
  );
  
  return rows;
}

/**
 * Update fee data
 * @param {string} id - Fee data ID
 * @param {Object} data - Updated data
 * @param {string} contributorId - ID of contributor
 * @returns {Promise<Object>} Updated fee data
 */
async function updateFeeData(id, data, contributorId) {
  const { 
    submitterName, submitterDivision, submitterInputDate,
    serviceProvider, serviceRecipient,
    serviceType, scopeOfWork, taxYear,
    financialType, financialDescription, feeScheme, feeAmount, currency, financialDate
  } = data;
  
  await pool.query(
    `UPDATE fee_data 
    SET submitter_name = ?, submitter_division = ?, submitter_input_date = ?,
        service_provider = ?, service_recipient = ?, service_type = ?, 
        scope_of_work = ?, tax_year = ?, financial_type = ?, 
        financial_description = ?, fee_scheme = ?, fee_amount = ?, 
        currency = ?, financial_date = ?, updated_at = NOW()
    WHERE id = ? AND contributor_id = ?`,
    [submitterName, submitterDivision, submitterInputDate,
     serviceProvider, serviceRecipient, serviceType, scopeOfWork, taxYear,
     financialType, financialDescription, feeScheme, feeAmount, currency, financialDate,
     id, contributorId]
  );
  
  // Get the updated record
  const [rows] = await pool.query('SELECT * FROM fee_data WHERE id = ?', [id]);
  return rows[0] || null;
}

// ============= CrossDivisionData Operations =============

/**
 * Create new cross-division data
 * @param {Object} data - Cross-division data input
 * @param {string} contributorId - ID of contributor
 * @returns {Promise<Object>} Created cross-division data
 */
async function createCrossDivisionData(data) {
  const { contributor_id, title, division_category, description, submission_date, attachment_url = null } = data;
  
  const [result] = await pool.query(
    `INSERT INTO cross_division_data 
    (contributor_id, title, division_category, description, submission_date, attachment_url, status, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, 'PENDING', NOW(), NOW())`,
    [contributor_id, title, division_category, description, submission_date, attachment_url]
  );
  
  // Get the inserted record
  const [rows] = await pool.query('SELECT * FROM cross_division_data WHERE id = ?', [result.insertId]);
  return rows[0];
}

/**
 * Get cross-division data by ID
 * @param {string} id - Cross-division data ID
 * @returns {Promise<Object>} Cross-division data
 */
async function getCrossDivisionDataById(id) {
  const [rows] = await pool.query(
    'SELECT * FROM cross_division_data WHERE id = ?',
    [id]
  );
  
  return rows[0] || null;
}

/**
 * Update cross-division data status
 * @param {string} id - Cross-division data ID
 * @param {string} status - New status
 * @param {string} notes - Validation notes
 * @returns {Promise<Object>} Updated cross-division data
 */
async function updateCrossDivisionDataStatus(id, status, notes) {
  await pool.query(
    `UPDATE cross_division_data 
    SET status = ?, validation_notes = ?, updated_at = NOW()
    WHERE id = ?`,
    [status, notes, id]
  );
  
  // Get the updated record
  const [rows] = await pool.query('SELECT * FROM cross_division_data WHERE id = ?', [id]);
  return rows[0] || null;
}

/**
 * Get cross-division data by status
 * @param {string} status - Status to filter by
 * @returns {Promise<Array>} Array of cross-division data
 */
async function getCrossDivisionDataByStatus(status) {
  const [rows] = await pool.query(
    'SELECT * FROM cross_division_data WHERE status = ? ORDER BY created_at DESC',
    [status]
  );
  
  return rows;
}

/**
 * Update cross-division data
 * @param {string} id - Cross-division data ID
 * @param {Object} data - Updated data
 * @param {string} contributorId - ID of contributor
 * @returns {Promise<Object>} Updated cross-division data
 */
async function updateCrossDivisionData(id, data, contributorId) {
  const { title, divisionCategory, description, attachmentUrl } = data;
  
  await pool.query(
    `UPDATE cross_division_data 
    SET title = ?, division_category = ?, description = ?, attachment_url = ?, updated_at = NOW()
    WHERE id = ? AND contributor_id = ?`,
    [title, divisionCategory, description, attachmentUrl, id, contributorId]
  );
  
  // Get the updated record
  const [rows] = await pool.query('SELECT * FROM cross_division_data WHERE id = ?', [id]);
  return rows[0] || null;
}

module.exports = {
  createFeeData,
  getFeeDataById,
  updateFeeDataStatus,
  getFeeDataByStatus,
  updateFeeData,
  createCrossDivisionData,
  getCrossDivisionDataById,
  updateCrossDivisionDataStatus,
  getCrossDivisionDataByStatus,
  updateCrossDivisionData
};
