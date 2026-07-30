import { describe, expect, it, vi } from 'vitest';

import type { AbapCode, Context, Response } from '../src/domain/index.js';
import type { AIProvider } from '../src/application/ports/index.js';
import { ExplainAbapCodeUseCase } from '../src/application/use-cases/index.js';

describe('ExplainAbapCodeUseCase', () => {
  it('delegates the code explanation to the AI provider', async () => {
    const code: AbapCode = {
      content: 'SELECT * FROM mara INTO TABLE lt_mara.',
    };
    const context: Context = {
      content: 'El código se ejecuta en SAP ECC.',
    };
    const expectedResponse: Response = {
      content: 'El código recupera registros de la tabla MARA.',
    };

    const explainCodeMock = vi.fn().mockResolvedValue(expectedResponse);

    const aiProvider: AIProvider = {
      generateResponse: vi.fn(),
      explainCode: explainCodeMock,
    };

    const useCase = new ExplainAbapCodeUseCase(aiProvider);

    const response = await useCase.execute(code, context);

    expect(explainCodeMock).toHaveBeenCalledOnce();
    expect(explainCodeMock).toHaveBeenCalledWith(code, context);
    expect(response).toEqual(expectedResponse);
  });
});
