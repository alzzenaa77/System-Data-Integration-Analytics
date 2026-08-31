const express = require('express');
const router = express.Router();
const { authenticateToken, authorizeRole } = require('../middleware/auth');
const { validateFeeData, validateCrossDivisionData, getPendingValidations } = require('../services/validationService');
const { getValidatorMonitoringDashboard } = require('../services/dashboardService');
const { logAudit } = require('../services/auditService');
const { ValidationError } = require('../middleware/errors');
const {
  getAllUsers,
  createUser,
  updateUserRole,
  toggleUserStatus,
  deleteUser
} = require('../services/userService');

/**
 * GET /api/validations/pending
 * Get pending validations
 */
router.get('/validations/pending', authenticateToken, authorizeRole(['VALIDATOR']), async (req, res, next) => {
  try {
    const data = await getPendingValidations();
    res.json(data);
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/fee-data/:id/validate
 * Validate fee data
 */
router.post('/fee-data/:id/validate', authenticateToken, authorizeRole(['VALIDATOR']), async (req, res, next) => {
  try {
    const { decision, notes } = req.body;

    if (!decision || !['ACCEPT', 'REJECT', 'NEED_CLARIFICATION'].includes(decision)) {
      throw new ValidationError('Decision harus ACCEPT, REJECT, atau NEED_CLARIFICATION');
    }

    if (!notes) {
      throw new ValidationError('Notes wajib diisi');
    }

    const result = await validateFeeData(req.params.id, req.user.id, decision, notes);

    await logAudit(req.user.id, 'VALIDATE', 'FEE_DATA', req.params.id, { decision, notes }, req.ip, req.headers['user-agent']);

    res.json(result);
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/cross-division-data/:id/validate
 * Validate cross-division data
 */
router.post('/cross-division-data/:id/validate', authenticateToken, authorizeRole(['VALIDATOR']), async (req, res, next) => {
  try {
    const { decision, notes } = req.body;

    if (!decision || !['ACCEPT', 'REJECT', 'NEED_CLARIFICATION'].includes(decision)) {
      throw new ValidationError('Decision harus ACCEPT, REJECT, atau NEED_CLARIFICATION');
    }

    if (!notes) {
      throw new ValidationError('Notes wajib diisi');
    }

    const result = await validateCrossDivisionData(req.params.id, req.user.id, decision, notes);

    await logAudit(req.user.id, 'VALIDATE', 'CROSS_DIVISION_DATA', req.params.id, { decision, notes }, req.ip, req.headers['user-agent']);

    res.json(result);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/dashboard/monitoring
 * Get validator monitoring dashboard
 */
router.get('/dashboard/monitoring', authenticateToken, authorizeRole(['VALIDATOR']), async (req, res, next) => {
  try {
    const stats = await getValidatorMonitoringDashboard();
    res.json(stats);
  } catch (error) {
    next(error);
  }
});

// ===========================================================
// USER CONTROL ENDPOINTS — hanya untuk VALIDATOR
// ===========================================================

/**
 * GET /api/users
 * List semua user
 */
router.get('/users', authenticateToken, authorizeRole(['VALIDATOR']), async (req, res, next) => {
  try {
    const users = await getAllUsers();
    res.json(users);
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/users
 * Buat user baru
 */
router.post('/users', authenticateToken, authorizeRole(['VALIDATOR']), async (req, res, next) => {
  try {
    const { username, password, email, fullName, role } = req.body;
    if (!username || !password || !email || !fullName || !role) {
      throw new ValidationError('Semua field wajib diisi (username, password, email, fullName, role)');
    }
    const newUser = await createUser({ username, password, email, fullName, role });
    await logAudit(req.user.id, 'CREATE_USER', 'USER', newUser.id, { username, role }, req.ip, req.headers['user-agent']);
    res.status(201).json(newUser);
  } catch (error) {
    if (error.message === 'Username atau email sudah digunakan') {
      return res.status(409).json({ error: { message: error.message, status: 409 } });
    }
    next(error);
  }
});

/**
 * PUT /api/users/:id/role
 * Ganti role user
 */
router.put('/users/:id/role', authenticateToken, authorizeRole(['VALIDATOR']), async (req, res, next) => {
  try {
    const { role } = req.body;
    if (!role) {
      throw new ValidationError('Role wajib diisi');
    }
    const result = await updateUserRole(req.params.id, role);
    await logAudit(req.user.id, 'UPDATE_ROLE', 'USER', req.params.id, { role }, req.ip, req.headers['user-agent']);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

/**
 * PUT /api/users/:id/toggle-status
 * Aktifkan / nonaktifkan user
 */
router.put('/users/:id/toggle-status', authenticateToken, authorizeRole(['VALIDATOR']), async (req, res, next) => {
  try {
    if (req.params.id === req.user.id) {
      return res.status(400).json({ error: { message: 'Tidak bisa mengubah status akun sendiri', status: 400 } });
    }
    const result = await toggleUserStatus(req.params.id);
    await logAudit(req.user.id, 'TOGGLE_STATUS', 'USER', req.params.id, { isActive: result.isActive }, req.ip, req.headers['user-agent']);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /api/users/:id
 * Hapus user
 */
router.delete('/users/:id', authenticateToken, authorizeRole(['VALIDATOR']), async (req, res, next) => {
  try {
    const result = await deleteUser(req.params.id, req.user.id);
    await logAudit(req.user.id, 'DELETE_USER', 'USER', req.params.id, {}, req.ip, req.headers['user-agent']);
    res.json(result);
  } catch (error) {
    if (error.message === 'Tidak bisa menghapus akun sendiri') {
      return res.status(400).json({ error: { message: error.message, status: 400 } });
    }
    next(error);
  }
});

module.exports = router;
