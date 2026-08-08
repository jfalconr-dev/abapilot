import type {
  AIProvider,
  AbapCode,
  CodeSuggestionMode,
  Context,
  Query,
  Response,
} from '@abapilot/core';

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
    const httpResponse = await this.fetchClient(`${this.config.baseUrl}/api/generate`, {
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

    if (!httpResponse.ok) {
      throw new Error(`Ollama ha respondido con el estado HTTP ${httpResponse.status}.`);
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
