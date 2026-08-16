/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { taskService, TASK_REWARDS_LAUNCH_DATE } from '../server/services/taskService.ts';
import { taskRepository } from '../server/repositories/taskRepository.ts';
import { referralRepository } from '../server/repositories/referralRepository.ts';
import { userRepository } from '../server/repositories/userRepository.ts';
import { walletRepository } from '../server/repositories/walletRepository.ts';
import { depositRepository } from '../server/repositories/depositRepository.ts';
import { settingsRepository } from '../server/repositories/settingsRepository.ts';
import { pool, db } from '../src/db/index.ts';
import { deposits, userTaskClaims, wallets, users } from '../src/db/schema.ts';
import { eq } from 'drizzle-orm';

interface ScenarioResult {
  scenario: string;
  name: string;
  passed: boolean;
  details: string;
}

const results: ScenarioResult[] = [];

async function runEligibilityScenarios() {
  console.log('================================================================');
  console.log('🔬 TASK & REWARDS ELIGIBILITY VERIFICATION SUITE (SCENARIOS A-E)');
  console.log('================================================================\n');

  try {
    // -------------------------------------------------------------------------
    // SCENARIO A: Brand-New User Zero-State
    // 0 referrals, 0 deposits, no 2FA, registered after referral
    // Expect: claimableTotal = 0, no unearned claimable cash rewards
    // -------------------------------------------------------------------------
    console.log('--- SCENARIO A: Brand-New User Zero-State ---');
    const uA = await userRepository.createUser({
      email: `qa_zero_state_${Date.now()}@example.com`,
      passwordHash: 'hash',
      name: 'QA Zero State User',
    });
    await walletRepository.createWallet({
      userId: uA.id,
      availableBalance: '0.00000000',
      principalBalance: '0.00000000',
      trialBalance: '100.00000000',
      trialExpiresAt: null,
    });

    const tasksA = await taskService.getUserTasks(uA.id);
    const authTaskA = tasksA.tasks.find((t) => t.taskCode === 'AUTHENTICATOR_SETUP');
    const refRegTaskA = tasksA.tasks.find((t) => t.taskCode === 'REFERRAL_REGISTRATION_SINGLE');
    const dep100TaskA = tasksA.tasks.find((t) => t.taskCode === 'DEPOSIT_MILESTONE_100');
    const ref3TaskA = tasksA.tasks.find((t) => t.taskCode === 'REFERRAL_MILESTONE_3');
    const ref5TaskA = tasksA.tasks.find((t) => t.taskCode === 'REFERRAL_MILESTONE_5');

    const passA =
      tasksA.summary.claimableTotal === 0 &&
      authTaskA?.status !== 'COMPLETED' &&
      refRegTaskA?.status !== 'COMPLETED' &&
      dep100TaskA?.status === 'LOCKED' &&
      dep100TaskA?.currentProgress === 0 &&
      ref3TaskA?.status === 'LOCKED' &&
      ref5TaskA?.status === 'LOCKED';

    results.push({
      scenario: 'Scenario A',
      name: 'Brand-New User Zero-State',
      passed: passA,
      details: `claimableTotal: $${tasksA.summary.claimableTotal}, dep100: ${dep100TaskA?.status} ($${dep100TaskA?.currentProgress}/$100), ref3: ${ref3TaskA?.status}, auth: ${authTaskA?.status}`,
    });
    console.log(`Scenario A: ${passA ? '✅ PASS' : '❌ FAIL'}\n`);

    // -------------------------------------------------------------------------
    // SCENARIO B: User With Trial Fund Only (Zero Real Deposit)
    // Trial Fund ($100) must NEVER contribute to deposit milestones
    // -------------------------------------------------------------------------
    console.log('--- SCENARIO B: User With Trial Fund Only ---');
    const uB = await userRepository.createUser({
      email: `qa_trial_only_${Date.now()}@example.com`,
      passwordHash: 'hash',
      name: 'QA Trial Only User',
    });
    await walletRepository.createWallet({
      userId: uB.id,
      availableBalance: '0.00000000',
      principalBalance: '0.00000000',
      trialBalance: '100.00000000',
      trialExpiresAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    });

    const realDepositsB = await taskService.getUserRealTotalDeposits(uB.id, TASK_REWARDS_LAUNCH_DATE);
    const tasksB = await taskService.getUserTasks(uB.id);
    const dep100TaskB = tasksB.tasks.find((t) => t.taskCode === 'DEPOSIT_MILESTONE_100');
    const dep500TaskB = tasksB.tasks.find((t) => t.taskCode === 'DEPOSIT_MILESTONE_500');

    let claimAttemptError = '';
    try {
      await taskService.claimTaskReward(uB.id, 'DEPOSIT_MILESTONE_100');
    } catch (err: any) {
      claimAttemptError = err.message;
    }

    const passB =
      realDepositsB === 0 &&
      dep100TaskB?.currentProgress === 0 &&
      dep100TaskB?.status === 'LOCKED' &&
      dep500TaskB?.currentProgress === 0 &&
      dep500TaskB?.status === 'LOCKED' &&
      claimAttemptError.includes('Deposit milestone requirement not met');

    results.push({
      scenario: 'Scenario B',
      name: 'Trial Fund Excluded from Real Deposit Milestones',
      passed: passB,
      details: `realDeposits: $${realDepositsB}, dep100Progress: $${dep100TaskB?.currentProgress}, claimBlocked: "${claimAttemptError}"`,
    });
    console.log(`Scenario B: ${passB ? '✅ PASS' : '❌ FAIL'}\n`);

    // -------------------------------------------------------------------------
    // SCENARIO C: Old User With Pre-Launch Achievements
    // Deposit & Referral created BEFORE launch date (2026-08-12)
    // Must be LOCKED and cannot claim
    // -------------------------------------------------------------------------
    console.log('--- SCENARIO C: Old User With Pre-Launch Achievements ---');
    const uC = await userRepository.createUser({
      email: `qa_old_user_${Date.now()}@example.com`,
      passwordHash: 'hash',
      name: 'QA Old User',
    });
    const wC = await walletRepository.createWallet({
      userId: uC.id,
      availableBalance: '200.00000000',
      principalBalance: '0.00000000',
      trialBalance: '0.00000000',
    });

    // Create Pre-Launch Deposit ($200 on 2026-08-01, before 2026-08-12 launch)
    const preLaunchDate = new Date('2026-08-01T00:00:00.000Z');
    await db.insert(deposits).values({
      userId: uC.id,
      walletId: wC.id,
      referenceNumber: `PRE-DEP-${Date.now()}`,
      amount: '200.00000000',
      network: 'USDT_TRC20',
      depositAddress: 'TPRELAUNCHADDRESS999',
      status: 'COMPLETED',
      createdAt: preLaunchDate,
    });

    const realDepositsPostLaunchC = await taskService.getUserRealTotalDeposits(uC.id, TASK_REWARDS_LAUNCH_DATE);
    const tasksC = await taskService.getUserTasks(uC.id);
    const dep100TaskC = tasksC.tasks.find((t) => t.taskCode === 'DEPOSIT_MILESTONE_100');

    let oldClaimError = '';
    try {
      await taskService.claimTaskReward(uC.id, 'DEPOSIT_MILESTONE_100');
    } catch (err: any) {
      oldClaimError = err.message;
    }

    const passC =
      realDepositsPostLaunchC === 0 &&
      dep100TaskC?.status === 'LOCKED' &&
      dep100TaskC?.currentProgress === 0 &&
      oldClaimError.includes('Deposit milestone requirement not met');

    results.push({
      scenario: 'Scenario C',
      name: 'Historical Pre-Launch Achievements Are Locked',
      passed: passC,
      details: `postLaunchRealDeposit: $${realDepositsPostLaunchC}, dep100Status: ${dep100TaskC?.status}, claimBlocked: "${oldClaimError}"`,
    });
    console.log(`Scenario C: ${passC ? '✅ PASS' : '❌ FAIL'}\n`);

    // -------------------------------------------------------------------------
    // SCENARIO D: Old User With New Post-Launch Achievement
    // Old user makes a qualifying deposit AFTER launch date
    // Must become COMPLETED & Claimable
    // -------------------------------------------------------------------------
    console.log('--- SCENARIO D: Old User With New Post-Launch Achievement ---');
    const postLaunchDate = new Date(); // Current date (after launch)
    await db.insert(deposits).values({
      userId: uC.id,
      walletId: wC.id,
      referenceNumber: `POST-DEP-${Date.now()}`,
      amount: '100.00000000',
      network: 'USDT_TRC20',
      depositAddress: 'TPOSTLAUNCHADDRESS999',
      status: 'COMPLETED',
      createdAt: postLaunchDate,
    });

    const realDepositsD = await taskService.getUserRealTotalDeposits(uC.id, TASK_REWARDS_LAUNCH_DATE);
    const tasksD = await taskService.getUserTasks(uC.id);
    const dep100TaskD = tasksD.tasks.find((t) => t.taskCode === 'DEPOSIT_MILESTONE_100');

    const claimResultD = await taskService.claimTaskReward(uC.id, 'DEPOSIT_MILESTONE_100');
    const tasksAfterClaimD = await taskService.getUserTasks(uC.id);
    const dep100AfterClaimD = tasksAfterClaimD.tasks.find((t) => t.taskCode === 'DEPOSIT_MILESTONE_100');

    const passD =
      realDepositsD === 100 &&
      dep100TaskD?.status === 'COMPLETED' &&
      claimResultD.rewardAmount === 1.0 &&
      dep100AfterClaimD?.status === 'CLAIMED';

    results.push({
      scenario: 'Scenario D',
      name: 'Post-Launch Achievement Earns Reward for Existing User',
      passed: passD,
      details: `postLaunchDeposit: $${realDepositsD}, initialStatus: ${dep100TaskD?.status}, claimedReward: $${claimResultD.rewardAmount}, afterClaimStatus: ${dep100AfterClaimD?.status}`,
    });
    console.log(`Scenario D: ${passD ? '✅ PASS' : '❌ FAIL'}\n`);

    // -------------------------------------------------------------------------
    // SCENARIO E: User Data Isolation
    // User C's claims and achievements must not affect fresh User E
    // -------------------------------------------------------------------------
    console.log('--- SCENARIO E: User Isolation ---');
    const uE = await userRepository.createUser({
      email: `qa_iso_check_${Date.now()}@example.com`,
      passwordHash: 'hash',
      name: 'QA Isolation Check User',
    });
    await walletRepository.createWallet({
      userId: uE.id,
      availableBalance: '0.00000000',
      principalBalance: '0.00000000',
      trialBalance: '100.00000000',
      trialExpiresAt: null,
    });

    const tasksE = await taskService.getUserTasks(uE.id);
    const claimsE = await taskRepository.findUserTaskClaims(uE.id);
    const dep100E = tasksE.tasks.find((t) => t.taskCode === 'DEPOSIT_MILESTONE_100');

    const passE =
      claimsE.length === 0 &&
      tasksE.summary.totalEarned === 0 &&
      tasksE.summary.claimableTotal === 0 &&
      dep100E?.status === 'LOCKED' &&
      dep100E?.currentProgress === 0;

    results.push({
      scenario: 'Scenario E',
      name: 'Complete User Isolation',
      passed: passE,
      details: `claimsCount: ${claimsE.length}, totalEarned: $${tasksE.summary.totalEarned}, claimableTotal: $${tasksE.summary.claimableTotal}, dep100Status: ${dep100E?.status}`,
    });
    console.log(`Scenario E: ${passE ? '✅ PASS' : '❌ FAIL'}\n`);

  } catch (err) {
    console.error('❌ Error executing test suite:', err);
  } finally {
    await pool.end();
  }

  console.log('================================================================');
  console.log('📊 SCENARIO TEST RESULTS TABLE');
  console.log('================================================================');
  console.table(results);
}

runEligibilityScenarios();
