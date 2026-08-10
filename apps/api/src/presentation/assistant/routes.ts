import type {
  AnswerQueryUseCase,
  ExplainAbapCodeUseCase,
  ReviewAbapCodeUseCase,
} from '@abapilot/core';
import { Router, type Router as ExpressRouter } from 'express';

import { AssistantController } from './controller.js';

export interface AssistantRouterDependencies {
  readonly answerQueryUseCase: AnswerQueryUseCase;
  readonly explainAbapCodeUseCase: ExplainAbapCodeUseCase;
  readonly reviewAbapCodeUseCase: ReviewAbapCodeUseCase;
}

export const createAssistantRouter = (dependencies: AssistantRouterDependencies): ExpressRouter => {
  const router = Router();

  const assistantController = new AssistantController(
    dependencies.answerQueryUseCase,
    dependencies.explainAbapCodeUseCase,
    dependencies.reviewAbapCodeUseCase,
  );

  router.post('/query', assistantController.query.bind(assistantController));
  router.post('/explain', assistantController.explain.bind(assistantController));
  router.post('/review', assistantController.review.bind(assistantController));

  return router;
};
