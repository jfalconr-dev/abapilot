import { describe, expect, it } from 'vitest';

import { answerQueryUseCase } from '../src/application/index.js';

describe('query application composition', () => {
  it('answers a query using the configured AI provider', async () => {
    const response = await answerQueryUseCase.execute({
      content: '¿Cómo puedo analizar un dump ABAP?',
    });

    expect(response).toEqual({
      content: 'Respuesta estática para la consulta: ¿Cómo puedo analizar un dump ABAP?',
    });
  });
});
