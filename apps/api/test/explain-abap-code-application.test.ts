import { describe, expect, it } from 'vitest';

import { explainAbapCodeUseCase } from '../src/application/index.js';

describe('explain ABAP code application composition', () => {
  it('explains ABAP code using the configured AI provider', async () => {
    const code = {
      content: 'SELECT * FROM mara INTO TABLE lt_mara.',
    };

    const context = {
      content: 'El código se ejecuta en SAP ECC.',
    };

    const response = await explainAbapCodeUseCase.execute(code, context);

    expect(response).toEqual({
      content:
        'Explicación estática para el código ABAP: SELECT * FROM mara INTO TABLE lt_mara. Contexto recibido: El código se ejecuta en SAP ECC.',
    });
  });
});
