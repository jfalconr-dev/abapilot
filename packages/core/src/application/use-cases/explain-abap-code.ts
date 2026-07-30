import type { AbapCode, Context, Response } from '../../domain/index.js';
import type { AIProvider } from '../ports/index.js';

export class ExplainAbapCodeUseCase {
  constructor(private readonly aiProvider: AIProvider) {}

  execute(code: AbapCode, context?: Context): Promise<Response> {
    return this.aiProvider.explainCode(code, context);
  }
}
