/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger.ts';
import { sendError } from '../utils/response.ts';

/**
 * Custom operational API Error class
 */
export class ApiError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public code: string = 'BAD_REQUEST',
    public details?: any
  ) {
    super(message);
    Object.setPrototypeOf(this, ApiError.prototype);
  }
}

/**
 * Centralized express error handling middleware
 */
export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  logger.error(`Express Request Error: ${req.method} ${req.url}`, err);

  if (err instanceof ApiError) {
    return sendError(res, err.message, err.code, err.statusCode, err.details);
  }

  // Handle default internal server errors
  const isProd = process.env.NODE_ENV === 'production';
  return sendError(
    res,
    isProd ? 'An unexpected error occurred on our server.' : err.message,
    'INTERNAL_SERVER_ERROR',
    500,
    isProd ? undefined : err.stack
  );
};
