import type { Context, Query, Response } from '../../domain/index.js';
import type { ModelCatalog } from '../models/index.js';
import type { AIProviderResolver } from '../providers/index.js';

/**
 * Coordinates the process of answering a query from a SAP professional.
 */
export class AnswerQueryUseCase {
  public constructor(
    private readonly modelCatalog: ModelCatalog,
    private readonly aiProviderResolver: AIProviderResolver,
  ) {}

  public execute(modelId: string, query: Query, context?: Context): Promise<Response> {
    const modelDefinition = this.modelCatalog.getById(modelId);
    const aiProvider = this.aiProviderResolver.resolve(modelDefinition);

    return aiProvider.generateResponse(query, context);
  }
}
