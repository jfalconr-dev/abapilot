import { ModelCatalog, type AIProvider, type ModelDefinition } from '@abapcompass/core';
import { describe, expect, it } from 'vitest';

import { createAIProviderResolver } from '../src/infrastructure/ai/ai-provider-factory.js';
import { OllamaAIProvider } from '../src/infrastructure/ai/ollama-ai-provider.js';

describe('createAIProviderResolver', () => {
  it('should resolve the Ollama provider configured for a supported model', () => {
    const resolver = createAIProviderResolver({
      OLLAMA_BASE_URL: 'http://ollama.local:11434',
      OLLAMA_TIMEOUT_MS: '60000',
    });

    const catalog = new ModelCatalog();
    const modelDefinition = catalog.getById(catalog.getDefaultModelId());

    const provider: AIProvider = resolver.resolve(modelDefinition);

    expect(provider).toBeInstanceOf(OllamaAIProvider);
  });

  it('should reject a provider that is not registered', () => {
    const resolver = createAIProviderResolver({});

    const modelDefinition: ModelDefinition = {
      id: 'unsupported-provider-model',
      displayName: 'Unsupported provider model',
      description: 'Modelo de prueba con un proveedor no registrado.',
      providerId: 'unsupported',
      providerModel: 'unsupported-model',
      codeSuggestionMode: 'none',
    };

    expect(() => resolver.resolve(modelDefinition)).toThrow(
      'AI provider "unsupported" is not supported by ABAPCompass.',
    );
  });
});
