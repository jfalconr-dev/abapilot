import { AnswerQueryUseCase, ExplainAbapCodeUseCase, ReviewAbapCodeUseCase } from '@abapilot/core';

import { StaticAIProvider } from '../infrastructure/ai/index.js';

const aiProvider = new StaticAIProvider();

export const answerQueryUseCase = new AnswerQueryUseCase(aiProvider);

export const explainAbapCodeUseCase = new ExplainAbapCodeUseCase(aiProvider);

export const reviewAbapCodeUseCase = new ReviewAbapCodeUseCase(aiProvider);
