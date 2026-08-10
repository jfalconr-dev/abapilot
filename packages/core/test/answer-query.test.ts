import { describe, expect, it, vi } from 'vitest';

import {
  AIProviderResolver,
  AnswerQueryUseCase,
  ModelCatalog,
  type AIProvider,
  type Context,
  type Query,
  type Response,
} from '../src/index.js';

describe('AnswerQueryUseCase', () => {
  it('resolves the model provider and delegates the query and context', async () => {
    const query: Query = {
      content: '¿Cómo puedo implementar una BAdI en SAP ECC?',
    };

    const context: Context = {
      content: 'El usuario desarrolla en ABAP sobre SAP ECC.',
    };

    const expectedResponse: Response = {
      content: 'Puede implementar la BAdI utilizando la transacción SE19.',
    };

    const generateResponse = vi.fn().mockResolvedValue(expectedResponse);

    const aiProvider: AIProvider = {
      generateResponse,
      explainCode: vi.fn(),
      reviewCode: vi.fn(),
    };

    const modelCatalog = new ModelCatalog();

    const aiProviderResolver = new AIProviderResolver({
      ollama: (): AIProvider => aiProvider,
    });

    const useCase = new AnswerQueryUseCase(modelCatalog, aiProviderResolver);

    const response = await useCase.execute(modelCatalog.getDefaultModelId(), query, context);

    expect(generateResponse).toHaveBeenCalledOnce();
    expect(generateResponse).toHaveBeenCalledWith(query, context);
    expect(response).toEqual(expectedResponse);
  });
});
