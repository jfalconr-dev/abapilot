import { Router } from 'express';

import { answerQueryUseCase } from '../../application/index.js';
import { AssistantController } from './controller.js';

const router = Router();

const assistantController = new AssistantController(answerQueryUseCase);

router.post('/query', assistantController.query.bind(assistantController));

export { router as assistantRouter };
