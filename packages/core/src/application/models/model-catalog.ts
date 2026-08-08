import type { ModelDefinition } from './model-definition.js';

const MODEL_DEFINITIONS: readonly ModelDefinition[] = [
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
];

export const DEFAULT_MODEL_ID = 'qwen-2.5-coder-7b' as const;

/**
 * Raised when an operation requests a model that is not supported by ABAPilot.
 */
export class ModelNotSupportedError extends Error {
  constructor(modelId: string) {
    super(`Model "${modelId}" is not supported by ABAPilot.`);
    this.name = 'ModelNotSupportedError';
  }
}

/**
 * Provides access to the AI models explicitly supported by ABAPilot.
 */
export class ModelCatalog {
  getAll(): readonly ModelDefinition[] {
    return MODEL_DEFINITIONS;
  }

  getById(modelId: string): ModelDefinition {
    const model = MODEL_DEFINITIONS.find(({ id }) => id === modelId);

    if (model === undefined) {
      throw new ModelNotSupportedError(modelId);
    }

    return model;
  }

  getDefaultModelId(): string {
    return DEFAULT_MODEL_ID;
  }
}
