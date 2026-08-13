import {
  AIProviderResolver,
  DEFAULT_MODEL_ID,
  ModelCatalog,
  type AIProvider,
} from '@abapcompass/core';
import { describe, expect, it } from 'vitest';

import { createAssistantApplication } from '../src/application/index.js';
import { StaticAIProvider } from '../src/infrastructure/ai/static-ai-provider.js';

describe('query application composition', () => {
  it('answers a query using the configured AI provider', async () => {
    const modelCatalog = new ModelCatalog();

    const aiProviderResolver = new AIProviderResolver({
      ollama: (): AIProvider => new StaticAIProvider(),
    });

    const { answerQueryUseCase } = createAssistantApplication(modelCatalog, aiProviderResolver);

    const response = await answerQueryUseCase.execute(DEFAULT_MODEL_ID, {
      content: '¿Cómo puedo analizar un dump ABAP?',
    });

    expect(response).toEqual({
      content: 'Respuesta estática para la consulta: ¿Cómo puedo analizar un dump ABAP?',
    });
  });
});
