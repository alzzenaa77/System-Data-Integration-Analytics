-- CLEAN DATABASE - Hapus Semua Data Lama
-- Jalankan script ini via MySQL command line atau phpMyAdmin

USE fee_intelligence;

-- Hapus semua data lama
DELETE FROM fee_data;
DELETE FROM cross_division_data;
DELETE FROM clarification_history;
DELETE FROM notifications;
DELETE FROM point_transactions;
DELETE FROM audit_logs;

-- Reset auto increment
ALTER TABLE fee_data AUTO_INCREMENT = 1;
ALTER TABLE cross_division_data AUTO_INCREMENT = 1;
ALTER TABLE clarification_history AUTO_INCREMENT = 1;
ALTER TABLE notifications AUTO_INCREMENT = 1;
ALTER TABLE point_transactions AUTO_INCREMENT = 1;
ALTER TABLE audit_logs AUTO_INCREMENT = 1;

-- Verify - semua table harus kosong
SELECT 'fee_data' as table_name, COUNT(*) as count FROM fee_data
UNION ALL
SELECT 'cross_division_data', COUNT(*) FROM cross_division_data
UNION ALL
SELECT 'users', COUNT(*) FROM users;

-- Users harus tetap ada (4 users)
SELECT * FROM users;
