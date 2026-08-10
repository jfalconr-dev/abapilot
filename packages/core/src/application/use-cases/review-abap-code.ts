import type { AbapCode, Context, Response } from '../../domain/index.js';
import type { ModelCatalog } from '../models/index.js';
import type { AIProviderResolver } from '../providers/index.js';

/**
 * Coordinates the process of reviewing ABAP source code.
 */
export class ReviewAbapCodeUseCase {
  public constructor(
    private readonly modelCatalog: ModelCatalog,
    private readonly aiProviderResolver: AIProviderResolver,
  ) {}

  public execute(modelId: string, code: AbapCode, context?: Context): Promise<Response> {
    const modelDefinition = this.modelCatalog.getById(modelId);
    const aiProvider = this.aiProviderResolver.resolve(modelDefinition);

    return aiProvider.reviewCode(code, context);
  }
}
