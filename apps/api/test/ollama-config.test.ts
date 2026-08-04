import { describe, expect, it } from 'vitest';

import { loadOllamaConfig } from '../src/infrastructure/ai/ollama-config.js';

describe('loadOllamaConfig', () => {
  it('should return the default configuration', () => {
    const config = loadOllamaConfig({});

    expect(config).toEqual({
      baseUrl: 'http://localhost:11434',
      model: 'qwen2.5-coder:7b',
      timeoutMs: 120_000,
    });
  });

  it('should read and normalize the configured values', () => {
    const config = loadOllamaConfig({
      OLLAMA_BASE_URL: 'http://ollama.local:11434///',
      OLLAMA_MODEL: 'custom-model',
      OLLAMA_TIMEOUT_MS: '60000',
    });

    expect(config).toEqual({
      baseUrl: 'http://ollama.local:11434',
      model: 'custom-model',
      timeoutMs: 60_000,
    });
  });

  it('should reject an invalid base URL', () => {
    expect(() =>
      loadOllamaConfig({
        OLLAMA_BASE_URL: 'invalid-url',
      }),
    ).toThrow('OLLAMA_BASE_URL debe contener una URL válida.');
  });

  it('should reject an unsupported URL protocol', () => {
    expect(() =>
      loadOllamaConfig({
        OLLAMA_BASE_URL: 'ftp://ollama.local',
      }),
    ).toThrow('OLLAMA_BASE_URL debe utilizar el protocolo HTTP o HTTPS.');
  });

  it('should reject an invalid timeout', () => {
    expect(() =>
      loadOllamaConfig({
        OLLAMA_TIMEOUT_MS: 'not-a-number',
      }),
    ).toThrow('OLLAMA_TIMEOUT_MS debe ser un número entero positivo.');
  });
});
