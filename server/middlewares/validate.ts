/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { ApiError } from './errorHandler.ts';

/**
 * Express Request Validator middleware:
 * Validates request payload against a Zod schema.
 */
export const validateRequest = (schema: ZodSchema) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Validate body, query and parameters against the Zod schema
      await schema.parseAsync(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const issues = error.issues.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
        }));
        
        console.error('Validation failed for request:', req.originalUrl, 'Payload:', req.body, 'Issues:', JSON.stringify(issues));
        
        return next(
          new ApiError(
            400,
            'Request payload validation failed',
            'VALIDATION_ERROR',
            issues
          )
        );
      }
      next(error);
    }
  };
};
export default validateRequest;
