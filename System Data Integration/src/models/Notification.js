/**
 * Notification Model
 * Represents in-app notifications for users
 * Requirements: 2.2, 3.2
 */

const NOTIFICATION_TYPE = {
  NEW_DATA_SUBMITTED: 'NEW_DATA_SUBMITTED',
  VALIDATION_REQUIRED: 'VALIDATION_REQUIRED',
  CLARIFICATION_NEEDED: 'CLARIFICATION_NEEDED',
  DATA_ACCEPTED: 'DATA_ACCEPTED',
  DATA_REJECTED: 'DATA_REJECTED',
  POINTS_EARNED: 'POINTS_EARNED'
};

class Notification {
  constructor(data) {
    this.id = data.id || null;
    this.userId = data.user_id || data.userId;
    this.type = data.type;
    this.message = data.message;
    this.metadata = data.metadata || null;
    this.isRead = data.is_read !== undefined ? data.is_read : data.isRead !== undefined ? data.isRead : false;
    this.createdAt = data.created_at || data.createdAt || null;
    this.readAt = data.read_at || data.readAt || null;
  }

  /**
   * Validate notification data
   * @returns {Object} { valid: boolean, errors: string[] }
   */
  validate() {
    const errors = [];

    if (!this.userId) {
      errors.push('User ID is required');
    }

    if (!this.type || !Object.values(NOTIFICATION_TYPE).includes(this.type)) {
      errors.push('Valid notification type is required');
    }

    if (!this.message || this.message.trim().length === 0) {
      errors.push('Message is required');
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
      type: this.type,
      message: this.message,
      metadata: this.metadata,
      is_read: this.isRead,
      created_at: this.createdAt,
      read_at: this.readAt
    };
  }

  /**
   * Convert to JSON for API responses
   */
  toJSON() {
    return {
      id: this.id,
      userId: this.userId,
      type: this.type,
      message: this.message,
      metadata: this.metadata,
      isRead: this.isRead,
      createdAt: this.createdAt,
      readAt: this.readAt
    };
  }
}

module.exports = { Notification, NOTIFICATION_TYPE };
