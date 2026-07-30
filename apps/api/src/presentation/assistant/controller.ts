import type { AnswerQueryUseCase, Context, Query } from '@abapilot/core';
import type { NextFunction, Request, Response } from 'express';

interface AssistantQueryRequestBody {
  readonly query?: unknown;
  readonly context?: unknown;
}

export class AssistantController {
  public constructor(private readonly answerQueryUseCase: AnswerQueryUseCase) {}

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

    try {
      const result = await this.answerQueryUseCase.execute(query, context);

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
}
