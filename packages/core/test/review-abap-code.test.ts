import { describe, expect, it, vi } from 'vitest';

import type { AbapCode, Context, Response } from '../src/domain/index.js';
import type { AIProvider } from '../src/application/ports/index.js';
import { ReviewAbapCodeUseCase } from '../src/application/use-cases/index.js';

describe('ReviewAbapCodeUseCase', () => {
  it('delegates the code review to the AI provider', async () => {
    const code: AbapCode = {
      content: 'SELECT * FROM mara INTO TABLE lt_mara.',
    };

    const context: Context = {
      content: 'El código se ejecuta en SAP ECC.',
    };

    const expectedResponse: Response = {
      content: 'La revisión identifica oportunidades de mejora.',
    };

    const reviewCodeMock = vi.fn().mockResolvedValue(expectedResponse);

    const aiProvider: AIProvider = {
      generateResponse: vi.fn(),
      explainCode: vi.fn(),
      reviewCode: reviewCodeMock,
    };

    const useCase = new ReviewAbapCodeUseCase(aiProvider);

    const response = await useCase.execute(code, context);

    expect(reviewCodeMock).toHaveBeenCalledOnce();
    expect(reviewCodeMock).toHaveBeenCalledWith(code, context);
    expect(response).toEqual(expectedResponse);
  });
});
