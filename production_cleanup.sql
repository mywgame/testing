-- MetaFirm production cleanup script
-- Purpose: remove pre-production testing data while preserving the single SUPERADMIN
-- account and all platform/system/treasury configuration.
--
-- DO NOT run this without first creating a Neon backup/branch.
-- This script is intentionally data-only:
-- - no schema changes
-- - no table drops
-- - no migration changes
-- - no SUPERADMIN reseed

BEGIN;

-- Safety gate: abort the transaction before deleting anything unless exactly
-- one SUPERADMIN account exists.
DO $$
DECLARE
  superadmin_count integer;
BEGIN
  SELECT COUNT(*) INTO superadmin_count
  FROM users
  WHERE role = 'SUPERADMIN';

  IF superadmin_count <> 1 THEN
    RAISE EXCEPTION
      'Cleanup aborted: expected exactly 1 SUPERADMIN, found %',
      superadmin_count;
  END IF;
END $$;

-- Reusable transaction-local preserved identity set.
CREATE TEMP TABLE preserved_superadmin_ids ON COMMIT DROP AS
SELECT id
FROM users
WHERE role = 'SUPERADMIN';

-- Break user self-references before deleting every non-SUPERADMIN user.
UPDATE users
SET parent_referral_id = NULL
WHERE parent_referral_id IS NOT NULL;

-- Clear pure operational/testing history. These rows are intentionally removed
-- for all users, including SUPERADMIN, to create a clean production launch state.
DELETE FROM team_commission_history;
DELETE FROM referral_income_history;
DELETE FROM referral_relationships;
DELETE FROM salary_history;
DELETE FROM income_history;
DELETE FROM sweep_queue;
DELETE FROM treasury_sweep_jobs;
DELETE FROM support_messages;
DELETE FROM support_tickets;
DELETE FROM claims;
DELETE FROM deposits;
DELETE FROM withdrawals;
DELETE FROM transactions;
DELETE FROM vip_history;
DELETE FROM achievements;
DELETE FROM notifications;
DELETE FROM activity_logs;
DELETE FROM audit_logs;
DELETE FROM sessions;

-- Preserve SUPERADMIN-owned deposit addresses, but remove links that could
-- block deletion of non-SUPERADMIN users or non-SUPERADMIN address rows.
UPDATE deposit_addresses
SET rotated_by = NULL
WHERE rotated_by IS NOT NULL
  AND rotated_by NOT IN (SELECT id FROM preserved_superadmin_ids);

UPDATE deposit_addresses da
SET replaced_by_address_id = NULL
WHERE da.user_id IN (SELECT id FROM preserved_superadmin_ids)
  AND da.replaced_by_address_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1
    FROM deposit_addresses kept
    WHERE kept.id = da.replaced_by_address_id
      AND kept.user_id IN (SELECT id FROM preserved_superadmin_ids)
  );

-- Selectively remove user-scoped state for every non-SUPERADMIN user.
-- Do not TRUNCATE these tables: SUPERADMIN rows must remain intact.
DELETE FROM deposit_addresses
WHERE user_id NOT IN (SELECT id FROM preserved_superadmin_ids);

DELETE FROM user_settings
WHERE user_id NOT IN (SELECT id FROM preserved_superadmin_ids);

DELETE FROM vip_status
WHERE user_id NOT IN (SELECT id FROM preserved_superadmin_ids);

DELETE FROM wallets
WHERE user_id NOT IN (SELECT id FROM preserved_superadmin_ids);

-- Remove every non-SUPERADMIN account. This intentionally removes ADMIN users
-- too; only role = 'SUPERADMIN' is preserved.
DELETE FROM users
WHERE role <> 'SUPERADMIN';

-- Verification section. These SELECTs are read-only and run before COMMIT so
-- the whole cleanup is still one transaction.
SELECT COUNT(*) AS superadmin_count
FROM users
WHERE role = 'SUPERADMIN';

SELECT user_id AS superadmin_ds_user_id
FROM users
WHERE role = 'SUPERADMIN';

SELECT
  u.user_id AS superadmin_ds_user_id,
  w.available_balance,
  w.locked_balance,
  w.principal_balance,
  w.trial_balance,
  w.referral_income,
  w.daily_yield,
  w.team_income,
  w.incentive_income,
  w.total_deposited,
  w.total_withdrawn,
  w.total_earned
FROM users u
LEFT JOIN wallets w ON w.user_id = u.id
WHERE u.role = 'SUPERADMIN';

SELECT
  u.user_id AS superadmin_ds_user_id,
  v.tier,
  v.points,
  v.level_a_valid_count,
  v.level_bcd_valid_count,
  v.team_total_count
FROM users u
LEFT JOIN vip_status v ON v.user_id = u.id
WHERE u.role = 'SUPERADMIN';

SELECT
  u.user_id AS superadmin_ds_user_id,
  da.network,
  da.address,
  da.derivation_index,
  da.is_active
FROM users u
LEFT JOIN deposit_addresses da ON da.user_id = u.id
WHERE u.role = 'SUPERADMIN'
ORDER BY da.network, da.is_active DESC, da.created_at;

SELECT COUNT(*) AS remaining_non_superadmin_users
FROM users
WHERE role <> 'SUPERADMIN';

SELECT COUNT(*) AS remaining_deposits
FROM deposits;

SELECT COUNT(*) AS remaining_withdrawals
FROM withdrawals;

SELECT COUNT(*) AS remaining_transactions
FROM transactions;

SELECT COUNT(*) AS remaining_sweep_queue_rows
FROM sweep_queue;

SELECT COUNT(*) AS remaining_treasury_sweep_jobs_rows
FROM treasury_sweep_jobs;

SELECT COUNT(*) AS remaining_treasury_wallets_rows
FROM treasury_wallets;

SELECT COUNT(*) AS remaining_system_settings_rows
FROM system_settings;

COMMIT;
