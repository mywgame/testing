/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.ts';
import { taskService } from '../services/taskService.ts';
import { taskRepository } from '../repositories/taskRepository.ts';

export class TaskController {
  /**
   * GET /api/v1/tasks
   * Fetch user's tasks, progress, status, and summary metrics
   */
  async getUserTasks(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.uid;
      if (!userId) {
        return res.status(401).json({ success: false, error: { message: 'Unauthorized request.' } });
      }

      const result = await taskService.getUserTasks(userId);
      return res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      console.error('TaskController getUserTasks error:', error);
      return res.status(500).json({
        success: false,
        error: { message: error.message || 'Failed to retrieve task status.' },
      });
    }
  }

  /**
   * POST /api/v1/tasks/:taskCode/claim
   * Idempotently claim reward for a specific task
   */
  async claimTaskReward(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.uid;
      if (!userId) {
        return res.status(401).json({ success: false, error: { message: 'Unauthorized request.' } });
      }

      const { taskCode } = req.params;
      const { claimKey } = req.body || {};

      const result = await taskService.claimTaskReward(userId, taskCode, claimKey || 'DEFAULT');
      return res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      console.error('TaskController claimTaskReward error:', error);
      return res.status(400).json({
        success: false,
        error: { message: error.message || 'Failed to claim task reward.' },
      });
    }
  }

  /**
   * GET /api/v1/admin/tasks
   * Admin endpoint to view task definitions
   */
  async getAdminTasks(req: AuthRequest, res: Response) {
    try {
      const tasks = await taskRepository.findAllActiveTaskDefinitions();
      return res.status(200).json({
        success: true,
        data: { tasks },
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        error: { message: error.message || 'Failed to retrieve admin task definitions.' },
      });
    }
  }
}

export const taskController = new TaskController();

