/**
 * PointTransaction Model
 * Represents point reward transactions for contributors
 * Requirements: 2.2, 3.2
 */

const DATA_TYPE = {
  FEE_DATA: 'FEE_DATA',
  CROSS_DIVISION_DATA: 'CROSS_DIVISION_DATA'
};

class PointTransaction {
  constructor(data) {
    this.id = data.id || null;
    this.contributorId = data.contributor_id || data.contributorId;
    this.dataId = data.data_id || data.dataId;
    this.dataType = data.data_type || data.dataType;
    this.points = data.points;
    this.description = data.description;
    this.createdAt = data.created_at || data.createdAt || null;
  }

  /**
   * Validate point transaction data
   * @returns {Object} { valid: boolean, errors: string[] }
   */
  validate() {
    const errors = [];

    if (!this.contributorId) {
      errors.push('Contributor ID is required');
    }

    if (!this.dataId) {
      errors.push('Data ID is required');
    }

    if (!this.dataType || !Object.values(DATA_TYPE).includes(this.dataType)) {
      errors.push('Valid data type is required (FEE_DATA or CROSS_DIVISION_DATA)');
    }

    if (!this.points || this.points <= 0) {
      errors.push('Points must be a positive number');
    }

    if (!this.description || this.description.trim().length === 0) {
      errors.push('Description is required');
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
      contributor_id: this.contributorId,
      data_id: this.dataId,
      data_type: this.dataType,
      points: this.points,
      description: this.description,
      created_at: this.createdAt
    };
  }

  /**
   * Convert to JSON for API responses
   */
  toJSON() {
    return {
      id: this.id,
      contributorId: this.contributorId,
      dataId: this.dataId,
      dataType: this.dataType,
      points: this.points,
      description: this.description,
      createdAt: this.createdAt
    };
  }
}

module.exports = { PointTransaction, DATA_TYPE };
