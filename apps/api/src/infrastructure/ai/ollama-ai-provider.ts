import type { AIProvider, AbapCode, Context, Query, Response } from '@abapilot/core';

import type { OllamaConfig } from './ollama-config.js';

interface OllamaGenerateResponse {
  readonly response: string;
}

type FetchClient = typeof fetch;

export class OllamaAIProvider implements AIProvider {
  public constructor(
    private readonly config: OllamaConfig,
    private readonly fetchClient: FetchClient = fetch,
  ) {}

  public generateResponse(query: Query, context?: Context): Promise<Response> {
    return this.generate(
      this.buildPrompt(
        'Responde a la siguiente consulta relacionada con el ecosistema SAP.',
        query.content,
        context,
      ),
    );
  }

  public explainCode(code: AbapCode, context?: Context): Promise<Response> {
    return this.generate(
      this.buildPrompt('Explica de forma clara el siguiente código ABAP.', code.content, context),
    );
  }

  public reviewCode(code: AbapCode, context?: Context): Promise<Response> {
    return this.generate(
      this.buildPrompt(
        'Revisa el siguiente código ABAP e identifica oportunidades de mejora en su legibilidad, mantenibilidad y buenas prácticas.',
        code.content,
        context,
      ),
    );
  }

  private async generate(prompt: string): Promise<Response> {
    const httpResponse = await this.fetchClient(`${this.config.baseUrl}/api/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: this.config.model,
        prompt,
        stream: false,
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

  private buildPrompt(instruction: string, content: string, context?: Context): string {
    const contextSection = context ? `\n\nContexto adicional:\n${context.content}` : '';

    return `${instruction}\n\nContenido:\n${content}${contextSection}`;
  }
}

const isOllamaGenerateResponse = (value: unknown): value is OllamaGenerateResponse =>
  typeof value === 'object' &&
  value !== null &&
  'response' in value &&
  typeof value.response === 'string';
