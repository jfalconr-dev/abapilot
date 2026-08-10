import {
  AIProviderResolver,
  DEFAULT_MODEL_ID,
  ModelCatalog,
  type AIProvider,
  type AbapCode,
  type Context,
} from '@abapilot/core';
import { describe, expect, it } from 'vitest';

import { createAssistantApplication } from '../src/application/index.js';
import { StaticAIProvider } from '../src/infrastructure/ai/static-ai-provider.js';

describe('review ABAP code application composition', () => {
  it('reviews ABAP code using the configured AI provider', async () => {
    const code: AbapCode = {
      content: 'SELECT * FROM mara INTO TABLE lt_mara.',
    };

    const context: Context = {
      content: 'El código se ejecuta en SAP ECC.',
    };

    const modelCatalog = new ModelCatalog();

    const aiProviderResolver = new AIProviderResolver({
      ollama: (): AIProvider => new StaticAIProvider(),
    });

    const { reviewAbapCodeUseCase } = createAssistantApplication(modelCatalog, aiProviderResolver);

    const response = await reviewAbapCodeUseCase.execute(DEFAULT_MODEL_ID, code, context);

    expect(response).toEqual({
      content:
        'Revisión estática para el código ABAP: SELECT * FROM mara INTO TABLE lt_mara.' +
        ' Contexto recibido: El código se ejecuta en SAP ECC.',
    });
  });
});
