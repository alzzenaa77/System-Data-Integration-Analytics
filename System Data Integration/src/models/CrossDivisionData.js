/**
 * CrossDivisionData Model
 * Represents cross-functional division data in the system
 * Requirements: 2.2, 3.2
 */

const { VALIDATION_STATUS } = require('./FeeData');

class CrossDivisionData {
  constructor(data) {
    this.id = data.id || null;
    this.contributorId = data.contributor_id || data.contributorId;
    this.title = data.title;
    this.divisionCategory = data.division_category || data.divisionCategory;
    this.description = data.description;
    this.submissionDate = data.submission_date || data.submissionDate;
    this.attachmentUrl = data.attachment_url || data.attachmentUrl || null;
    this.status = data.status || VALIDATION_STATUS.PENDING;
    this.validatorId = data.validator_id || data.validatorId || null;
    this.validationNotes = data.validation_notes || data.validationNotes || null;
    this.validatedAt = data.validated_at || data.validatedAt || null;
    this.createdAt = data.created_at || data.createdAt || null;
    this.updatedAt = data.updated_at || data.updatedAt || null;
  }

  /**
   * Validate cross-division data
   * @returns {Object} { valid: boolean, errors: string[] }
   */
  validate() {
    const errors = [];

    if (!this.contributorId) {
      errors.push('Contributor ID is required');
    }

    if (!this.title || this.title.trim().length === 0) {
      errors.push('Title is required');
    }

    if (!this.divisionCategory || this.divisionCategory.trim().length === 0) {
      errors.push('Division category is required');
    }

    if (!this.description || this.description.trim().length === 0) {
      errors.push('Description is required');
    }

    if (!this.submissionDate) {
      errors.push('Submission date is required');
    }

    if (this.status && !Object.values(VALIDATION_STATUS).includes(this.status)) {
      errors.push('Invalid validation status');
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
      title: this.title,
      division_category: this.divisionCategory,
      description: this.description,
      submission_date: this.submissionDate,
      attachment_url: this.attachmentUrl,
      status: this.status,
      validator_id: this.validatorId,
      validation_notes: this.validationNotes,
      validated_at: this.validatedAt,
      created_at: this.createdAt,
      updated_at: this.updatedAt
    };
  }

  /**
   * Convert to JSON for API responses
   */
  toJSON() {
    return {
      id: this.id,
      contributorId: this.contributorId,
      title: this.title,
      divisionCategory: this.divisionCategory,
      description: this.description,
      submissionDate: this.submissionDate,
      attachmentUrl: this.attachmentUrl,
      status: this.status,
      validatorId: this.validatorId,
      validationNotes: this.validationNotes,
      validatedAt: this.validatedAt,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }
}

module.exports = { CrossDivisionData };
