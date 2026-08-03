import { ExplainAbapCodeUseCase } from '@abapilot/core';

import { StaticAIProvider } from '../infrastructure/ai/index.js';

const aiProvider = new StaticAIProvider();

export const explainAbapCodeUseCase = new ExplainAbapCodeUseCase(aiProvider);
