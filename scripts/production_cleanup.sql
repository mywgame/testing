-- ==============================================================================
-- MetaFirm Production Cleanup Script
-- Target: Preserves ONLY SUPERADMIN accounts & System/Treasury Configurations
-- Safe execution: Uses explicit DELETE in dependency order within a transaction
-- ==============================================================================

BEGIN;

-- Helper temporary table for non-SUPERADMIN user IDs
CREATE TEMP TABLE temp_non_superadmin_users AS
SELECT id FROM users WHERE role IS NULL OR role != 'SUPERADMIN';

-- 1. Operational Queues & Jobs
DELETE FROM sweep_queue;
DELETE FROM treasury_sweep_jobs;

-- 2. Support System
DELETE FROM support_messages WHERE user_id IN (SELECT id FROM temp_non_superadmin_users);
DELETE FROM support_tickets WHERE user_id IN (SELECT id FROM temp_non_superadmin_users);

-- 3. Earnings & Commissions
DELETE FROM claims WHERE user_id IN (SELECT id FROM temp_non_superadmin_users);
DELETE FROM team_commission_history WHERE user_id IN (SELECT id FROM temp_non_superadmin_users);
DELETE FROM referral_income_history WHERE user_id IN (SELECT id FROM temp_non_superadmin_users);
DELETE FROM referral_relationships WHERE referrer_id IN (SELECT id FROM temp_non_superadmin_users) OR referee_id IN (SELECT id FROM temp_non_superadmin_users);
DELETE FROM income_history WHERE user_id IN (SELECT id FROM temp_non_superadmin_users);
DELETE FROM salary_history WHERE user_id IN (SELECT id FROM temp_non_superadmin_users);

-- 4. Activity, Audit & Logs
DELETE FROM activity_logs WHERE user_id IN (SELECT id FROM temp_non_superadmin_users);
DELETE FROM audit_logs WHERE user_id IN (SELECT id FROM temp_non_superadmin_users);
DELETE FROM notifications WHERE user_id IN (SELECT id FROM temp_non_superadmin_users);
DELETE FROM achievements WHERE user_id IN (SELECT id FROM temp_non_superadmin_users);
DELETE FROM vip_history WHERE user_id IN (SELECT id FROM temp_non_superadmin_users);
DELETE FROM vip_status WHERE user_id IN (SELECT id FROM temp_non_superadmin_users);

-- 5. Financial Core (Transactions, Withdrawals, Deposits, Addresses, Wallets)
DELETE FROM transactions WHERE user_id IN (SELECT id FROM temp_non_superadmin_users);
DELETE FROM withdrawals WHERE user_id IN (SELECT id FROM temp_non_superadmin_users);
DELETE FROM deposits WHERE user_id IN (SELECT id FROM temp_non_superadmin_users);
DELETE FROM deposit_addresses WHERE user_id IN (SELECT id FROM temp_non_superadmin_users);
DELETE FROM wallets WHERE user_id IN (SELECT id FROM temp_non_superadmin_users);

-- 6. User Auth & Settings
DELETE FROM sessions WHERE user_id IN (SELECT id FROM temp_non_superadmin_users);
DELETE FROM user_settings WHERE user_id IN (SELECT id FROM temp_non_superadmin_users);

-- 7. User Accounts
DELETE FROM users WHERE id IN (SELECT id FROM temp_non_superadmin_users);

DROP TABLE temp_non_superadmin_users;

COMMIT;

-- ==============================================================================
-- POST-CLEANUP VERIFICATION CHECKS
-- ==============================================================================
SELECT 'SUPERADMIN Users Preserved' AS metric, COUNT(*) AS count FROM users WHERE role = 'SUPERADMIN'
UNION ALL
SELECT 'Non-SUPERADMIN Users (Should be 0)', COUNT(*) FROM users WHERE role IS NULL OR role != 'SUPERADMIN'
UNION ALL
SELECT 'System Settings (Preserved)', COUNT(*) FROM system_settings
UNION ALL
SELECT 'Treasury Wallets Config (Preserved)', COUNT(*) FROM treasury_wallets
UNION ALL
SELECT 'Wallets (Non-SUPERADMIN)', COUNT(*) FROM wallets WHERE user_id NOT IN (SELECT id FROM users WHERE role = 'SUPERADMIN')
UNION ALL
SELECT 'Deposit Addresses (Non-SUPERADMIN)', COUNT(*) FROM deposit_addresses WHERE user_id NOT IN (SELECT id FROM users WHERE role = 'SUPERADMIN')
UNION ALL
SELECT 'Deposits Remaining', COUNT(*) FROM deposits
UNION ALL
SELECT 'Withdrawals Remaining', COUNT(*) FROM withdrawals
UNION ALL
SELECT 'Transactions Remaining', COUNT(*) FROM transactions
UNION ALL
SELECT 'Income History Remaining', COUNT(*) FROM income_history
UNION ALL
SELECT 'Referral Relationships Remaining', COUNT(*) FROM referral_relationships
UNION ALL
SELECT 'Sweep Queue Remaining', COUNT(*) FROM sweep_queue
UNION ALL
SELECT 'Treasury Sweep Jobs Remaining', COUNT(*) FROM treasury_sweep_jobs;
