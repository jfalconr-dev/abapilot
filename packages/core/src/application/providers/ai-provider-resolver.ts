import type { AIProvider } from '../ports/index.js';
import type { ModelDefinition } from '../models/index.js';

export type AIProviderFactory = (modelDefinition: ModelDefinition) => AIProvider;

export type AIProviderFactories = Readonly<Record<string, AIProviderFactory>>;

/**
 * Raised when ABAPCompass cannot resolve the provider configured for a model.
 */
export class AIProviderNotSupportedError extends Error {
  constructor(providerId: string) {
    super(`AI provider "${providerId}" is not supported by ABAPCompass.`);
    this.name = 'AIProviderNotSupportedError';
  }
}

/**
 * Resolves the AI provider implementation required by a model definition.
 */
export class AIProviderResolver {
  constructor(private readonly factories: AIProviderFactories) {}

  resolve(modelDefinition: ModelDefinition): AIProvider {
    const factory = this.factories[modelDefinition.providerId];

    if (factory === undefined) {
      throw new AIProviderNotSupportedError(modelDefinition.providerId);
    }

    return factory(modelDefinition);
  }
}
