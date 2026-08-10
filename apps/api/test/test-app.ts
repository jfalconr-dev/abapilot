import type { Express } from 'express';

import { createAssistantApplication } from '../src/application/index.js';
import { createApp } from '../src/app.js';
import { StaticAIProvider } from '../src/infrastructure/ai/static-ai-provider.js';

export const createTestApp = (): Express =>
  createApp(createAssistantApplication(new StaticAIProvider()));
