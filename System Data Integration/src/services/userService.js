const bcrypt = require('bcrypt');
const pool = require('../database/pool');

const VALID_ROLES = ['CONTRIBUTOR', 'VALIDATOR', 'PARTNER', 'SPV_MANAGER_PM'];

/**
 * Get all users (without password)
 */
async function getAllUsers() {
    const [rows] = await pool.query(
        `SELECT id, username, email, full_name, role, is_active, created_at, updated_at
     FROM users
     ORDER BY role, full_name`
    );
    return rows.map(u => ({
        id: u.id,
        username: u.username,
        email: u.email,
        fullName: u.full_name,
        role: u.role,
        isActive: Boolean(u.is_active),
        createdAt: u.created_at,
        updatedAt: u.updated_at
    }));
}

/**
 * Create a new user
 */
async function createUser({ username, password, email, fullName, role }) {
    if (!username || !password || !email || !fullName || !role) {
        throw new Error('Semua field wajib diisi');
    }
    if (!VALID_ROLES.includes(role)) {
        throw new Error('Role tidak valid');
    }

    // Check duplicate username/email
    const [existing] = await pool.query(
        'SELECT id FROM users WHERE username = ? OR email = ?',
        [username, email]
    );
    if (existing.length > 0) {
        throw new Error('Username atau email sudah digunakan');
    }

    const passwordHash = await bcrypt.hash(password, 10);

    await pool.query(
        `INSERT INTO users (id, username, password_hash, email, full_name, role, is_active)
     VALUES (UUID(), ?, ?, ?, ?, ?, TRUE)`,
        [username, passwordHash, email, fullName, role]
    );

    // Return the newly created user
    const [rows] = await pool.query(
        'SELECT id, username, email, full_name, role, is_active, created_at FROM users WHERE username = ?',
        [username]
    );
    const u = rows[0];
    return {
        id: u.id,
        username: u.username,
        email: u.email,
        fullName: u.full_name,
        role: u.role,
        isActive: Boolean(u.is_active),
        createdAt: u.created_at
    };
}

/**
 * Update a user's role
 */
async function updateUserRole(userId, role) {
    if (!VALID_ROLES.includes(role)) {
        throw new Error('Role tidak valid');
    }
    const [result] = await pool.query(
        'UPDATE users SET role = ? WHERE id = ?',
        [role, userId]
    );
    if (result.affectedRows === 0) {
        throw new Error('User tidak ditemukan');
    }
    return { success: true };
}

/**
 * Toggle user active status
 */
async function toggleUserStatus(userId) {
    const [rows] = await pool.query(
        'SELECT is_active FROM users WHERE id = ?',
        [userId]
    );
    if (rows.length === 0) {
        throw new Error('User tidak ditemukan');
    }
    const newStatus = !Boolean(rows[0].is_active);
    await pool.query(
        'UPDATE users SET is_active = ? WHERE id = ?',
        [newStatus, userId]
    );
    return { success: true, isActive: newStatus };
}

/**
 * Delete a user
 */
async function deleteUser(userId, requestingUserId) {
    if (userId === requestingUserId) {
        throw new Error('Tidak bisa menghapus akun sendiri');
    }
    const [result] = await pool.query(
        'DELETE FROM users WHERE id = ?',
        [userId]
    );
    if (result.affectedRows === 0) {
        throw new Error('User tidak ditemukan');
    }
    return { success: true };
}

module.exports = {
    getAllUsers,
    createUser,
    updateUserRole,
    toggleUserStatus,
    deleteUser
};
