/**
 * VIP Qualification Regression Test Suite
 * Validates Section 6 & 7 of MetaFirm Business Logic Specification.
 */

import { db } from '../src/db/index.ts';
import { users, wallets, vipStatus, referralRelationships, deposits } from '../src/db/schema.ts';
import { eq } from 'drizzle-orm';
import { vipService } from '../server/services/vipService.ts';
import { depositService } from '../server/blockchain/services/DepositService.ts';
import { walletRepository } from '../server/repositories/walletRepository.ts';
import { vipRepository } from '../server/repositories/vipRepository.ts';
import { referralRepository } from '../server/repositories/referralRepository.ts';

let passed = 0;
let failed = 0;

function assert(condition: boolean, message: string) {
  if (condition) {
    console.log(`  ✅ PASS: ${message}`);
    passed++;
  } else {
    console.error(`  ❌ FAIL: ${message}`);
    failed++;
  }
}

async function runTests() {
  console.log('\n========================================');
  console.log('🚀 RUNNING VIP QUALIFICATION REGRESSION SUITE');
  console.log('========================================\n');

  // TEST 1: Verify Alex (DS130480) Current Qualification & Upgrade
  console.log('--- Test 1: Alex (DS130480) Qualification Verification ---');
  const [alex] = await db.select().from(users).where(eq(users.userId, 'DS130480'));
  if (!alex) {
    throw new Error('Alex (DS130480) not found in database');
  }

  const alexCounts = await vipService.calculateTeamCounts(alex.id);
  assert(alexCounts.levelAValidCount >= 2, `Alex has at least 2 Level-A valid users (Actual: ${alexCounts.levelAValidCount})`);

  const alexWallet = await walletRepository.findByUserId(alex.id);
  const alexBal = parseFloat(alexWallet!.availableBalance) + parseFloat(alexWallet!.lockedBalance);
  assert(alexBal >= 50.0, `Alex has >= 50 USDT balance (Actual: ${alexBal.toFixed(2)} USDT)`);

  const alexVipBefore = await vipRepository.findByUserId(alex.id);
  const updatedAlexVip = await vipService.recalculateVip(alex.id);
  assert(updatedAlexVip?.tier === 'VIP2', `Alex is upgraded to VIP2 (Tier: ${updatedAlexVip?.tier})`);

  // TEST 2: Child $49 -> $50 triggers parent upgrade, while Child remains VIP1
  console.log('\n--- Test 2: Child $49 -> $50 triggers Parent VIP Upgrade (Child remains VIP1) ---');
  
  // Create mock parent and 2 mock children
  const timestamp = Date.now();
  const [testParent] = (await db.insert(users).values({
    uid: `uid_parent_${timestamp}`,
    userId: `TP${timestamp.toString().slice(-6)}`,
    username: `test_parent_${timestamp}`,
    email: `parent_${timestamp}@test.com`,
    referralCode: `REF_P_${timestamp.toString().slice(-6)}`,
    passwordHash: 'dummy',
    isActive: true,
    role: 'USER',
  }).returning()) as any[];

  const [testChild1] = (await db.insert(users).values({
    uid: `uid_child1_${timestamp}`,
    userId: `TC1${timestamp.toString().slice(-5)}`,
    username: `test_child1_${timestamp}`,
    email: `child1_${timestamp}@test.com`,
    referralCode: `REF_C1_${timestamp.toString().slice(-5)}`,
    passwordHash: 'dummy',
    isActive: true,
    role: 'USER',
    parentReferralId: testParent.id,
  }).returning()) as any[];

  const [testChild2] = (await db.insert(users).values({
    uid: `uid_child2_${timestamp}`,
    userId: `TC2${timestamp.toString().slice(-5)}`,
    username: `test_child2_${timestamp}`,
    email: `child2_${timestamp}@test.com`,
    referralCode: `REF_C2_${timestamp.toString().slice(-5)}`,
    passwordHash: 'dummy',
    isActive: true,
    role: 'USER',
    parentReferralId: testParent.id,
  }).returning()) as any[];

  // Create wallets
  const parentWallet = await walletRepository.createWallet({ userId: testParent.id });
  await walletRepository.incrementBalances(parentWallet.id, {
    availableBalance: '100.00000000',
    principalBalance: '100.00000000',
    totalDeposited: '100.00000000',
  });

  const child1Wallet = await walletRepository.createWallet({ userId: testChild1.id });
  await walletRepository.incrementBalances(child1Wallet.id, {
    availableBalance: '55.00000000',
    principalBalance: '55.00000000',
    totalDeposited: '55.00000000',
  });

  const child2Wallet = await walletRepository.createWallet({ userId: testChild2.id });
  await walletRepository.incrementBalances(child2Wallet.id, {
    availableBalance: '49.00000000',
    principalBalance: '49.00000000',
    totalDeposited: '49.00000000',
  });

  // Create VIP statuses (initially VIP1)
  await vipRepository.createVipStatus({
    userId: testParent.id,
    tier: 'VIP1',
    points: '100.00000000',
  });

  await vipRepository.createVipStatus({
    userId: testChild1.id,
    tier: 'VIP1',
    points: '55.00000000',
  });

  await vipRepository.createVipStatus({
    userId: testChild2.id,
    tier: 'VIP1',
    points: '49.00000000',
  });

  // Link referrals
  await referralRepository.createRelationship({
    parentId: testParent.id,
    childId: testChild1.id,
    referralLevel: 1,
  });

  await referralRepository.createRelationship({
    parentId: testParent.id,
    childId: testChild2.id,
    referralLevel: 1,
  });

  // Initially, child2 has $49, so parent only has 1 valid user -> parent must be VIP1
  await vipService.recalculateVip(testParent.id);
  const pVipInitial = await vipRepository.findByUserId(testParent.id);
  assert(pVipInitial?.tier === 'VIP1', `Parent starts as VIP1 with 1 valid child ($55) and 1 non-valid child ($49)`);

  // Now child2 balance changes from $49 -> $50 (e.g. +$1)
  await walletRepository.incrementBalances(child2Wallet.id, {
    availableBalance: '1.00000000',
    principalBalance: '1.00000000',
    totalDeposited: '1.00000000',
  });

  // Trigger recalculateUserAndUplines on child2
  await vipService.recalculateUserAndUplines(testChild2.id);

  const c2Vip = await vipRepository.findByUserId(testChild2.id);
  assert(c2Vip?.tier === 'VIP1', `Child2's own VIP tier remains VIP1 (0 referrals)`);

  const pVipAfter = await vipRepository.findByUserId(testParent.id);
  assert(pVipAfter?.tier === 'VIP2', `Parent VIP upgraded to VIP2 because Child2 reached $50 even though Child2 remained VIP1`);

  // TEST 3: Child $50 -> below $50 triggers Parent VIP Downgrade
  console.log('\n--- Test 3: Child drops below $50 triggers Parent VIP Downgrade ---');
  await walletRepository.incrementBalances(child2Wallet.id, {
    availableBalance: '-2.00000000',
  });

  // Recalculate via uplines
  await vipService.recalculateUserAndUplines(testChild2.id);

  const pVipDowngraded = await vipRepository.findByUserId(testParent.id);
  assert(pVipDowngraded?.tier === 'VIP1', `Parent VIP immediately downgraded to VIP1 when child balance dropped below $50 (Actual: ${pVipDowngraded?.tier})`);

  // TEST 4: Second / Subsequent Deposit triggers recalculation for depositor and upline
  console.log('\n--- Test 4: Second / Subsequent Deposit triggers VIP recalculation ---');
  // Child2 makes a 2nd deposit of $10 (total was $48, now $58)
  const [mockDep2] = (await db.insert(deposits).values({
    userId: testChild2.id,
    walletId: child2Wallet.id,
    depositAddress: '0xMockDepositAddress',
    network: 'USDT (BEP20)',
    amount: '10.00000000',
    status: 'PENDING',
    referenceNumber: `DEP_TEST_${Date.now()}`,
  }).returning()) as any[];

  // Process deposit via depositService
  await depositService.processSuccessfulDeposit(mockDep2.id);

  const pVipAfterDep2 = await vipRepository.findByUserId(testParent.id);
  assert(pVipAfterDep2?.tier === 'VIP2', `Parent VIP upgraded to VIP2 on Child's second deposit`);

  // TEST 5: One-Time Referral Reward is NOT paid on second deposit
  console.log('\n--- Test 5: One-Time Referral Reward Isolation ---');
  const parentIncomeHistory = await referralRepository.getReferralIncomeByUserId(testParent.id);
  // Parent should have 0 or at most 1 referral reward from child2 (none was simulated for first deposit)
  const child2Rewards = parentIncomeHistory.filter(r => r.sourceUserId === testChild2.id);
  assert(child2Rewards.length === 0, `No referral reward generated on second deposit (Referral reward count for child2: ${child2Rewards.length})`);

  // TEST 6: Trial Balance is EXCLUDED from VIP calculation
  console.log('\n--- Test 6: Trial Balance Excluded from VIP calculation ---');
  // Set child2 real balance to $10, and trial balance to $1000
  await walletRepository.updateBalances(child2Wallet.id, {
    availableBalance: '10.00000000',
    lockedBalance: '0.00000000',
    trialBalance: '1000.00000000',
  });

  await vipService.recalculateUserAndUplines(testChild2.id);

  const pVipWithTrial = await vipRepository.findByUserId(testParent.id);
  assert(pVipWithTrial?.tier === 'VIP1', `Parent is VIP1 because Child2's $1000 Trial Balance does NOT count towards valid user status (Actual: ${pVipWithTrial?.tier})`);

  console.log('\n========================================');
  console.log(`TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('========================================\n');

  if (failed > 0) {
    process.exit(1);
  }
  process.exit(0);
}

runTests().catch(err => {
  console.error('Test error:', err);
  process.exit(1);
});
