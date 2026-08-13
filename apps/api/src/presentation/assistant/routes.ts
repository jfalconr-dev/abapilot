import type {
  AnswerQueryUseCase,
  ExplainAbapCodeUseCase,
  ModelCatalog,
  ReviewAbapCodeUseCase,
} from '@abapcompass/core';
import { Router, type Router as ExpressRouter } from 'express';

import { AssistantController } from './controller.js';

export interface AssistantRouterDependencies {
  readonly modelCatalog: ModelCatalog;
  readonly answerQueryUseCase: AnswerQueryUseCase;
  readonly explainAbapCodeUseCase: ExplainAbapCodeUseCase;
  readonly reviewAbapCodeUseCase: ReviewAbapCodeUseCase;
}

export const createAssistantRouter = (dependencies: AssistantRouterDependencies): ExpressRouter => {
  const router = Router();

  const assistantController = new AssistantController(
    dependencies.modelCatalog,
    dependencies.answerQueryUseCase,
    dependencies.explainAbapCodeUseCase,
    dependencies.reviewAbapCodeUseCase,
  );

  router.post('/query', assistantController.query.bind(assistantController));
  router.post('/explain', assistantController.explain.bind(assistantController));
  router.post('/review', assistantController.review.bind(assistantController));

  return router;
};
