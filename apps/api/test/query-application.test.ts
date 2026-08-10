import { describe, expect, it } from 'vitest';

import { createAssistantApplication } from '../src/application/index.js';
import { StaticAIProvider } from '../src/infrastructure/ai/static-ai-provider.js';

describe('query application composition', () => {
  it('answers a query using the configured AI provider', async () => {
    const { answerQueryUseCase } = createAssistantApplication(new StaticAIProvider());

    const response = await answerQueryUseCase.execute({
      content: '¿Cómo puedo analizar un dump ABAP?',
    });

    expect(response).toEqual({
      content: 'Respuesta estática para la consulta: ¿Cómo puedo analizar un dump ABAP?',
    });
  });
});
