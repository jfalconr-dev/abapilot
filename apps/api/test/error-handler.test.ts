import { ModelNotSupportedError } from '@abapilot/core';
import express, { type NextFunction, type Request, type Response } from 'express';
import request from 'supertest';
import { describe, expect, it } from 'vitest';

import {
  AIProviderTimeoutError,
  AIProviderUnavailableError,
} from '../src/infrastructure/ai/ai-provider-error.js';
import { errorHandler } from '../src/presentation/error-handler.js';

describe('errorHandler', () => {
  it('returns a generic internal error without exposing implementation details', async () => {
    const app = express();

    app.get('/failure', (_request: Request, _response: Response, next: NextFunction): void => {
      next(new Error('Ollama connection failed at http://localhost:11434'));
    });

    app.use(errorHandler);

    const response = await request(app).get('/failure');

    expect(response.status).toBe(500);
    expect(response.headers['content-type']).toContain('application/json');
    expect(response.body).toEqual({
      code: 'INTERNAL_ERROR',
      message: 'Se ha producido un error interno.',
    });

    expect(response.text).not.toContain('Ollama');
    expect(response.text).not.toContain('localhost:11434');
  });

  it('returns status 400 for an unsupported model', async () => {
    const app = express();

    app.get(
      '/unsupported-model',
      (_request: Request, _response: Response, next: NextFunction): void => {
        next(new ModelNotSupportedError('unsupported-model'));
      },
    );

    app.use(errorHandler);

    const response = await request(app).get('/unsupported-model');

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      code: 'MODEL_NOT_SUPPORTED',
      message: 'El modelo solicitado no está soportado por ABAPilot.',
    });
  });

  it('returns status 503 when the AI provider is unavailable', async () => {
    const app = express();

    app.get(
      '/provider-unavailable',
      (_request: Request, _response: Response, next: NextFunction): void => {
        next(new AIProviderUnavailableError());
      },
    );

    app.use(errorHandler);

    const response = await request(app).get('/provider-unavailable');

    expect(response.status).toBe(503);
    expect(response.body).toEqual({
      code: 'AI_PROVIDER_UNAVAILABLE',
      message: 'El proveedor de IA no está disponible.',
    });
  });

  it('returns status 504 when the AI provider request times out', async () => {
    const app = express();

    app.get(
      '/provider-timeout',
      (_request: Request, _response: Response, next: NextFunction): void => {
        next(new AIProviderTimeoutError());
      },
    );

    app.use(errorHandler);

    const response = await request(app).get('/provider-timeout');

    expect(response.status).toBe(504);
    expect(response.body).toEqual({
      code: 'AI_PROVIDER_TIMEOUT',
      message: 'El proveedor de IA no ha respondido dentro del tiempo esperado.',
    });
  });
});
