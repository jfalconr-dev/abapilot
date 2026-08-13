import { describe, expect, it, vi } from 'vitest';

import {
  AIProviderNotSupportedError,
  AIProviderResolver,
  type AIProvider,
  type ModelDefinition,
} from '../src/index.js';

const modelDefinition: ModelDefinition = {
  id: 'qwen-2.5-coder-7b',
  displayName: 'Qwen 2.5 Coder 7B',
  description: 'Modelo orientado a tareas de desarrollo asistido.',
  providerId: 'ollama',
  providerModel: 'qwen2.5-coder:7b',
  codeSuggestionMode: 'snippets',
};

const createProvider = (): AIProvider => ({
  generateResponse: vi.fn(),
  explainCode: vi.fn(),
  reviewCode: vi.fn(),
});

describe('AIProviderResolver', () => {
  it('resolves the provider configured for a model definition', () => {
    const provider = createProvider();
    const factory = vi.fn().mockReturnValue(provider);

    const resolver = new AIProviderResolver({
      ollama: factory,
    });

    expect(resolver.resolve(modelDefinition)).toBe(provider);
    expect(factory).toHaveBeenCalledOnce();
    expect(factory).toHaveBeenCalledWith(modelDefinition);
  });

  it('rejects a provider that cannot be resolved by ABAPCompass', () => {
    const resolver = new AIProviderResolver({});

    expect(() => resolver.resolve(modelDefinition)).toThrow(AIProviderNotSupportedError);
  });
});
