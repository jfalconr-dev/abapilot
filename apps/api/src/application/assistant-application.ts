import {
  AnswerQueryUseCase,
  ExplainAbapCodeUseCase,
  ModelCatalog,
  ReviewAbapCodeUseCase,
  type AIProvider,
} from '@abapilot/core';

import { createAIProviderResolver } from '../infrastructure/ai/index.js';

export interface AssistantApplication {
  readonly answerQueryUseCase: AnswerQueryUseCase;
  readonly explainAbapCodeUseCase: ExplainAbapCodeUseCase;
  readonly reviewAbapCodeUseCase: ReviewAbapCodeUseCase;
}

export const createAssistantApplication = (aiProvider: AIProvider): AssistantApplication => ({
  answerQueryUseCase: new AnswerQueryUseCase(aiProvider),
  explainAbapCodeUseCase: new ExplainAbapCodeUseCase(aiProvider),
  reviewAbapCodeUseCase: new ReviewAbapCodeUseCase(aiProvider),
});

const modelCatalog = new ModelCatalog();
const aiProviderResolver = createAIProviderResolver();

const defaultModelDefinition = modelCatalog.getById(modelCatalog.getDefaultModelId());

const aiProvider = aiProviderResolver.resolve(defaultModelDefinition);

export const { answerQueryUseCase, explainAbapCodeUseCase, reviewAbapCodeUseCase } =
  createAssistantApplication(aiProvider);
