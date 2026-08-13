import { describe, expect, it } from 'vitest';

import { DEFAULT_MODEL_ID, ModelCatalog, ModelNotSupportedError } from '../src/index.js';

describe('ModelCatalog', () => {
  const catalog = new ModelCatalog();

  it('contains the models supported by v0.3.0', () => {
    expect(catalog.getAll()).toEqual([
      {
        id: 'llama-3.2-3b',
        displayName: 'Llama 3.2 3B',
        description: 'Modelo orientado a consultas de uso general.',
        providerId: 'ollama',
        providerModel: 'llama3.2:3b',
        codeSuggestionMode: 'none',
      },
      {
        id: 'qwen-2.5-coder-7b',
        displayName: 'Qwen 2.5 Coder 7B',
        description: 'Modelo orientado a tareas de desarrollo asistido.',
        providerId: 'ollama',
        providerModel: 'qwen2.5-coder:7b',
        codeSuggestionMode: 'snippets',
      },
      {
        id: 'deepseek-coder-v2-16b',
        displayName: 'DeepSeek Coder V2 16B',
        description: 'Modelo orientado a tareas de desarrollo avanzado.',
        providerId: 'ollama',
        providerModel: 'deepseek-coder-v2:16b',
        codeSuggestionMode: 'full',
      },
    ]);
  });

  it('provides the configured default model', () => {
    expect(catalog.getDefaultModelId()).toBe(DEFAULT_MODEL_ID);
    expect(catalog.getById(DEFAULT_MODEL_ID).id).toBe(DEFAULT_MODEL_ID);
  });

  it('finds a supported model by its public identifier', () => {
    expect(catalog.getById('qwen-2.5-coder-7b')).toMatchObject({
      displayName: 'Qwen 2.5 Coder 7B',
      providerId: 'ollama',
      providerModel: 'qwen2.5-coder:7b',
      codeSuggestionMode: 'snippets',
    });
  });

  it('rejects a model that is not supported by ABAPCompass', () => {
    expect(() => catalog.getById('unknown-model')).toThrow(ModelNotSupportedError);
  });
});
