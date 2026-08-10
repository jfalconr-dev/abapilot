import { ModelNotSupportedError } from '@abapilot/core';
import type { NextFunction, Request, Response } from 'express';

export const errorHandler = (
  error: unknown,
  _request: Request,
  response: Response,
  _next: NextFunction,
): void => {
  if (error instanceof ModelNotSupportedError) {
    response.status(400).json({
      error: 'El modelo solicitado no está soportado por ABAPilot.',
    });

    return;
  }

  response.status(500).json({
    error: 'Se ha producido un error interno.',
  });
};
