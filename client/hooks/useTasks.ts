/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useCallback } from 'react';
import { clientTaskService, TaskItemDTO, TaskSummaryDTO } from '../services/taskService.ts';

export function useTasks() {
  const [tasks, setTasks] = useState<TaskItemDTO[]>([]);
  const [summary, setSummary] = useState<TaskSummaryDTO>({
    totalEarned: 0,
    claimableTotal: 0,
    completedCount: 0,
    inProgressCount: 0,
    totalTasksCount: 0,
    verifiedReferralCount: 0,
    totalRealDeposits: 0,
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [claimingCode, setClaimingCode] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await clientTaskService.getTasks();
      setTasks(data.tasks);
      setSummary(data.summary);
    } catch (err: any) {
      setError(err.message || 'Failed to load task status');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const claimReward = async (taskCode: string, claimKey?: string) => {
    setClaimingCode(taskCode);
    try {
      const res = await clientTaskService.claimReward(taskCode, claimKey);
      if (res.success) {
        // Optimistically set task status to CLAIMED
        setTasks((prev) =>
          prev.map((t) => (t.taskCode === taskCode ? { ...t, status: 'CLAIMED' } : t))
        );
        // Refresh summary
        await fetchTasks();
      }
      return res;
    } catch (err: any) {
      return { success: false, message: err.message || 'Claim failed' };
    } finally {
      setClaimingCode(null);
    }
  };

  return {
    tasks,
    summary,
    loading,
    claimingCode,
    error,
    refreshTasks: fetchTasks,
    claimReward,
  };
}
