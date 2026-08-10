import type {
  AbapCode,
  AnswerQueryUseCase,
  Context,
  ExplainAbapCodeUseCase,
  Query,
  ReviewAbapCodeUseCase,
} from '@abapilot/core';
import type { NextFunction, Request, Response } from 'express';

interface AssistantQueryRequestBody {
  readonly modelId?: unknown;
  readonly query?: unknown;
  readonly context?: unknown;
}

interface AssistantCodeRequestBody {
  readonly modelId?: unknown;
  readonly code?: unknown;
  readonly context?: unknown;
}

export class AssistantController {
  public constructor(
    private readonly answerQueryUseCase: AnswerQueryUseCase,
    private readonly explainAbapCodeUseCase: ExplainAbapCodeUseCase,
    private readonly reviewAbapCodeUseCase: ReviewAbapCodeUseCase,
  ) {}

  public async query(
    request: Request<Record<string, never>, unknown, AssistantQueryRequestBody>,
    response: Response,
    next: NextFunction,
  ): Promise<void> {
    const queryContent = request.body.query;

    if (typeof queryContent !== 'string' || queryContent.trim().length === 0) {
      response.status(400).json({
        error: 'El campo query es obligatorio y debe contener texto.',
      });

      return;
    }

    const query: Query = {
      content: queryContent.trim(),
    };

    const context = this.createContext(request.body.context);
    const modelId = this.createModelId(request.body.modelId);

    if (modelId === undefined) {
      response.status(400).json({
        error: 'El campo modelId es obligatorio y debe contener un identificador de modelo.',
      });

      return;
    }

    try {
      const result = await this.answerQueryUseCase.execute(modelId, query, context);

      response.status(200).json({
        response: result.content,
      });
    } catch (error: unknown) {
      next(error);
    }
  }

  public async explain(
    request: Request<Record<string, never>, unknown, AssistantCodeRequestBody>,
    response: Response,
    next: NextFunction,
  ): Promise<void> {
    const codeContent = request.body.code;

    if (typeof codeContent !== 'string' || codeContent.trim().length === 0) {
      response.status(400).json({
        error: 'El campo code es obligatorio y debe contener código ABAP.',
      });

      return;
    }

    const code: AbapCode = {
      content: codeContent.trim(),
    };

    const context = this.createContext(request.body.context);
    const modelId = this.createModelId(request.body.modelId);

    if (modelId === undefined) {
      response.status(400).json({
        error: 'El campo modelId es obligatorio y debe contener un identificador de modelo.',
      });

      return;
    }

    try {
      const result = await this.explainAbapCodeUseCase.execute(modelId, code, context);

      response.status(200).json({
        response: result.content,
      });
    } catch (error: unknown) {
      next(error);
    }
  }

  public async review(
    request: Request<Record<string, never>, unknown, AssistantCodeRequestBody>,
    response: Response,
    next: NextFunction,
  ): Promise<void> {
    const codeContent = request.body.code;

    if (typeof codeContent !== 'string' || codeContent.trim().length === 0) {
      response.status(400).json({
        error: 'El campo code es obligatorio y debe contener código ABAP.',
      });

      return;
    }

    const code: AbapCode = {
      content: codeContent.trim(),
    };

    const context = this.createContext(request.body.context);
    const modelId = this.createModelId(request.body.modelId);

    if (modelId === undefined) {
      response.status(400).json({
        error: 'El campo modelId es obligatorio y debe contener un identificador de modelo.',
      });

      return;
    }

    try {
      const result = await this.reviewAbapCodeUseCase.execute(modelId, code, context);

      response.status(200).json({
        response: result.content,
      });
    } catch (error: unknown) {
      next(error);
    }
  }

  private createContext(contextContent: unknown): Context | undefined {
    if (typeof contextContent !== 'string' || contextContent.trim().length === 0) {
      return undefined;
    }

    return {
      content: contextContent.trim(),
    };
  }

  private createModelId(modelId: unknown): string | undefined {
    if (typeof modelId !== 'string' || modelId.trim().length === 0) {
      return undefined;
    }

    return modelId.trim();
  }
}
