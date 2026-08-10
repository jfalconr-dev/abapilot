import { AIProviderResolver, type AIProviderFactories, type ModelDefinition } from '@abapilot/core';

import { OllamaAIProvider } from './ollama-ai-provider.js';
import { loadOllamaConfig } from './ollama-config.js';

type Environment = Readonly<Record<string, string | undefined>>;

export const createAIProviderResolver = (
  environment: Environment = process.env,
): AIProviderResolver => {
  const config = loadOllamaConfig(environment);

  const factories: AIProviderFactories = {
    ollama: (modelDefinition: ModelDefinition) =>
      new OllamaAIProvider(
        config,
        modelDefinition.providerModel,
        modelDefinition.codeSuggestionMode,
      ),
  };

  return new AIProviderResolver(factories);
};
