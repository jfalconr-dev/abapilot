import type {
  AIProvider,
  AbapCode,
  CodeSuggestionMode,
  Context,
  Query,
  Response,
} from '@abapilot/core';

import { AIProviderTimeoutError, AIProviderUnavailableError } from './ai-provider-error.js';
import { buildLlmPrompt, type LlmPrompt } from './llm-prompt-policy.js';
import type { OllamaConfig } from './ollama-config.js';

interface OllamaGenerateResponse {
  readonly response: string;
}

type FetchClient = typeof fetch;

export class OllamaAIProvider implements AIProvider {
  public constructor(
    private readonly config: OllamaConfig,
    private readonly providerModel: string,
    private readonly codeSuggestionMode: CodeSuggestionMode,
    private readonly fetchClient: FetchClient = fetch,
  ) {}

  public generateResponse(query: Query, context?: Context): Promise<Response> {
    return this.generate(
      buildLlmPrompt({
        operation: 'query',
        content: query.content,
        ...(context ? { context: context.content } : {}),
        codeSuggestionMode: this.codeSuggestionMode,
      }),
    );
  }

  public explainCode(code: AbapCode, context?: Context): Promise<Response> {
    return this.generate(
      buildLlmPrompt({
        operation: 'explain',
        content: code.content,
        ...(context ? { context: context.content } : {}),
        codeSuggestionMode: this.codeSuggestionMode,
      }),
    );
  }

  public reviewCode(code: AbapCode, context?: Context): Promise<Response> {
    return this.generate(
      buildLlmPrompt({
        operation: 'review',
        content: code.content,
        ...(context ? { context: context.content } : {}),
        codeSuggestionMode: this.codeSuggestionMode,
      }),
    );
  }

  private async generate(llmPrompt: LlmPrompt): Promise<Response> {
    let httpResponse: globalThis.Response;

    try {
      httpResponse = await this.fetchClient(`${this.config.baseUrl}/api/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: this.providerModel,
          system: llmPrompt.system,
          prompt: llmPrompt.prompt,
          stream: false,
          options: {
            temperature: 0.2,
          },
        }),
        signal: AbortSignal.timeout(this.config.timeoutMs),
      });
    } catch (error: unknown) {
      if (isTimeoutError(error)) {
        throw new AIProviderTimeoutError();
      }

      throw new AIProviderUnavailableError();
    }

    if (!httpResponse.ok) {
      throw new AIProviderUnavailableError();
    }

    const responseBody: unknown = await httpResponse.json();

    if (!isOllamaGenerateResponse(responseBody)) {
      throw new Error('Ollama ha devuelto una respuesta con un formato no válido.');
    }

    return {
      content: responseBody.response,
    };
  }
}

const isOllamaGenerateResponse = (value: unknown): value is OllamaGenerateResponse =>
  typeof value === 'object' &&
  value !== null &&
  'response' in value &&
  typeof value.response === 'string';

const isTimeoutError = (error: unknown): boolean =>
  error instanceof DOMException && error.name === 'TimeoutError';
