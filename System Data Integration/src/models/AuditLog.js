/**
 * AuditLog Model
 * Represents audit trail for system operations
 * Requirements: 2.2, 3.2
 */

class AuditLog {
  constructor(data) {
    this.id = data.id || null;
    this.userId = data.user_id || data.userId || null;
    this.action = data.action;
    this.resourceType = data.resource_type || data.resourceType;
    this.resourceId = data.resource_id || data.resourceId || null;
    this.changes = data.changes || null;
    this.ipAddress = data.ip_address || data.ipAddress || null;
    this.userAgent = data.user_agent || data.userAgent || null;
    this.createdAt = data.created_at || data.createdAt || null;
  }

  /**
   * Validate audit log data
   * @returns {Object} { valid: boolean, errors: string[] }
   */
  validate() {
    const errors = [];

    if (!this.action || this.action.trim().length === 0) {
      errors.push('Action is required');
    }

    if (!this.resourceType || this.resourceType.trim().length === 0) {
      errors.push('Resource type is required');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Convert to database format
   */
  toDatabase() {
    return {
      id: this.id,
      user_id: this.userId,
      action: this.action,
      resource_type: this.resourceType,
      resource_id: this.resourceId,
      changes: this.changes,
      ip_address: this.ipAddress,
      user_agent: this.userAgent,
      created_at: this.createdAt
    };
  }

  /**
   * Convert to JSON for API responses
   */
  toJSON() {
    return {
      id: this.id,
      userId: this.userId,
      action: this.action,
      resourceType: this.resourceType,
      resourceId: this.resourceId,
      changes: this.changes,
      ipAddress: this.ipAddress,
      userAgent: this.userAgent,
      createdAt: this.createdAt
    };
  }
}

module.exports = { AuditLog };
