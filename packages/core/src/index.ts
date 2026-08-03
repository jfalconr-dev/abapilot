export type { AIProvider } from './application/index.js';

export {
  AnswerQueryUseCase,
  ExplainAbapCodeUseCase,
  ReviewAbapCodeUseCase,
} from './application/index.js';

export type { AbapCode, Context, Query, Response, SapProfessional } from './domain/index.js';

export const PROJECT_NAME = 'ABAPilot' as const;
export const PROJECT_VERSION = '0.1.0' as const;

export interface ProjectMetadata {
  readonly name: typeof PROJECT_NAME;
  readonly version: typeof PROJECT_VERSION;
  readonly description: string;
}

export const getProjectMetadata = (): ProjectMetadata => ({
  name: PROJECT_NAME,
  version: PROJECT_VERSION,
  description: 'AI Workspace para profesionales SAP ECC',
});
