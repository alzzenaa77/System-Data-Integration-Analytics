/**
 * ClarificationEntry Model
 * Represents clarification requests and responses in the clarification history
 * Requirements: 2.2, 3.2
 */

class ClarificationEntry {
  constructor(data) {
    this.id = data.id || null;
    this.dataId = data.data_id || data.dataId;
    this.dataType = data.data_type || data.dataType;
    this.requestedBy = data.requested_by || data.requestedBy;
    this.requestedAt = data.requested_at || data.requestedAt || null;
    this.requestNotes = data.request_notes || data.requestNotes;
    this.respondedBy = data.responded_by || data.respondedBy || null;
    this.respondedAt = data.responded_at || data.respondedAt || null;
    this.responseNotes = data.response_notes || data.responseNotes || null;
  }

  /**
   * Validate clarification entry data
   * @returns {Object} { valid: boolean, errors: string[] }
   */
  validate() {
    const errors = [];

    if (!this.dataId) {
      errors.push('Data ID is required');
    }

    if (!this.dataType || !['FEE_DATA', 'CROSS_DIVISION_DATA'].includes(this.dataType)) {
      errors.push('Valid data type is required (FEE_DATA or CROSS_DIVISION_DATA)');
    }

    if (!this.requestedBy) {
      errors.push('Requested by (validator ID) is required');
    }

    if (!this.requestNotes || this.requestNotes.trim().length === 0) {
      errors.push('Request notes are required');
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
      data_id: this.dataId,
      data_type: this.dataType,
      requested_by: this.requestedBy,
      requested_at: this.requestedAt,
      request_notes: this.requestNotes,
      responded_by: this.respondedBy,
      responded_at: this.respondedAt,
      response_notes: this.responseNotes
    };
  }

  /**
   * Convert to JSON for API responses
   */
  toJSON() {
    return {
      id: this.id,
      dataId: this.dataId,
      dataType: this.dataType,
      requestedBy: this.requestedBy,
      requestedAt: this.requestedAt,
      requestNotes: this.requestNotes,
      respondedBy: this.respondedBy,
      respondedAt: this.respondedAt,
      responseNotes: this.responseNotes
    };
  }
}

module.exports = { ClarificationEntry };
