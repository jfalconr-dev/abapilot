import { describe, expect, it } from 'vitest';

import { reviewAbapCodeUseCase } from '../src/application/index.js';

describe('review ABAP code application composition', () => {
  it('reviews ABAP code using the configured AI provider', async () => {
    const code = {
      content: 'SELECT * FROM mara INTO TABLE lt_mara.',
    };

    const context = {
      content: 'El código se ejecuta en SAP ECC.',
    };

    const response = await reviewAbapCodeUseCase.execute(code, context);

    expect(response).toEqual({
      content:
        'Revisión estática para el código ABAP: SELECT * FROM mara INTO TABLE lt_mara. Contexto recibido: El código se ejecuta en SAP ECC.',
    });
  });
});
