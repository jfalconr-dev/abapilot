import type { AIProvider, AbapCode, Context, Query, Response } from '@abapilot/core';

export class StaticAIProvider implements AIProvider {
  public generateResponse(query: Query, context?: Context): Promise<Response> {
    const contextReference = context ? ` Contexto recibido: ${context.content}` : '';

    return Promise.resolve({
      content: `Respuesta estática para la consulta: ${query.content}${contextReference}`,
    });
  }

  public explainCode(code: AbapCode, context?: Context): Promise<Response> {
    const contextReference = context ? ` Contexto recibido: ${context.content}` : '';

    return Promise.resolve({
      content: `Explicación estática para el código ABAP: ${code.content}${contextReference}`,
    });
  }
}
