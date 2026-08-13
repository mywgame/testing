/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { taskService } from '../server/services/taskService.ts';
import { taskRepository } from '../server/repositories/taskRepository.ts';
import { referralRepository } from '../server/repositories/referralRepository.ts';
import { userRepository } from '../server/repositories/userRepository.ts';
import { walletRepository } from '../server/repositories/walletRepository.ts';
import { pool } from '../src/db/index.ts';

async function runTests() {
  console.log('🧪 Starting Task & Rewards Business Logic Tests...');

  try {
    // 1. Create Test Parent User
    const parentEmail = `test_parent_${Date.now()}@example.com`;
    const parentUser = await userRepository.createUser({
      email: parentEmail,
      passwordHash: 'hashed_pw',
      name: 'Test Parent User',
    });
    console.log('✅ Created test parent user:', parentUser.id);

    // Ensure wallet exists for parent user
    let parentWallet = await walletRepository.findByUserId(parentUser.id);
    if (!parentWallet) {
      parentWallet = await walletRepository.createWallet({
        userId: parentUser.id,
        availableBalance: '0.00000000',
        trialBalance: '100.00000000',
      });
    }
    console.log('✅ Parent wallet initialized with available balance:', parentWallet.availableBalance);

    // 2. Test Registration Bonus (Trial Fund) Task
    const initialTasks = await taskService.getUserTasks(parentUser.id);
    const regTask = initialTasks.tasks.find((t) => t.taskCode === 'REGISTRATION_TRIAL_FUND');
    console.log('REGISTRATION_TRIAL_FUND Task DTO:', regTask);

    if (regTask?.rewardAmount !== 100) {
      throw new Error(`Expected Registration task rewardAmount to be 100, got ${regTask?.rewardAmount}`);
    }
    if (regTask?.status !== 'COMPLETED') {
      throw new Error(`Expected Registration task status to be COMPLETED before claim, got ${regTask?.status}`);
    }
    console.log('✅ Registration Bonus task displays $100 and status COMPLETED before claim.');

    // Claim Registration Bonus
    const regClaimRes = await taskService.claimTaskReward(parentUser.id, 'REGISTRATION_TRIAL_FUND');
    console.log('Registration claim response:', regClaimRes);

    const postRegTasks = await taskService.getUserTasks(parentUser.id);
    const postRegTask = postRegTasks.tasks.find((t) => t.taskCode === 'REGISTRATION_TRIAL_FUND');
    if (postRegTask?.status !== 'CLAIMED') {
      throw new Error(`Expected Registration task status to be CLAIMED after claim, got ${postRegTask?.status}`);
    }
    const updatedWalletAfterReg = await walletRepository.findByUserId(parentUser.id);
    if (updatedWalletAfterReg?.availableBalance !== '0.00000000') {
      throw new Error(`Expected available balance to remain 0.00000000, got ${updatedWalletAfterReg?.availableBalance}`);
    }
    console.log('✅ Registration Bonus successfully claimed without doubling wallet balance.');

    // 3. Test Referral Registration Reward Aggregation (4 Referrals)
    const childIds: string[] = [];
    for (let i = 1; i <= 4; i++) {
      const childUser = await userRepository.createUser({
        email: `test_child_${i}_${Date.now()}@example.com`,
        passwordHash: 'hashed_pw',
        name: `Test Child ${i}`,
      });
      await referralRepository.createRelationship({
        parentId: parentUser.id,
        childId: childUser.id,
        referralLevel: 1,
      });
      childIds.push(childUser.id);
    }
    console.log('✅ Created 4 direct registered referrals:', childIds);

    // Verify User Tasks before referral claim
    const refTasks1 = await taskService.getUserTasks(parentUser.id);
    const refTask1 = refTasks1.tasks.find((t) => t.taskCode === 'REFERRAL_REGISTRATION_SINGLE');
    console.log('Referral Task DTO with 4 unclaimed referrals:', refTask1);

    if (refTask1?.rewardAmount !== 0.4) {
      throw new Error(`Expected aggregated rewardAmount to be 0.40, got ${refTask1?.rewardAmount}`);
    }
    if (refTask1?.status !== 'COMPLETED') {
      throw new Error(`Expected status to be COMPLETED (claimable), got ${refTask1?.status}`);
    }
    console.log('✅ 4 unclaimed referrals correctly aggregated to $0.40 USDT claimable amount.');

    // Execute single aggregated claim
    const claimRes1 = await taskService.claimTaskReward(parentUser.id, 'REFERRAL_REGISTRATION_SINGLE');
    console.log('Claim 1 Result:', claimRes1);

    if (claimRes1.rewardAmount !== 0.4) {
      throw new Error(`Expected claim 1 rewardAmount to be 0.40, got ${claimRes1.rewardAmount}`);
    }

    const walletAfterClaim1 = await walletRepository.findByUserId(parentUser.id);
    if (parseFloat(walletAfterClaim1?.availableBalance || '0') !== 0.4) {
      throw new Error(`Expected wallet available balance to be 0.40000000, got ${walletAfterClaim1?.availableBalance}`);
    }
    console.log('✅ Wallet credited with $0.40 USDT in single atomic transaction.');

    // Verify task state after claim 1
    const refTasks2 = await taskService.getUserTasks(parentUser.id);
    const refTask2 = refTasks2.tasks.find((t) => t.taskCode === 'REFERRAL_REGISTRATION_SINGLE');
    console.log('Referral Task DTO after claiming 4 referrals:', refTask2);

    if (refTask2?.status !== 'CLAIMED') {
      throw new Error(`Expected task status to be CLAIMED when no pending referrals remain, got ${refTask2?.status}`);
    }
    console.log('✅ Referral task status changed to CLAIMED with 0 pending referrals.');

    // 4. Test Repeated Claim Behavior with 5th Referral
    const child5 = await userRepository.createUser({
      email: `test_child_5_${Date.now()}@example.com`,
      passwordHash: 'hashed_pw',
      name: 'Test Child 5',
    });
    await referralRepository.createRelationship({
      parentId: parentUser.id,
      childId: child5.id,
      referralLevel: 1,
    });
    console.log('✅ Added 5th direct referral:', child5.id);

    // Verify task status becomes COMPLETED again for $0.10
    const refTasks3 = await taskService.getUserTasks(parentUser.id);
    const refTask3 = refTasks3.tasks.find((t) => t.taskCode === 'REFERRAL_REGISTRATION_SINGLE');
    console.log('Referral Task DTO after adding 5th referral:', refTask3);

    if (refTask3?.rewardAmount !== 0.1) {
      throw new Error(`Expected rewardAmount to be 0.10 for 1 new referral, got ${refTask3?.rewardAmount}`);
    }
    if (refTask3?.status !== 'COMPLETED') {
      throw new Error(`Expected task status to be COMPLETED again, got ${refTask3?.status}`);
    }
    console.log('✅ Task became claimable again for $0.10 USDT after 5th referral registered!');

    // Claim 5th referral
    const claimRes2 = await taskService.claimTaskReward(parentUser.id, 'REFERRAL_REGISTRATION_SINGLE');
    console.log('Claim 2 Result:', claimRes2);

    if (claimRes2.rewardAmount !== 0.1) {
      throw new Error(`Expected claim 2 rewardAmount to be 0.10, got ${claimRes2.rewardAmount}`);
    }

    const walletAfterClaim2 = await walletRepository.findByUserId(parentUser.id);
    if (parseFloat(walletAfterClaim2?.availableBalance || '0') !== 0.5) {
      throw new Error(`Expected final wallet available balance to be 0.50000000, got ${walletAfterClaim2?.availableBalance}`);
    }
    console.log('✅ Wallet credited with additional $0.10 USDT (Total available = $0.50 USDT).');

    // 5. Duplicate Claim Protection Check
    try {
      await taskService.claimTaskReward(parentUser.id, 'REFERRAL_REGISTRATION_SINGLE');
      throw new Error('Expected duplicate claim to throw error!');
    } catch (err: any) {
      if (err.message.includes('No unclaimed referral registration rewards available')) {
        console.log('✅ Duplicate claim correctly rejected with error:', err.message);
      } else {
        throw err;
      }
    }

    console.log('\n🎉 ALL TASK & REWARDS BUSINESS LOGIC TESTS PASSED SUCCESSFULLY!');
  } catch (error) {
    console.error('❌ TEST FAILED:', error);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

runTests();
