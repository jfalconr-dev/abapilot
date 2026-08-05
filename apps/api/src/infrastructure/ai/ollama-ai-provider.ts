import type { AIProvider, AbapCode, Context, Query, Response } from '@abapilot/core';

import type { OllamaConfig } from './ollama-config.js';

interface OllamaGenerateResponse {
  readonly response: string;
}

type FetchClient = typeof fetch;

const systemPrompt = `Eres un asistente especializado en SAP ECC y desarrollo ABAP.

Tu prioridad es proporcionar información técnicamente correcta, útil y verificable.
No inventes transacciones, objetos del repositorio, tablas, campos, APIs, clases, métodos ni procedimientos SAP.
No presentes como válido código ABAP cuya sintaxis, tipos de datos o compatibilidad no puedas justificar.
Si no conoces con suficiente certeza una respuesta, indícalo expresamente.
Si la respuesta depende de la versión de SAP, de la versión de ABAP, del tipo de ampliación o de información no proporcionada, explica esa dependencia o solicita el dato necesario.
Distingue claramente entre hechos confirmados, recomendaciones y aspectos que deben verificarse.
Prioriza la corrección sobre la extensión de la respuesta.
Responde en español de forma concisa y práctica.`;

export class OllamaAIProvider implements AIProvider {
  public constructor(
    private readonly config: OllamaConfig,
    private readonly fetchClient: FetchClient = fetch,
  ) {}

  public generateResponse(query: Query, context?: Context): Promise<Response> {
    return this.generate(
      this.buildPrompt(
        'Responde a la siguiente consulta relacionada con SAP ECC o el desarrollo ABAP. ' +
          'Proporciona una respuesta técnicamente precisa, directa y ajustada al contexto. ' +
          'No presupongas datos ni características del sistema que no se hayan indicado.',
        query.content,
        context,
      ),
    );
  }

  public explainCode(code: AbapCode, context?: Context): Promise<Response> {
    return this.generate(
      this.buildPrompt(
        'Explica de forma clara el siguiente código ABAP. Describe su propósito y comportamiento, ' +
          'e identifica brevemente posibles implicaciones de rendimiento, seguridad o mantenibilidad. ' +
          'No propongas modificaciones salvo que sean necesarias para explicar un problema relevante.',
        code.content,
        context,
      ),
    );
  }

  public reviewCode(code: AbapCode, context?: Context): Promise<Response> {
    return this.generate(
      this.buildPrompt(
        'Revisa el siguiente código ABAP en cuanto a corrección, rendimiento, seguridad, ' +
          'legibilidad, mantenibilidad y buenas prácticas. Prioriza los problemas por relevancia. ' +
          'Si propones código alternativo, utiliza tipos compatibles, selecciona únicamente los ' +
          'campos necesarios y no presupongas una versión de ABAP no indicada. Señala expresamente ' +
          'cualquier aspecto que dependa del contexto o que deba verificarse.',
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
        system: systemPrompt,
        prompt,
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
