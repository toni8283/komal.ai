import { Request, Response, NextFunction } from 'express';
import { ApiErrorResponse } from '../types/index.js';

export function errorHandler(
  err: any,
  _req: Request,
  res: Response<ApiErrorResponse>,
  _next: NextFunction
): void {
  const code = err.code || 'INTERNAL_ERROR';
  const statusCode = err.statusCode || (code === 'RATE_LIMITED' ? 429 : code === 'INVALID_THERAPIST' ? 400 : 500);

  let message = err.message || 'An unexpected error occurred.';
  if (code === 'MISSING_API_KEY') {
    message = 'AssemblyAI Voice Agent API key is not configured on the backend server.';
  } else if (code === 'INTERNAL_ERROR' && process.env.NODE_ENV === 'production') {
    message = 'An unexpected internal error occurred.';
  }

  res.status(statusCode).json({
    error: {
      code,
      message
    }
  });
}

