import { Router } from 'express';

import {
  answerQueryUseCase,
  explainAbapCodeUseCase,
  reviewAbapCodeUseCase,
} from '../../application/index.js';
import { AssistantController } from './controller.js';

const router = Router();

const assistantController = new AssistantController(
  answerQueryUseCase,
  explainAbapCodeUseCase,
  reviewAbapCodeUseCase,
);

router.post('/query', assistantController.query.bind(assistantController));
router.post('/explain', assistantController.explain.bind(assistantController));
router.post('/review', assistantController.review.bind(assistantController));

export { router as assistantRouter };
