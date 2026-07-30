import { AnswerQueryUseCase } from '@abapilot/core';

import { StaticAIProvider } from '../infrastructure/ai/index.js';

const aiProvider = new StaticAIProvider();

export const answerQueryUseCase = new AnswerQueryUseCase(aiProvider);
