const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../database/pool');

const JWT_SECRET = process.env.JWT_SECRET || 'default_secret_key';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

/**
 * Login user and generate JWT token
 * @param {string} username - User's username
 * @param {string} password - User's password
 * @returns {Promise<Object>} AuthResult with token and user info
 */
async function login(username, password) {
  try {
    // Get user from database
    const [rows] = await pool.query(
      'SELECT id, username, password_hash, email, full_name, role, is_active FROM users WHERE username = ?',
      [username]
    );

    if (rows.length === 0) {
      return {
        success: false,
        error: 'Username atau password salah'
      };
    }

    const user = rows[0];

    // Check if user is active
    if (!user.is_active) {
      return {
        success: false,
        error: 'Akun tidak aktif'
      };
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      return {
        success: false,
        error: 'Username atau password salah'
      };
    }

    // Generate JWT token
    const expiresIn = JWT_EXPIRES_IN;
    const expiresAt = new Date(Date.now() + parseExpiry(expiresIn));

    const token = jwt.sign(
      {
        userId: user.id,
        role: user.role,
        username: user.username
      },
      JWT_SECRET,
      { expiresIn }
    );

    return {
      success: true,
      token,
      userId: user.id,
      role: user.role,
      username: user.username,
      email: user.email,
      fullName: user.full_name,
      expiresAt: expiresAt.toISOString()
    };
  } catch (error) {
    console.error('Login error:', error);
    throw new Error('Terjadi kesalahan saat login');
  }
}

/**
 * Validate JWT token
 * @param {string} token - JWT token to validate
 * @returns {Object} TokenValidation result
 */
function validateToken(token) {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return {
      valid: true,
      userId: decoded.userId,
      role: decoded.role,
      username: decoded.username
    };
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return {
        valid: false,
        error: 'Session telah berakhir, silakan login kembali'
      };
    }
    return {
      valid: false,
      error: 'Token tidak valid'
    };
  }
}

/**
 * Parse expiry string to milliseconds
 * @param {string} expiryStr - Expiry string like '24h', '7d'
 * @returns {number} Milliseconds
 */
function parseExpiry(expiryStr) {
  const match = expiryStr.match(/^(\d+)([smhd])$/);
  if (!match) return 24 * 60 * 60 * 1000; // default 24 hours

  const value = parseInt(match[1]);
  const unit = match[2];

  const multipliers = {
    s: 1000,
    m: 60 * 1000,
    h: 60 * 60 * 1000,
    d: 24 * 60 * 60 * 1000
  };

  return value * multipliers[unit];
}

module.exports = {
  login,
  validateToken
};
