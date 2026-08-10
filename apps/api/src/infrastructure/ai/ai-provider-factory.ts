import { ModelCatalog, type AIProvider } from '@abapilot/core';

import { OllamaAIProvider } from './ollama-ai-provider.js';
import { loadOllamaConfig } from './ollama-config.js';
import { StaticAIProvider } from './static-ai-provider.js';

type Environment = Readonly<Record<string, string | undefined>>;

export const createAIProvider = (environment: Environment = process.env): AIProvider => {
  const provider = environment.AI_PROVIDER?.trim().toLowerCase() || 'static';

  switch (provider) {
    case 'static':
      return new StaticAIProvider();

    case 'ollama': {
      const config = loadOllamaConfig(environment);
      const modelCatalog = new ModelCatalog();
      const modelDefinition = modelCatalog.getById(modelCatalog.getDefaultModelId());

      return new OllamaAIProvider(
        config,
        modelDefinition.providerModel,
        modelDefinition.codeSuggestionMode,
      );
    }

    default:
      throw new Error(
        `AI_PROVIDER contiene el valor no compatible "${provider}". Debe ser "static" u "ollama".`,
      );
  }
};
