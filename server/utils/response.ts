/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Response } from 'express';
import { ApiResponse } from '../../shared/types/index.ts';

/**
 * Send a standardized success API response
 */
export function sendSuccess<T>(res: Response, data: T, statusCode = 200): Response {
  const responseBody: ApiResponse<T> = {
    success: true,
    data,
    timestamp: new Date().toISOString(),
  };
  return res.status(statusCode).json(responseBody);
}

/**
 * Send a standardized error API response
 */
export function sendError(
  res: Response,
  message: string,
  code = 'INTERNAL_ERROR',
  statusCode = 500,
  details?: any
): Response {
  const responseBody: ApiResponse = {
    success: false,
    error: {
      code,
      message,
      details,
    },
    timestamp: new Date().toISOString(),
  };
  return res.status(statusCode).json(responseBody);
}
