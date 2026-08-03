import { Router } from 'express';

import { answerQueryUseCase, explainAbapCodeUseCase } from '../../application/index.js';
import { AssistantController } from './controller.js';

const router = Router();

const assistantController = new AssistantController(answerQueryUseCase, explainAbapCodeUseCase);

router.post('/query', assistantController.query.bind(assistantController));
router.post('/explain', assistantController.explain.bind(assistantController));

export { router as assistantRouter };
