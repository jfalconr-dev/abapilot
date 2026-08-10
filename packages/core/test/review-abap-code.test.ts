import { describe, expect, it, vi } from 'vitest';

import {
  AIProviderResolver,
  ModelCatalog,
  ReviewAbapCodeUseCase,
  type AIProvider,
  type AbapCode,
  type Context,
  type Response,
} from '../src/index.js';

describe('ReviewAbapCodeUseCase', () => {
  it('resolves the model provider and delegates the code review', async () => {
    const code: AbapCode = {
      content: 'SELECT * FROM mara INTO TABLE lt_mara.',
    };

    const context: Context = {
      content: 'El código se ejecuta en SAP ECC.',
    };

    const expectedResponse: Response = {
      content: 'La revisión identifica oportunidades de mejora.',
    };

    const reviewCode = vi.fn().mockResolvedValue(expectedResponse);

    const aiProvider: AIProvider = {
      generateResponse: vi.fn(),
      explainCode: vi.fn(),
      reviewCode,
    };

    const modelCatalog = new ModelCatalog();

    const aiProviderResolver = new AIProviderResolver({
      ollama: (): AIProvider => aiProvider,
    });

    const useCase = new ReviewAbapCodeUseCase(modelCatalog, aiProviderResolver);

    const response = await useCase.execute(modelCatalog.getDefaultModelId(), code, context);

    expect(reviewCode).toHaveBeenCalledOnce();
    expect(reviewCode).toHaveBeenCalledWith(code, context);
    expect(response).toEqual(expectedResponse);
  });
});
