import type { AbapCode, Context, Response } from '../../domain/index.js';
import type { AIProvider } from '../ports/index.js';

/**
 * Coordinates the process of explaining ABAP source code.
 */
export class ExplainAbapCodeUseCase {
  public constructor(private readonly aiProvider: AIProvider) {}

  public execute(code: AbapCode, context?: Context): Promise<Response> {
    return this.aiProvider.explainCode(code, context);
  }
}
