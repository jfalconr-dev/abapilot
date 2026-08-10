import { ModelNotSupportedError } from '@abapilot/core';
import express, { type NextFunction, type Request, type Response } from 'express';
import request from 'supertest';
import { describe, expect, it } from 'vitest';

import { errorHandler } from '../src/presentation/error-handler.js';

describe('errorHandler', () => {
  it('returns a generic JSON response without exposing internal details', async () => {
    const app = express();

    app.get('/failure', (_request: Request, _response: Response, next: NextFunction): void => {
      next(new Error('Ollama connection failed at http://localhost:11434'));
    });

    app.use(errorHandler);

    const response = await request(app).get('/failure');

    expect(response.status).toBe(500);
    expect(response.headers['content-type']).toContain('application/json');
    expect(response.body).toEqual({
      error: 'Se ha producido un error interno.',
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
      error: 'El modelo solicitado no está soportado por ABAPilot.',
    });
  });
});
