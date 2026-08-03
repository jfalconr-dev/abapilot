import type { AbapCode, Context, Query, Response } from '../../domain/index.js';

/**
 * Defines the contract implemented by any AI provider.
 */
export interface AIProvider {
  generateResponse(query: Query, context?: Context): Promise<Response>;

  explainCode(code: AbapCode, context?: Context): Promise<Response>;

  reviewCode(code: AbapCode, context?: Context): Promise<Response>;
}
