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
No presentes como error confirmado aquello que solo sea un riesgo o dependa del contexto.
No afirmes compatibilidad con una versión de ABAP si no se ha proporcionado esa versión.
Propón código alternativo solo cuando puedas justificar su sintaxis y conservar el comportamiento funcional del código original.
Antes de incluir código alternativo, comprueba que sea coherente con la explicación que lo acompaña.
Si no puedes garantizar una corrección válida, describe el cambio necesario sin generar código.
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
          'legibilidad, mantenibilidad y buenas prácticas. Ordena los hallazgos por relevancia. ' +
          'Clasifica cada hallazgo exclusivamente como error confirmado, riesgo condicionado o ' +
          'mejora opcional, y justifica la clasificación. No presentes como error una consecuencia ' +
          'normal de ABAP ni una situación que dependa de requisitos desconocidos. Las declaraciones ' +
          'inline mediante DATA(...) no requieren una inicialización previa independiente; considera ' +
          'su compatibilidad dependiente de la versión de ABAP. No inventes campos, filtros, ' +
          'requisitos funcionales, autorizaciones ni características del sistema. En operaciones de ' +
          'lectura sin condiciones, señala el posible riesgo de volumen cuando no se conozca el tamaño ' +
          'de los datos, sin afirmar que exista necesariamente un problema. Si faltan la versión de ' +
          'ABAP, el volumen de datos o el objetivo funcional y condicionan la solución, indica qué ' +
          'información debe verificarse. Puedes incluir únicamente fragmentos mínimos de código para ' +
          'ilustrar mejoras concretas cuya validez puedas justificar. No generes una versión completa ' +
          'del programa ni presentes un fragmento como solución integral. Cada fragmento debe limitarse ' +
          'al hallazgo explicado, conservar el comportamiento conocido y no depender de declaraciones ' +
          'omitidas o duplicadas. Indica expresamente qué aspectos permanecen sin resolver por falta de ' +
          'contexto. Si no puedes garantizar un fragmento válido, describe el cambio sin generar código.',
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
