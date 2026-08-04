import { Router } from 'express';

import { getHealthStatus } from '../../index.js';

const router = Router();

router.get('/', (_request, response) => {
  response.status(200).json(getHealthStatus());
});

export { router as healthRouter };
