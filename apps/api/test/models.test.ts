import { DEFAULT_MODEL_ID } from '@abapcompass/core';
import request from 'supertest';
import { describe, expect, it } from 'vitest';

import { createTestApp } from './test-app.js';

interface PublicModel {
  readonly id: string;
  readonly displayName: string;
  readonly description: string;
  readonly codeSuggestionMode: 'none' | 'snippets' | 'full';
}

interface ModelsResponseBody {
  readonly defaultModelId: string;
  readonly models: readonly PublicModel[];
}

describe('GET /models', () => {
  it('returns the public model catalog and default model', async () => {
    const response = await request(createTestApp()).get('/models');

    expect(response.status).toBe(200);
    expect(response.headers['content-type']).toContain('application/json');

    expect(response.body).toEqual({
      defaultModelId: DEFAULT_MODEL_ID,
      models: [
        {
          id: 'llama-3.2-3b',
          displayName: 'Llama 3.2 3B',
          description: 'Modelo orientado a consultas de uso general.',
          codeSuggestionMode: 'none',
        },
        {
          id: 'qwen-2.5-coder-7b',
          displayName: 'Qwen 2.5 Coder 7B',
          description: 'Modelo orientado a tareas de desarrollo asistido.',
          codeSuggestionMode: 'snippets',
        },
        {
          id: 'deepseek-coder-v2-16b',
          displayName: 'DeepSeek Coder V2 16B',
          description: 'Modelo orientado a tareas de desarrollo avanzado.',
          codeSuggestionMode: 'full',
        },
      ],
    });
  });

  it('does not expose provider implementation details', async () => {
    const response = await request(createTestApp()).get('/models');

    expect(response.status).toBe(200);

    const responseBody = response.body as ModelsResponseBody;

    for (const model of responseBody.models) {
      expect(model).not.toHaveProperty('providerId');
      expect(model).not.toHaveProperty('providerModel');
    }
  });
});
