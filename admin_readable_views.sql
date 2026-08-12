-- ============================================================================
-- MetaFirm — Neon Console Readability Views
-- ============================================================================
-- Purpose: Make records in the Neon Table view human-identifiable (DS User ID,
--          Email, formatted $ amounts) WITHOUT touching any real table.
--
-- These are pure SQL VIEWS — they store nothing. Every query re-computes the
-- join live from the existing tables. This means:
--   - No schema change to deposits / transactions / wallets / withdrawals /
--     deposit_addresses / users. Every original column (including user_id,
--     wallet_id, and every other UUID) stays exactly as it is.
--   - No data duplication. Email/name/DS User ID are never copied or stored
--     anywhere — they are read live from `users` on every query.
--   - No FK relationships are touched or bypassed.
--   - Fully additive — safe to run any time, safe to drop any time
--     (`DROP VIEW admin_deposits;` etc.) with zero impact on real data.
--
-- After running this, open Neon Console → Tables → these will appear
-- alongside your normal tables (Neon's Structure tab lists views too). Use
-- the existing 👁 "Manage columns" panel to hide whichever raw UUID columns
-- you don't want to look at — they are still there, just hideable, exactly
-- as you described.
--
-- Storage precision is NEVER reduced: every *_display column is an extra,
-- separate text column computed from the original numeric(20,8) value. The
-- original raw column (e.g. `amount`) is always still present in the view too.
-- ============================================================================


-- ----------------------------------------------------------------------------
-- 1. admin_deposits
-- ----------------------------------------------------------------------------
CREATE OR REPLACE VIEW admin_deposits AS
SELECT
  d.id,
  d.user_id,                                            -- original UUID, untouched
  u.user_id      AS ds_user_id,                          -- e.g. DS454550
  u.email        AS user_email,
  u.name         AS user_name,
  d.wallet_id,                                           -- original UUID, untouched
  d.reference_number,
  d.amount,                                               -- original numeric(20,8), untouched
  TO_CHAR(d.amount, 'FM$999,999,990.00') AS amount_display,
  d.status,
  d.tx_hash,
  d.network,
  d.deposit_address,
  d.admin_notes,
  d.created_at,
  d.updated_at
FROM deposits d
JOIN users u ON u.id = d.user_id;


-- ----------------------------------------------------------------------------
-- 2. admin_transactions
-- ----------------------------------------------------------------------------
CREATE OR REPLACE VIEW admin_transactions AS
SELECT
  t.id,
  t.user_id,
  u.user_id      AS ds_user_id,
  u.email        AS user_email,
  u.name         AS user_name,
  t.wallet_id,
  t.type,
  t.reference_id,
  t.amount,                                               -- original signed numeric(20,8)
  TO_CHAR(t.amount, 'FM$999,999,990.00') AS amount_display,
  t.balance_before,
  TO_CHAR(t.balance_before, 'FM$999,999,990.00') AS balance_before_display,
  t.balance_after,
  TO_CHAR(t.balance_after, 'FM$999,999,990.00') AS balance_after_display,
  t.status,
  t.description,
  t.created_by,
  t.created_at
FROM transactions t
JOIN users u ON u.id = t.user_id;


-- ----------------------------------------------------------------------------
-- 3. admin_wallets
-- ----------------------------------------------------------------------------
CREATE OR REPLACE VIEW admin_wallets AS
SELECT
  w.id,
  w.user_id,
  u.user_id      AS ds_user_id,
  u.email        AS user_email,
  u.name         AS user_name,
  w.available_balance,
  TO_CHAR(w.available_balance, 'FM$999,999,990.00') AS available_balance_display,
  w.locked_balance,
  TO_CHAR(w.locked_balance, 'FM$999,999,990.00') AS locked_balance_display,
  w.trial_balance,
  TO_CHAR(w.trial_balance, 'FM$999,999,990.00') AS trial_balance_display,
  w.trial_expires_at,
  w.total_deposited,
  TO_CHAR(w.total_deposited, 'FM$999,999,990.00') AS total_deposited_display,
  w.total_withdrawn,
  TO_CHAR(w.total_withdrawn, 'FM$999,999,990.00') AS total_withdrawn_display,
  w.total_earned,
  TO_CHAR(w.total_earned, 'FM$999,999,990.00') AS total_earned_display,
  w.daily_yield,
  w.referral_income,
  w.team_income,
  w.incentive_income,
  w.principal_balance,
  w.created_at,
  w.updated_at
FROM wallets w
JOIN users u ON u.id = w.user_id;


-- ----------------------------------------------------------------------------
-- 4. admin_withdrawals
-- ----------------------------------------------------------------------------
CREATE OR REPLACE VIEW admin_withdrawals AS
SELECT
  wd.id,
  wd.user_id,
  u.user_id      AS ds_user_id,
  u.email        AS user_email,
  u.name         AS user_name,
  wd.wallet_id,
  wd.amount,
  TO_CHAR(wd.amount, 'FM$999,999,990.00') AS amount_display,
  wd.fee,
  TO_CHAR(wd.fee, 'FM$999,999,990.00') AS fee_display,
  wd.net_amount,
  TO_CHAR(wd.net_amount, 'FM$999,999,990.00') AS net_amount_display,
  wd.status,
  wd.admin_approval_status,
  wd.wallet_address,
  wd.network,
  wd.tx_hash,
  wd.reference,
  wd.admin_notes,
  wd.created_at,
  wd.updated_at
FROM withdrawals wd
JOIN users u ON u.id = wd.user_id;


-- ----------------------------------------------------------------------------
-- 5. admin_deposit_addresses
-- ----------------------------------------------------------------------------
CREATE OR REPLACE VIEW admin_deposit_addresses AS
SELECT
  da.id,
  da.user_id,
  u.user_id      AS ds_user_id,
  u.email        AS user_email,
  u.name         AS user_name,
  da.network,
  da.address,
  da.derivation_index,
  da.on_chain_balance,
  TO_CHAR(da.on_chain_balance, 'FM$999,999,990.00') AS on_chain_balance_display,
  da.native_balance,
  da.created_at,
  da.updated_at
FROM deposit_addresses da
JOIN users u ON u.id = da.user_id;


-- ============================================================================
-- To remove any of these later (fully reversible, touches nothing else):
--   DROP VIEW IF EXISTS admin_deposits;
--   DROP VIEW IF EXISTS admin_transactions;
--   DROP VIEW IF EXISTS admin_wallets;
--   DROP VIEW IF EXISTS admin_withdrawals;
--   DROP VIEW IF EXISTS admin_deposit_addresses;
-- ============================================================================
