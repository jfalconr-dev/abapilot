import express, { type Express } from 'express';

import {
  answerQueryUseCase,
  explainAbapCodeUseCase,
  reviewAbapCodeUseCase,
} from './application/index.js';
import { errorHandler } from './presentation/error-handler.js';
import {
  createAssistantRouter,
  healthRouter,
  modelsRouter,
  type AssistantRouterDependencies,
} from './presentation/index.js';

const defaultAssistantDependencies: AssistantRouterDependencies = {
  answerQueryUseCase,
  explainAbapCodeUseCase,
  reviewAbapCodeUseCase,
};

export const createApp = (
  assistantDependencies: AssistantRouterDependencies = defaultAssistantDependencies,
): Express => {
  const app = express();

  app.use(express.json());

  app.use('/health', healthRouter);
  app.use('/models', modelsRouter);
  app.use('/assistant', createAssistantRouter(assistantDependencies));

  app.use(errorHandler);

  return app;
};
