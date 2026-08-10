import { describe, expect, it } from 'vitest';

import { createAssistantApplication } from '../src/application/index.js';
import { StaticAIProvider } from '../src/infrastructure/ai/static-ai-provider.js';

describe('review ABAP code application composition', () => {
  it('reviews ABAP code using the configured AI provider', async () => {
    const code = {
      content: 'SELECT * FROM mara INTO TABLE lt_mara.',
    };

    const context = {
      content: 'El código se ejecuta en SAP ECC.',
    };

    const { reviewAbapCodeUseCase } = createAssistantApplication(new StaticAIProvider());

    const response = await reviewAbapCodeUseCase.execute(code, context);

    expect(response).toEqual({
      content:
        'Revisión estática para el código ABAP: SELECT * FROM mara INTO TABLE lt_mara. Contexto recibido: El código se ejecuta en SAP ECC.',
    });
  });
});
