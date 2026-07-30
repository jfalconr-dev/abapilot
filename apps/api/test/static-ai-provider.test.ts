import { describe, expect, it } from 'vitest';

import { StaticAIProvider } from '../src/infrastructure/ai/index.js';

describe('StaticAIProvider', () => {
  it('should return a static response for a query', async () => {
    const provider = new StaticAIProvider();

    const response = await provider.generateResponse({
      content: '¿Cómo puedo implementar una BAdI en SAP ECC?',
    });

    expect(response).toEqual({
      content: 'Respuesta estática para la consulta: ¿Cómo puedo implementar una BAdI en SAP ECC?',
    });
  });

  it('should include the context when it is provided', async () => {
    const provider = new StaticAIProvider();

    const response = await provider.generateResponse(
      {
        content: 'Explícame este código.',
      },
      {
        content: 'El usuario desarrolla sobre SAP ECC.',
      },
    );

    expect(response).toEqual({
      content:
        'Respuesta estática para la consulta: Explícame este código. Contexto recibido: El usuario desarrolla sobre SAP ECC.',
    });
  });
});
