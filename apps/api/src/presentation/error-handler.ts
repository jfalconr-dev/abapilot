import type { NextFunction, Request, Response } from 'express';

export const errorHandler = (
  _error: unknown,
  _request: Request,
  response: Response,
  _next: NextFunction,
): void => {
  void _next;

  response.status(500).json({
    error: 'Se ha producido un error interno.',
  });
};
