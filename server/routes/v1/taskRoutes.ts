/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Router } from 'express';
import { taskController } from '../../controllers/taskController.ts';
import { requireAuth } from '../../middlewares/auth.ts';

const router = Router();

/**
 * @route GET /api/v1/tasks
 * @desc Get tasks list with user's current progress and claim status
 * @access Private
 */
router.get('/', requireAuth, taskController.getUserTasks);

/**
 * @route POST /api/v1/tasks/:taskCode/claim
 * @desc Idempotently claim reward for a specific task milestone
 * @access Private
 */
router.post('/:taskCode/claim', requireAuth, taskController.claimTaskReward);

/**
 * @route GET /api/v1/tasks/admin/list
 * @desc Admin list task definitions
 * @access Private
 */
router.get('/admin/list', requireAuth, taskController.getAdminTasks);

export default router;
