const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { authenticateToken, authorizeRole } = require('../middleware/auth');
const { createFeeData, createCrossDivisionData } = require('../services/dataService');
const { getContributorPoints, getPointHistory } = require('../services/pointService');
const { logAudit } = require('../services/auditService');
const { ValidationError } = require('../middleware/errors');
const db = require('../config/database');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = 'uploads/cross-division';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'cross-div-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: function (req, file, cb) {
    const allowedTypes = /pdf|doc|docx|xls|xlsx|ppt|pptx/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only PDF, Word, Excel, and PowerPoint files are allowed'));
    }
  }
});

/**
 * POST /api/fee-data
 * Submit fee data with new 16-field structure
 */
router.post('/fee-data', authenticateToken, authorizeRole(['CONTRIBUTOR']), async (req, res, next) => {
  try {
    const {
      submitterName, submitterDivision, submitterInputDate,
      serviceProvider, serviceRecipient,
      serviceType, scopeOfWork, taxYear,
      financialType, financialDescription, feeScheme, feeAmount, currency, financialDate
    } = req.body;

    // Validate required fields
    if (!submitterName || !submitterDivision || !submitterInputDate ||
      !serviceProvider || !serviceRecipient ||
      !serviceType || !scopeOfWork || !taxYear ||
      !financialType || !financialDescription || !feeScheme || !feeAmount || !financialDate) {
      throw new ValidationError('All fields are required');
    }

    const feeData = await createFeeData({
      submitterName,
      submitterDivision,
      submitterInputDate,
      serviceProvider,
      serviceRecipient,
      serviceType,
      scopeOfWork,
      taxYear,
      financialType,
      financialDescription,
      feeScheme,
      feeAmount,
      currency: currency || 'IDR',
      financialDate
    }, req.user.id);

    await logAudit(req.user.id, 'CREATE', 'FEE_DATA', feeData.id, {
      submitterName, serviceProvider, serviceRecipient, serviceType, taxYear, feeAmount
    }, req.ip, req.headers['user-agent']);

    res.status(201).json(feeData);
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/cross-division-data
 * Submit cross-division data with optional file upload
 */
router.post('/cross-division-data', authenticateToken, authorizeRole(['CONTRIBUTOR']), upload.single('attachment'), async (req, res, next) => {
  try {
    const { title, divisionCategory, description, submissionDate } = req.body;

    if (!title || !divisionCategory || !description || !submissionDate) {
      throw new ValidationError('Field wajib: title, divisionCategory, description, submissionDate');
    }

    const attachmentUrl = req.file ? `/uploads/cross-division/${req.file.filename}` : null;

    const crossData = await createCrossDivisionData({
      contributor_id: req.user.id,
      title,
      division_category: divisionCategory,
      description,
      submission_date: submissionDate,
      attachment_url: attachmentUrl
    });

    await logAudit(req.user.id, 'CREATE', 'CROSS_DIVISION_DATA', crossData.id, { title, divisionCategory, hasAttachment: !!attachmentUrl }, req.ip, req.headers['user-agent']);

    res.status(201).json(crossData);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/my-data
 * Get contributor's own data
 */
router.get('/my-data', authenticateToken, authorizeRole(['CONTRIBUTOR']), async (req, res, next) => {
  try {
    const [feeDataRows] = await db.query(
      'SELECT * FROM fee_data WHERE contributor_id = ? ORDER BY created_at DESC',
      [req.user.id]
    );

    const [crossDataRows] = await db.query(
      'SELECT * FROM cross_division_data WHERE contributor_id = ? ORDER BY created_at DESC',
      [req.user.id]
    );

    res.json({
      feeData: feeDataRows,
      crossDivisionData: crossDataRows
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/my-points
 * Get contributor's points
 */
router.get('/my-points', authenticateToken, authorizeRole(['CONTRIBUTOR']), async (req, res, next) => {
  try {
    const totalPoints = await getContributorPoints(req.user.id);
    const history = await getPointHistory(req.user.id);

    res.json({
      totalPoints,
      redeemableMultiples: Math.floor(totalPoints / 5),
      canRedeem: totalPoints >= 5,
      history
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/fee-data/:id/clarification
 * Contributor submits clarification for a fee data item
 * Changes status back to PENDING and marks clarification_submitted = true
 */
router.post('/fee-data/:id/clarification', authenticateToken, authorizeRole(['CONTRIBUTOR']), async (req, res, next) => {
  try {
    const { id } = req.params;
    const { clarification } = req.body;

    if (!clarification || !clarification.trim()) {
      throw new ValidationError('Clarification text is required');
    }

    // Verify ownership and current status
    const { rows } = await db.query(
      'SELECT * FROM fee_data WHERE id = $1 AND contributor_id = $2',
      [id, req.user.id]
    );

    if (rows.length === 0) {
      throw new ValidationError('Data tidak ditemukan atau bukan milik Anda');
    }

    const feeData = rows[0];
    if (feeData.status !== 'NEED_CLARIFICATION') {
      throw new ValidationError('Data tidak dalam status NEED_CLARIFICATION');
    }

    // Get the latest clarification request for this data
    const { rows: clarRows } = await db.query(
      `SELECT * FROM clarification_history
       WHERE data_id = $1 AND data_type = 'FEE_DATA'
       ORDER BY requested_at DESC LIMIT 1`,
      [id]
    );

    // Update clarification history with response
    if (clarRows.length > 0) {
      await db.query(
        `UPDATE clarification_history
         SET responded_by = $1, responded_at = NOW(), response_notes = $2
         WHERE id = $3`,
        [req.user.id, clarification.trim(), clarRows[0].id]
      );
    } else {
      // Fallback: insert a new clarification response record
      await db.query(
        `INSERT INTO clarification_history (data_id, data_type, requested_by, request_notes, responded_by, responded_at, response_notes)
         VALUES ($1, 'FEE_DATA', $2, 'Clarification requested', $2, NOW(), $3)`,
        [id, req.user.id, clarification.trim()]
      );
    }

    // Update fee_data: status -> PENDING, reset validator, mark clarification_submitted
    await db.query(
      `UPDATE fee_data
       SET status = 'PENDING',
           validator_id = NULL,
           validation_notes = NULL,
           validated_at = NULL,
           clarification_submitted = TRUE,
           updated_at = NOW()
       WHERE id = $1`,
      [id]
    );

    await logAudit(req.user.id, 'CLARIFICATION_SUBMITTED', 'FEE_DATA', id, { clarification: clarification.trim() }, req.ip, req.headers['user-agent']);

    res.json({ message: 'Clarification submitted successfully', status: 'PENDING' });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/cross-division-data/:id/clarification
 * Contributor submits clarification for a cross-division data item
 * Changes status back to PENDING and marks clarification_submitted = true
 */
router.post('/cross-division-data/:id/clarification', authenticateToken, authorizeRole(['CONTRIBUTOR']), async (req, res, next) => {
  try {
    const { id } = req.params;
    const { clarification } = req.body;

    if (!clarification || !clarification.trim()) {
      throw new ValidationError('Clarification text is required');
    }

    // Verify ownership and current status
    const { rows } = await db.query(
      'SELECT * FROM cross_division_data WHERE id = $1 AND contributor_id = $2',
      [id, req.user.id]
    );

    if (rows.length === 0) {
      throw new ValidationError('Data tidak ditemukan atau bukan milik Anda');
    }

    const crossData = rows[0];
    if (crossData.status !== 'NEED_CLARIFICATION') {
      throw new ValidationError('Data tidak dalam status NEED_CLARIFICATION');
    }

    // Get the latest clarification request for this data
    const { rows: clarRows } = await db.query(
      `SELECT * FROM clarification_history
       WHERE data_id = $1 AND data_type = 'CROSS_DIVISION_DATA'
       ORDER BY requested_at DESC LIMIT 1`,
      [id]
    );

    // Update clarification history with response
    if (clarRows.length > 0) {
      await db.query(
        `UPDATE clarification_history
         SET responded_by = $1, responded_at = NOW(), response_notes = $2
         WHERE id = $3`,
        [req.user.id, clarification.trim(), clarRows[0].id]
      );
    } else {
      await db.query(
        `INSERT INTO clarification_history (data_id, data_type, requested_by, request_notes, responded_by, responded_at, response_notes)
         VALUES ($1, 'CROSS_DIVISION_DATA', $2, 'Clarification requested', $2, NOW(), $3)`,
        [id, req.user.id, clarification.trim()]
      );
    }

    // Update cross_division_data: status -> PENDING, reset validator, mark clarification_submitted
    await db.query(
      `UPDATE cross_division_data
       SET status = 'PENDING',
           validator_id = NULL,
           validation_notes = NULL,
           validated_at = NULL,
           clarification_submitted = TRUE,
           updated_at = NOW()
       WHERE id = $1`,
      [id]
    );

    await logAudit(req.user.id, 'CLARIFICATION_SUBMITTED', 'CROSS_DIVISION_DATA', id, { clarification: clarification.trim() }, req.ip, req.headers['user-agent']);

    res.json({ message: 'Clarification submitted successfully', status: 'PENDING' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;

