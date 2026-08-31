/**
 * Models Index
 * Central export for all data models
 * Requirements: 2.2, 3.2
 */

const { User, USER_ROLES } = require('./User');
const { FeeData, VALIDATION_STATUS } = require('./FeeData');
const { CrossDivisionData } = require('./CrossDivisionData');
const { Notification, NOTIFICATION_TYPE } = require('./Notification');
const { PointTransaction, DATA_TYPE } = require('./PointTransaction');
const { AuditLog } = require('./AuditLog');
const { ClarificationEntry } = require('./ClarificationEntry');

module.exports = {
  // Models
  User,
  FeeData,
  CrossDivisionData,
  Notification,
  PointTransaction,
  AuditLog,
  ClarificationEntry,
  
  // Enums/Constants
  USER_ROLES,
  VALIDATION_STATUS,
  NOTIFICATION_TYPE,
  DATA_TYPE
};
