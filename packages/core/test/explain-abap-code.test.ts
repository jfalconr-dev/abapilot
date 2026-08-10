import { describe, expect, it, vi } from 'vitest';

import {
  AIProviderResolver,
  ExplainAbapCodeUseCase,
  ModelCatalog,
  type AIProvider,
  type AbapCode,
  type Context,
  type Response,
} from '../src/index.js';

describe('ExplainAbapCodeUseCase', () => {
  it('resolves the model provider and delegates the code explanation', async () => {
    const code: AbapCode = {
      content: 'SELECT * FROM mara INTO TABLE lt_mara.',
    };

    const context: Context = {
      content: 'El código se ejecuta en SAP ECC.',
    };

    const expectedResponse: Response = {
      content: 'El código recupera registros de la tabla MARA.',
    };

    const explainCode = vi.fn().mockResolvedValue(expectedResponse);

    const aiProvider: AIProvider = {
      generateResponse: vi.fn(),
      explainCode,
      reviewCode: vi.fn(),
    };

    const modelCatalog = new ModelCatalog();

    const aiProviderResolver = new AIProviderResolver({
      ollama: (): AIProvider => aiProvider,
    });

    const useCase = new ExplainAbapCodeUseCase(modelCatalog, aiProviderResolver);

    const response = await useCase.execute(modelCatalog.getDefaultModelId(), code, context);

    expect(explainCode).toHaveBeenCalledOnce();
    expect(explainCode).toHaveBeenCalledWith(code, context);
    expect(response).toEqual(expectedResponse);
  });
});
