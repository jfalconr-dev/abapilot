import { ReviewAbapCodeUseCase } from '@abapilot/core';

import { StaticAIProvider } from '../infrastructure/ai/index.js';

const aiProvider = new StaticAIProvider();

export const reviewAbapCodeUseCase = new ReviewAbapCodeUseCase(aiProvider);
