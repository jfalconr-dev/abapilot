import express, { type Express } from 'express';

import { assistantRouter, healthRouter } from './presentation/index.js';

export const createApp = (): Express => {
  const app = express();

  app.use(express.json());

  app.use('/health', healthRouter);
  app.use('/assistant', assistantRouter);

  return app;
};
