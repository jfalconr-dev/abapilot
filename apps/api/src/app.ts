import express, { type Express } from 'express';

import { assistantRouter } from './presentation/index.js';

export const createApp = (): Express => {
  const app = express();

  app.use(express.json());

  app.use('/assistant', assistantRouter);

  return app;
};
