const pool = require('../database/pool');

/**
 * Dashboard Service
 * Requirements: 8.2, 9.2, 10.2, 11.2, 11.3, 16.2
 */

async function getFeeCompetitorDashboard(userId, filters = {}) {
  let query = `
    SELECT fd.*, u.full_name as contributor_name
    FROM fee_data fd
    LEFT JOIN users u ON fd.contributor_id = u.id
    WHERE fd.status = 'ACCEPTED'
  `;
  
  const params = [];
  
  if (filters.serviceType) {
    query += ` AND fd.service_type = ?`;
    params.push(filters.serviceType);
  }
  
  if (filters.startDate) {
    query += ` AND fd.financial_date >= ?`;
    params.push(filters.startDate);
  }
  
  if (filters.endDate) {
    query += ` AND fd.financial_date <= ?`;
    params.push(filters.endDate);
  }
  
  query += ` ORDER BY fd.financial_date DESC`;
  
  const [rows] = await pool.query(query, params);
  return rows;
}

async function getCrossDivisionDashboard(userId, filters = {}) {
  let query = `
    SELECT cd.*, u.full_name as contributor_name
    FROM cross_division_data cd
    LEFT JOIN users u ON cd.contributor_id = u.id
    WHERE cd.status = 'ACCEPTED'
  `;
  
  const params = [];
  
  if (filters.divisionCategory) {
    query += ` AND cd.division_category = ?`;
    params.push(filters.divisionCategory);
  }
  
  if (filters.startDate) {
    query += ` AND cd.submission_date >= ?`;
    params.push(filters.startDate);
  }
  
  if (filters.endDate) {
    query += ` AND cd.submission_date <= ?`;
    params.push(filters.endDate);
  }
  
  query += ` ORDER BY cd.submission_date DESC`;
  
  const [rows] = await pool.query(query, params);
  return rows;
}

async function getValidatorMonitoringDashboard() {
  const [rows] = await pool.query(`
    SELECT 
      (SELECT COUNT(*) FROM fee_data WHERE status = 'PENDING') as fee_pending,
      (SELECT COUNT(*) FROM fee_data WHERE status = 'ACCEPTED') as fee_accepted,
      (SELECT COUNT(*) FROM fee_data WHERE status = 'REJECTED') as fee_rejected,
      (SELECT COUNT(*) FROM cross_division_data WHERE status = 'PENDING') as cross_pending,
      (SELECT COUNT(*) FROM cross_division_data WHERE status = 'ACCEPTED') as cross_accepted,
      (SELECT COUNT(*) FROM cross_division_data WHERE status = 'REJECTED') as cross_rejected
  `);
  
  return rows[0];
}

/**
 * Get Fee Insights Dashboard Data
 * Requirements: 16.2
 */
async function getFeeInsightsDashboard(filters = {}) {
  let whereClause = "WHERE fd.status = 'ACCEPTED'";
  const params = [];
  
  if (filters.serviceType) {
    whereClause += ` AND fd.service_type = ?`;
    params.push(filters.serviceType);
  }
  
  if (filters.taxYear) {
    whereClause += ` AND fd.tax_year = ?`;
    params.push(filters.taxYear);
  }
  
  if (filters.startDate) {
    whereClause += ` AND fd.financial_date >= ?`;
    params.push(filters.startDate);
  }
  
  if (filters.endDate) {
    whereClause += ` AND fd.financial_date <= ?`;
    params.push(filters.endDate);
  }
  
  // Summary Cards
  const [summaryRows] = await pool.query(`
    SELECT 
      COUNT(*) as total_records,
      COUNT(DISTINCT service_provider) as total_providers,
      AVG(fee_amount) as avg_fee,
      SUM(fee_amount) as total_fees
    FROM fee_data fd
    ${whereClause}
  `, params);
  
  // Fee by Service Type (Bar Chart)
  const [serviceTypeRows] = await pool.query(`
    SELECT 
      service_type,
      COUNT(*) as count,
      AVG(fee_amount) as avg_fee,
      MIN(fee_amount) as min_fee,
      MAX(fee_amount) as max_fee
    FROM fee_data fd
    ${whereClause}
    GROUP BY service_type
    ORDER BY avg_fee DESC
  `, params);
  
  // Fee Distribution by Scheme (Pie Chart)
  const [feeSchemeRows] = await pool.query(`
    SELECT 
      fee_scheme,
      COUNT(*) as count,
      SUM(fee_amount) as total_amount
    FROM fee_data fd
    ${whereClause}
    GROUP BY fee_scheme
    ORDER BY count DESC
  `, params);
  
  return {
    summary: summaryRows[0],
    byServiceType: serviceTypeRows,
    byFeeScheme: feeSchemeRows
  };
}

module.exports = {
  getFeeCompetitorDashboard,
  getCrossDivisionDashboard,
  getValidatorMonitoringDashboard,
  getFeeInsightsDashboard
};
