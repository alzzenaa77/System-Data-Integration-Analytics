const express = require('express');
const router = express.Router();
const { authenticateToken, authorizeRole } = require('../middleware/auth');
const { getFeeCompetitorDashboard, getCrossDivisionDashboard } = require('../services/dashboardService');
const { logAudit } = require('../services/auditService');
const pool = require('../database/pool');

/**
 * GET /api/dashboard/fee-competitor
 * Get fee competitor dashboard
 */
router.get('/fee-competitor', authenticateToken, authorizeRole(['PARTNER', 'SPV_MANAGER_PM', 'VALIDATOR']), async (req, res, next) => {
  try {
    const filters = {
      serviceType: req.query.serviceType,
      startDate: req.query.startDate,
      endDate: req.query.endDate
    };

    const data = await getFeeCompetitorDashboard(req.user.id, filters);

    await logAudit(req.user.id, 'VIEW', 'FEE_DATA', null, { filters }, req.ip, req.headers['user-agent']);

    res.json(data);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/dashboard/cross-division
 * Get cross-division dashboard (SPV/Manager/PM and Validator only)
 */
router.get('/cross-division', authenticateToken, authorizeRole(['SPV_MANAGER_PM', 'VALIDATOR']), async (req, res, next) => {
  try {
    const filters = {
      divisionCategory: req.query.divisionCategory,
      startDate: req.query.startDate,
      endDate: req.query.endDate
    };

    const data = await getCrossDivisionDashboard(req.user.id, filters);

    await logAudit(req.user.id, 'VIEW', 'CROSS_DIVISION_DATA', null, { filters }, req.ip, req.headers['user-agent']);

    res.json(data);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/dashboard/audit-report
 * Get audit report data: all fee_data + cross_division_data for client-service tracking
 * Accessible by VALIDATOR and SPV_MANAGER_PM
 */
router.get('/audit-report', authenticateToken, authorizeRole(['VALIDATOR', 'SPV_MANAGER_PM']), async (req, res, next) => {
  try {
    // Fetch all fee_data with contributor info
    const [feeRows] = await pool.query(`
      SELECT
        fd.id, fd.submitter_name, fd.submitter_division, fd.submitter_input_date,
        fd.service_provider, fd.service_recipient, fd.service_type, fd.scope_of_work,
        fd.tax_year, fd.financial_type, fd.financial_description, fd.fee_scheme,
        fd.fee_amount, fd.currency, fd.financial_date, fd.status, fd.created_at,
        u.full_name AS contributor_name
      FROM fee_data fd
      LEFT JOIN users u ON fd.contributor_id = u.id
      ORDER BY fd.created_at DESC
    `);

    // Fetch all cross_division_data with contributor info
    const [crossRows] = await pool.query(`
      SELECT
        cd.id, cd.title, cd.division_category, cd.description,
        cd.submission_date, cd.attachment_url, cd.status, cd.created_at,
        u.full_name AS contributor_name
      FROM cross_division_data cd
      LEFT JOIN users u ON cd.contributor_id = u.id
      ORDER BY cd.created_at DESC
    `);

    await logAudit(req.user.id, 'VIEW', 'AUDIT_REPORT', null, {}, req.ip, req.headers['user-agent']);

    res.json({
      feeData: feeRows,
      crossData: crossRows
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;

