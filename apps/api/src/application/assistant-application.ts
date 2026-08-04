import { AnswerQueryUseCase, ExplainAbapCodeUseCase, ReviewAbapCodeUseCase } from '@abapilot/core';

import { createAIProvider } from '../infrastructure/ai/index.js';

const aiProvider = createAIProvider();

export const answerQueryUseCase = new AnswerQueryUseCase(aiProvider);

export const explainAbapCodeUseCase = new ExplainAbapCodeUseCase(aiProvider);

export const reviewAbapCodeUseCase = new ReviewAbapCodeUseCase(aiProvider);
