import { describe, expect, it, vi } from 'vitest';

import {
  AnswerQueryUseCase,
  type AIProvider,
  type Context,
  type Query,
  type Response,
} from '../src/index.js';

describe('AnswerQueryUseCase', () => {
  it('delegates the query and context to the AI provider', async () => {
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
    };

    const useCase = new AnswerQueryUseCase(aiProvider);

    const response = await useCase.execute(query, context);

    expect(generateResponse).toHaveBeenCalledOnce();
    expect(generateResponse).toHaveBeenCalledWith(query, context);
    expect(response).toEqual(expectedResponse);
  });
});
