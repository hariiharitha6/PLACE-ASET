import { Request, Response, NextFunction } from 'express';
import { AnyZodObject, ZodError } from 'zod';
import logger from '../utils/logger';

export function validate(schema: AnyZodObject) {
  return async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
    try {
      logger.info('[REGISTRATION DEBUG] 1. Request Received for Validation', {
        path: req.path,
        method: req.method,
        body: req.body,
      });

      const validated = await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      
      logger.info('[REGISTRATION DEBUG] 2. Validation Succeeded', {
        validatedBody: validated.body,
      });

      // Inject validated data
      (req as any).validated = validated;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const formattedErrors = error.errors.map(e => ({
          field: e.path.join('.'),
          message: e.message,
        }));

        logger.error('[REGISTRATION DEBUG] 2. Validation Failed', {
          errors: formattedErrors,
          body: req.body,
        });

        return res.status(422).json({
          success: false,
          error: 'Validation failed',
          errors: formattedErrors,
        });
      }
      next(error);
    }
  };
}
