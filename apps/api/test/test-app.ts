import { AIProviderResolver, ModelCatalog, type AIProvider } from '@abapilot/core';
import type { Express } from 'express';

import { createAssistantApplication } from '../src/application/index.js';
import { createApp } from '../src/app.js';
import { StaticAIProvider } from '../src/infrastructure/ai/static-ai-provider.js';

export const createTestApp = (aiProvider: AIProvider = new StaticAIProvider()): Express => {
  const modelCatalog = new ModelCatalog();

  const aiProviderResolver = new AIProviderResolver({
    ollama: (): AIProvider => aiProvider,
  });

  return createApp(createAssistantApplication(modelCatalog, aiProviderResolver));
};
