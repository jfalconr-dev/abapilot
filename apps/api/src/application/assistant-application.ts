import {
  AnswerQueryUseCase,
  ExplainAbapCodeUseCase,
  ModelCatalog,
  ReviewAbapCodeUseCase,
  type AIProviderResolver,
} from '@abapilot/core';

import { createAIProviderResolver } from '../infrastructure/ai/index.js';

export interface AssistantApplication {
  readonly answerQueryUseCase: AnswerQueryUseCase;
  readonly explainAbapCodeUseCase: ExplainAbapCodeUseCase;
  readonly reviewAbapCodeUseCase: ReviewAbapCodeUseCase;
}

export const createAssistantApplication = (
  modelCatalog: ModelCatalog,
  aiProviderResolver: AIProviderResolver,
): AssistantApplication => ({
  answerQueryUseCase: new AnswerQueryUseCase(modelCatalog, aiProviderResolver),
  explainAbapCodeUseCase: new ExplainAbapCodeUseCase(modelCatalog, aiProviderResolver),
  reviewAbapCodeUseCase: new ReviewAbapCodeUseCase(modelCatalog, aiProviderResolver),
});

const modelCatalog = new ModelCatalog();
const aiProviderResolver = createAIProviderResolver();

export const { answerQueryUseCase, explainAbapCodeUseCase, reviewAbapCodeUseCase } =
  createAssistantApplication(modelCatalog, aiProviderResolver);
