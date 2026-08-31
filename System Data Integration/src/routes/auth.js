const express = require('express');
const router = express.Router();
const { login } = require('../services/authService');
const { authenticateToken } = require('../middleware/auth');
const { ValidationError } = require('../middleware/errors');
const pool = require('../database/pool');

/**
 * POST /api/auth/login
 * Login endpoint
 */
router.post('/login', async (req, res, next) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      throw new ValidationError('Username dan password wajib diisi');
    }
    
    const result = await login(username, password);
    
    // Check if login failed
    if (!result.success) {
      return res.status(401).json({
        error: {
          message: result.error,
          status: 401
        }
      });
    }
    
    // Return success response with token and user
    res.json({
      token: result.token,
      user: {
        id: result.userId,
        username: result.username,
        email: result.email,
        fullName: result.fullName,
        role: result.role
      },
      expiresAt: result.expiresAt
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/auth/me
 * Get current user info
 */
router.get('/me', authenticateToken, async (req, res, next) => {
  try {
    // Get full user details from database
    const [rows] = await pool.query(
      'SELECT id, username, email, full_name, role FROM users WHERE id = ?',
      [req.user.id]
    );
    
    if (rows.length === 0) {
      return res.status(404).json({
        error: {
          message: 'User tidak ditemukan',
          status: 404
        }
      });
    }
    
    const user = rows[0];
    
    res.json({
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        fullName: user.full_name,
        role: user.role
      }
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
