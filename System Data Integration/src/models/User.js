/**
 * User Model
 * Represents a user in the Fee Intelligence system
 * Requirements: 2.2, 3.2
 */

const USER_ROLES = {
  CONTRIBUTOR: 'CONTRIBUTOR',
  VALIDATOR: 'VALIDATOR',
  PARTNER: 'PARTNER',
  SPV_MANAGER_PM: 'SPV_MANAGER_PM'
};

class User {
  constructor(data) {
    this.id = data.id || null;
    this.username = data.username;
    this.passwordHash = data.password_hash || data.passwordHash;
    this.email = data.email;
    this.fullName = data.full_name || data.fullName;
    this.role = data.role;
    this.isActive = data.is_active !== undefined ? data.is_active : data.isActive !== undefined ? data.isActive : true;
    this.createdAt = data.created_at || data.createdAt || null;
    this.updatedAt = data.updated_at || data.updatedAt || null;
  }

  /**
   * Validate user data
   * @returns {Object} { valid: boolean, errors: string[] }
   */
  validate() {
    const errors = [];

    if (!this.username || this.username.trim().length === 0) {
      errors.push('Username is required');
    }

    if (!this.email || this.email.trim().length === 0) {
      errors.push('Email is required');
    } else if (!this.isValidEmail(this.email)) {
      errors.push('Email format is invalid');
    }

    if (!this.fullName || this.fullName.trim().length === 0) {
      errors.push('Full name is required');
    }

    if (!this.role || !Object.values(USER_ROLES).includes(this.role)) {
      errors.push('Valid role is required (CONTRIBUTOR, VALIDATOR, PARTNER, SPV_MANAGER_PM)');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Basic email validation
   */
  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Convert to database format
   */
  toDatabase() {
    return {
      id: this.id,
      username: this.username,
      password_hash: this.passwordHash,
      email: this.email,
      full_name: this.fullName,
      role: this.role,
      is_active: this.isActive,
      created_at: this.createdAt,
      updated_at: this.updatedAt
    };
  }

  /**
   * Convert to JSON (safe for API responses - excludes password)
   */
  toJSON() {
    return {
      id: this.id,
      username: this.username,
      email: this.email,
      fullName: this.fullName,
      role: this.role,
      isActive: this.isActive,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }
}

module.exports = { User, USER_ROLES };
