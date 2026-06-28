import { ApiError } from '../utils/apiError.js';

/**
 * Validates request payload against Zod schema
 * @param {import('zod').ZodSchema} schema
 * @param {'body'|'query'|'params'} source
 */
export const validate = (schema, source = 'body') => {
  return (req, res, next) => {
    try {
      const parsed = schema.parse(req[source]);
      // Override request data with parsed/sanitized values
      req[source] = parsed;
      next();
    } catch (error) {
      const errorDetails = error.errors.map((err) => ({
        field: err.path.join('.'),
        message: err.message,
      }));
      next(new ApiError(400, 'Validation failed', errorDetails));
    }
  };
};
