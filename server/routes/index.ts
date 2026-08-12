/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Router } from 'express';
import v1Routes from './v1/index.ts';

const router = Router();

// Mount v1 routes
router.use('/v1', v1Routes);

export default router;
