import type { Context, Query, Response } from '../../domain/index.js';
import type { AIProvider } from '../ports/index.js';

/**
 * Coordinates the process of answering a query from a SAP professional.
 */
export class AnswerQueryUseCase {
  public constructor(private readonly aiProvider: AIProvider) {}

  public execute(query: Query, context?: Context): Promise<Response> {
    return this.aiProvider.generateResponse(query, context);
  }
}
