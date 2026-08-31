/**
 * FeeData Model
 * Represents fee competitor data in the system
 * Requirements: 2.2, 3.2
 */

const VALIDATION_STATUS = {
  PENDING: 'PENDING',
  NEED_CLARIFICATION: 'NEED_CLARIFICATION',
  ACCEPTED: 'ACCEPTED',
  REJECTED: 'REJECTED'
};

class FeeData {
  constructor(data) {
    this.id = data.id || null;
    this.contributorId = data.contributor_id || data.contributorId;
    
    // Identitas Pengisi (Submitter Identity)
    this.submitterName = data.submitter_name || data.submitterName;
    this.submitterDivision = data.submitter_division || data.submitterDivision;
    this.submitterInputDate = data.submitter_input_date || data.submitterInputDate;
    
    // Identitas (Service Provider & Recipient Identity)
    this.serviceProvider = data.service_provider || data.serviceProvider;
    this.serviceRecipient = data.service_recipient || data.serviceRecipient;
    
    // Detail Jasa (Service Details)
    this.serviceType = data.service_type || data.serviceType;
    this.scopeOfWork = data.scope_of_work || data.scopeOfWork;
    this.taxYear = data.tax_year || data.taxYear;
    
    // Financial Data
    this.financialType = data.financial_type || data.financialType;
    this.financialDescription = data.financial_description || data.financialDescription;
    this.feeScheme = data.fee_scheme || data.feeScheme;
    this.feeAmount = data.fee_amount || data.feeAmount;
    this.currency = data.currency || 'IDR';
    this.financialDate = data.financial_date || data.financialDate;
    
    // System fields
    this.status = data.status || VALIDATION_STATUS.PENDING;
    this.validatorId = data.validator_id || data.validatorId || null;
    this.validationNotes = data.validation_notes || data.validationNotes || null;
    this.validatedAt = data.validated_at || data.validatedAt || null;
    this.createdAt = data.created_at || data.createdAt || null;
    this.updatedAt = data.updated_at || data.updatedAt || null;
  }

  /**
   * Validate fee data
   * @returns {Object} { valid: boolean, errors: string[] }
   */
  validate() {
    const errors = [];

    if (!this.contributorId) {
      errors.push('Contributor ID is required');
    }

    // Identitas Pengisi validation
    if (!this.submitterName || this.submitterName.trim().length === 0) {
      errors.push('Submitter name is required');
    }
    if (!this.submitterDivision || this.submitterDivision.trim().length === 0) {
      errors.push('Submitter division is required');
    }
    if (!this.submitterInputDate) {
      errors.push('Submitter input date is required');
    }

    // Identitas validation
    if (!this.serviceProvider || this.serviceProvider.trim().length === 0) {
      errors.push('Service provider is required');
    }
    if (!this.serviceRecipient || this.serviceRecipient.trim().length === 0) {
      errors.push('Service recipient is required');
    }

    // Detail Jasa validation
    if (!this.serviceType || this.serviceType.trim().length === 0) {
      errors.push('Service type is required');
    }
    if (!this.scopeOfWork || this.scopeOfWork.trim().length === 0) {
      errors.push('Scope of work is required');
    }
    if (!this.taxYear || this.taxYear.trim().length === 0) {
      errors.push('Tax year is required');
    }

    // Financial Data validation
    if (!this.financialType || this.financialType.trim().length === 0) {
      errors.push('Financial type is required');
    }
    if (!this.financialDescription || this.financialDescription.trim().length === 0) {
      errors.push('Financial description is required');
    }
    if (!this.feeScheme || this.feeScheme.trim().length === 0) {
      errors.push('Fee scheme is required');
    }
    if (!this.feeAmount || this.feeAmount < 0) {
      errors.push('Fee amount must be a positive number');
    }
    if (!this.financialDate) {
      errors.push('Financial date is required');
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
      submitter_name: this.submitterName,
      submitter_division: this.submitterDivision,
      submitter_input_date: this.submitterInputDate,
      service_provider: this.serviceProvider,
      service_recipient: this.serviceRecipient,
      service_type: this.serviceType,
      scope_of_work: this.scopeOfWork,
      tax_year: this.taxYear,
      financial_type: this.financialType,
      financial_description: this.financialDescription,
      fee_scheme: this.feeScheme,
      fee_amount: this.feeAmount,
      currency: this.currency,
      financial_date: this.financialDate,
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
      submitterName: this.submitterName,
      submitterDivision: this.submitterDivision,
      submitterInputDate: this.submitterInputDate,
      serviceProvider: this.serviceProvider,
      serviceRecipient: this.serviceRecipient,
      serviceType: this.serviceType,
      scopeOfWork: this.scopeOfWork,
      taxYear: this.taxYear,
      financialType: this.financialType,
      financialDescription: this.financialDescription,
      feeScheme: this.feeScheme,
      feeAmount: this.feeAmount,
      currency: this.currency,
      financialDate: this.financialDate,
      status: this.status,
      validatorId: this.validatorId,
      validationNotes: this.validationNotes,
      validatedAt: this.validatedAt,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }
}

module.exports = { FeeData, VALIDATION_STATUS };
