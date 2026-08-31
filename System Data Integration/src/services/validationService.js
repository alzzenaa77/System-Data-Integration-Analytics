const pool = require('../database/pool');
const { getFeeDataById, getCrossDivisionDataById } = require('./dataService');
const { sendNotification } = require('./notificationService');
const { awardPoints } = require('./pointService');

/**
 * Validation Service
 * Requirements: 4.4, 4.5, 4.6, 5.3, 5.4, 5.5
 */

const POINTS_PER_DATA = 5;

async function validateFeeData(dataId, validatorId, decision, notes) {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();
    
    const data = await getFeeDataById(dataId);
    if (!data) {
      throw new Error('Data tidak ditemukan');
    }
    
    if (data.status === 'ACCEPTED' || data.status === 'REJECTED') {
      throw new Error('Data sudah divalidasi sebelumnya');
    }
    
    let newStatus;
    let pointsAwarded = 0;
    
    switch (decision) {
      case 'ACCEPT':
        newStatus = 'ACCEPTED';
        await connection.query(
          `UPDATE fee_data 
          SET status = ?, validation_notes = ?, validator_id = ?, validated_at = NOW(), updated_at = NOW()
          WHERE id = ?`,
          [newStatus, notes, validatorId, dataId]
        );
        
        const pointsResult = await awardPoints(data.contributor_id, dataId, 'FEE_DATA', POINTS_PER_DATA);
        pointsAwarded = POINTS_PER_DATA;
        await sendNotification(data.contributor_id, 'DATA_ACCEPTED', `Data fee Anda telah diterima. Anda mendapat ${POINTS_PER_DATA} poin!`, { dataId, points: pointsAwarded });
        break;
        
      case 'REJECT':
        newStatus = 'REJECTED';
        await connection.query(
          `UPDATE fee_data 
          SET status = ?, validation_notes = ?, validator_id = ?, validated_at = NOW(), updated_at = NOW()
          WHERE id = ?`,
          [newStatus, notes, validatorId, dataId]
        );
        
        await sendNotification(data.contributor_id, 'DATA_REJECTED', 'Data fee Anda ditolak', { dataId, reason: notes });
        break;
        
      case 'NEED_CLARIFICATION':
        newStatus = 'NEED_CLARIFICATION';
        await connection.query(
          `UPDATE fee_data 
          SET status = ?, validation_notes = ?, validator_id = ?, validated_at = NOW(), updated_at = NOW()
          WHERE id = ?`,
          [newStatus, notes, validatorId, dataId]
        );
        
        await connection.query(
          `INSERT INTO clarification_history (data_id, data_type, requested_by, request_notes)
          VALUES (?, 'FEE_DATA', ?, ?)`,
          [dataId, validatorId, notes]
        );
        
        await sendNotification(data.contributor_id, 'CLARIFICATION_NEEDED', 'Data fee Anda memerlukan klarifikasi', { dataId, notes });
        break;
        
      default:
        throw new Error('Invalid decision');
    }
    
    await connection.commit();
    
    return {
      success: true,
      dataId,
      newStatus,
      pointsAwarded
    };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

async function validateCrossDivisionData(dataId, validatorId, decision, notes) {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();
    
    const data = await getCrossDivisionDataById(dataId);
    if (!data) {
      throw new Error('Data tidak ditemukan');
    }
    
    if (data.status === 'ACCEPTED' || data.status === 'REJECTED') {
      throw new Error('Data sudah divalidasi sebelumnya');
    }
    
    let newStatus;
    let pointsAwarded = 0;
    
    switch (decision) {
      case 'ACCEPT':
        newStatus = 'ACCEPTED';
        await connection.query(
          `UPDATE cross_division_data 
          SET status = ?, validation_notes = ?, validator_id = ?, validated_at = NOW(), updated_at = NOW()
          WHERE id = ?`,
          [newStatus, notes, validatorId, dataId]
        );
        
        const pointsResult = await awardPoints(data.contributor_id, dataId, 'CROSS_DIVISION_DATA', POINTS_PER_DATA);
        pointsAwarded = POINTS_PER_DATA;
        await sendNotification(data.contributor_id, 'DATA_ACCEPTED', `Data cross-division Anda telah diterima. Anda mendapat ${POINTS_PER_DATA} poin!`, { dataId, points: pointsAwarded });
        break;
        
      case 'REJECT':
        newStatus = 'REJECTED';
        await connection.query(
          `UPDATE cross_division_data 
          SET status = ?, validation_notes = ?, validator_id = ?, validated_at = NOW(), updated_at = NOW()
          WHERE id = ?`,
          [newStatus, notes, validatorId, dataId]
        );
        
        await sendNotification(data.contributor_id, 'DATA_REJECTED', 'Data cross-division Anda ditolak', { dataId, reason: notes });
        break;
        
      case 'NEED_CLARIFICATION':
        newStatus = 'NEED_CLARIFICATION';
        await connection.query(
          `UPDATE cross_division_data 
          SET status = ?, validation_notes = ?, validator_id = ?, validated_at = NOW(), updated_at = NOW()
          WHERE id = ?`,
          [newStatus, notes, validatorId, dataId]
        );
        
        await connection.query(
          `INSERT INTO clarification_history (data_id, data_type, requested_by, request_notes)
          VALUES (?, 'CROSS_DIVISION_DATA', ?, ?)`,
          [dataId, validatorId, notes]
        );
        
        await sendNotification(data.contributor_id, 'CLARIFICATION_NEEDED', 'Data cross-division Anda memerlukan klarifikasi', { dataId, notes });
        break;
        
      default:
        throw new Error('Invalid decision');
    }
    
    await connection.commit();
    
    return {
      success: true,
      dataId,
      newStatus,
      pointsAwarded
    };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

async function getPendingValidations() {
  const [feeDataRows] = await pool.query(
    `SELECT * FROM fee_data WHERE status IN ('PENDING', 'NEED_CLARIFICATION') ORDER BY created_at DESC`
  );
  
  const [crossDataRows] = await pool.query(
    `SELECT * FROM cross_division_data WHERE status IN ('PENDING', 'NEED_CLARIFICATION') ORDER BY created_at DESC`
  );
  
  return {
    feeData: feeDataRows,
    crossDivisionData: crossDataRows
  };
}

module.exports = {
  validateFeeData,
  validateCrossDivisionData,
  getPendingValidations
};
