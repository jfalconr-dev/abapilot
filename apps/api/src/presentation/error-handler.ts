import { ModelNotSupportedError } from '@abapcompass/core';
import type { NextFunction, Request, Response } from 'express';

import {
  AIProviderTimeoutError,
  AIProviderUnavailableError,
} from '../infrastructure/ai/ai-provider-error.js';

export const errorHandler = (
  error: unknown,
  _request: Request,
  response: Response,
  _next: NextFunction,
): void => {
  if (error instanceof ModelNotSupportedError) {
    response.status(400).json({
      code: 'MODEL_NOT_SUPPORTED',
      message: 'El modelo solicitado no está soportado por ABAPCompass.',
    });

    return;
  }

  if (error instanceof AIProviderUnavailableError) {
    response.status(503).json({
      code: 'AI_PROVIDER_UNAVAILABLE',
      message: 'El proveedor de IA no está disponible.',
    });

    return;
  }

  if (error instanceof AIProviderTimeoutError) {
    response.status(504).json({
      code: 'AI_PROVIDER_TIMEOUT',
      message: 'El proveedor de IA no ha respondido dentro del tiempo esperado.',
    });

    return;
  }

  response.status(500).json({
    code: 'INTERNAL_ERROR',
    message: 'Se ha producido un error interno.',
  });
};
