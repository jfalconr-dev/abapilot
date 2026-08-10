import { describe, expect, it } from 'vitest';

import { createAIProvider } from '../src/infrastructure/ai/ai-provider-factory.js';
import { OllamaAIProvider } from '../src/infrastructure/ai/ollama-ai-provider.js';
import { StaticAIProvider } from '../src/infrastructure/ai/static-ai-provider.js';

describe('createAIProvider', () => {
  it('should use the static provider by default', () => {
    const provider = createAIProvider({});

    expect(provider).toBeInstanceOf(StaticAIProvider);
  });

  it('should create the configured static provider', () => {
    const provider = createAIProvider({
      AI_PROVIDER: ' static ',
    });

    expect(provider).toBeInstanceOf(StaticAIProvider);
  });

  it('should create the configured Ollama provider', () => {
    const provider = createAIProvider({
      AI_PROVIDER: 'OLLAMA',
      OLLAMA_BASE_URL: 'http://ollama.local:11434',
      OLLAMA_TIMEOUT_MS: '60000',
    });

    expect(provider).toBeInstanceOf(OllamaAIProvider);
  });

  it('should reject an unsupported provider', () => {
    expect(() =>
      createAIProvider({
        AI_PROVIDER: 'unknown',
      }),
    ).toThrow(
      'AI_PROVIDER contiene el valor no compatible "unknown". Debe ser "static" u "ollama".',
    );
  });
});
