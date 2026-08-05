import { describe, expect, it, vi } from 'vitest';

import { OllamaAIProvider } from '../src/infrastructure/ai/ollama-ai-provider.js';

const config = {
  baseUrl: 'http://localhost:11434',
  model: 'qwen2.5-coder:7b',
  timeoutMs: 120_000,
};

const systemPrompt = `Eres un asistente especializado en SAP ECC y desarrollo ABAP.

Tu prioridad es proporcionar información técnicamente correcta, útil y verificable.
No inventes transacciones, objetos del repositorio, tablas, campos, APIs, clases, métodos ni procedimientos SAP.
No presentes como válido código ABAP cuya sintaxis, tipos de datos o compatibilidad no puedas justificar.
Si no conoces con suficiente certeza una respuesta, indícalo expresamente.
Si la respuesta depende de la versión de SAP, de la versión de ABAP, del tipo de ampliación o de información no proporcionada, explica esa dependencia o solicita el dato necesario.
Distingue claramente entre hechos confirmados, recomendaciones y aspectos que deben verificarse.
Prioriza la corrección sobre la extensión de la respuesta.
Responde en español de forma concisa y práctica.`;

describe('OllamaAIProvider', () => {
  it('should generate a response for a query', async () => {
    const fetchClient = vi.fn<typeof fetch>().mockResolvedValue(
      new Response(
        JSON.stringify({
          response: 'Puede implementar la BAdI utilizando la transacción SE19.',
        }),
        {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
          },
        },
      ),
    );
    const provider = new OllamaAIProvider(config, fetchClient);

    const response = await provider.generateResponse(
      {
        content: '¿Cómo puedo implementar una BAdI en SAP ECC?',
      },
      {
        content: 'El usuario desarrolla en ABAP sobre SAP ECC.',
      },
    );

    expect(response).toEqual({
      content: 'Puede implementar la BAdI utilizando la transacción SE19.',
    });
    expect(fetchClient).toHaveBeenCalledOnce();
    expect(fetchClient).toHaveBeenCalledWith(
      'http://localhost:11434/api/generate',
      expect.objectContaining({
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'qwen2.5-coder:7b',
          system: systemPrompt,
          prompt:
            'Responde a la siguiente consulta relacionada con SAP ECC o el desarrollo ABAP. ' +
            'Proporciona una respuesta técnicamente precisa, directa y ajustada al contexto. ' +
            'No presupongas datos ni características del sistema que no se hayan indicado.\n\n' +
            'Contenido:\n¿Cómo puedo implementar una BAdI en SAP ECC?\n\n' +
            'Contexto adicional:\nEl usuario desarrolla en ABAP sobre SAP ECC.',
          stream: false,
          options: {
            temperature: 0.2,
          },
        }),
      }),
    );
    const requestOptions = fetchClient.mock.calls[0]?.[1];

    expect(requestOptions?.signal).toBeInstanceOf(AbortSignal);
  });

  it('should use the ABAP explanation instruction', async () => {
    const fetchClient = createSuccessfulFetch('El código declara una variable.');
    const provider = new OllamaAIProvider(config, fetchClient);

    await provider.explainCode({
      content: 'DATA lv_value TYPE string.',
    });

    expectRequestPrompt(
      fetchClient,
      'Explica de forma clara el siguiente código ABAP. Describe su propósito y comportamiento, ' +
        'e identifica brevemente posibles implicaciones de rendimiento, seguridad o mantenibilidad. ' +
        'No propongas modificaciones salvo que sean necesarias para explicar un problema relevante.\n\n' +
        'Contenido:\nDATA lv_value TYPE string.',
    );
  });

  it('should use the ABAP review instruction', async () => {
    const fetchClient = createSuccessfulFetch('La revisión no identifica errores.');
    const provider = new OllamaAIProvider(config, fetchClient);

    await provider.reviewCode({
      content: 'WRITE lv_value.',
    });

    expectRequestPrompt(
      fetchClient,
      'Revisa el siguiente código ABAP en cuanto a corrección, rendimiento, seguridad, ' +
        'legibilidad, mantenibilidad y buenas prácticas. Prioriza los problemas por relevancia. ' +
        'Si propones código alternativo, utiliza tipos compatibles, selecciona únicamente los ' +
        'campos necesarios y no presupongas una versión de ABAP no indicada. Señala expresamente ' +
        'cualquier aspecto que dependa del contexto o que deba verificarse.\n\n' +
        'Contenido:\nWRITE lv_value.',
    );
  });

  it('should reject an unsuccessful HTTP response', async () => {
    const fetchClient = vi
      .fn<typeof fetch>()
      .mockResolvedValue(new Response(null, { status: 500 }));
    const provider = new OllamaAIProvider(config, fetchClient);

    await expect(
      provider.generateResponse({
        content: 'Consulta de prueba.',
      }),
    ).rejects.toThrow('Ollama ha respondido con el estado HTTP 500.');
  });

  it('should reject an invalid response body', async () => {
    const fetchClient = vi.fn<typeof fetch>().mockResolvedValue(
      new Response(JSON.stringify({ unexpected: 'value' }), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
      }),
    );
    const provider = new OllamaAIProvider(config, fetchClient);

    await expect(
      provider.generateResponse({
        content: 'Consulta de prueba.',
      }),
    ).rejects.toThrow('Ollama ha devuelto una respuesta con un formato no válido.');
  });
});

function createSuccessfulFetch(content: string): ReturnType<typeof vi.fn<typeof fetch>> {
  return vi.fn<typeof fetch>().mockResolvedValue(
    new Response(JSON.stringify({ response: content }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    }),
  );
}

const expectRequestPrompt = (
  fetchClient: ReturnType<typeof createSuccessfulFetch>,
  expectedPrompt: string,
): void => {
  const requestOptions = fetchClient.mock.calls[0]?.[1];
  const requestBody = requestOptions?.body;

  if (typeof requestBody !== 'string') {
    throw new TypeError('El cuerpo de la petición debe ser una cadena JSON.');
  }

  const parsedRequestBody: unknown = JSON.parse(requestBody);

  expect(parsedRequestBody).toEqual({
    model: 'qwen2.5-coder:7b',
    system: systemPrompt,
    prompt: expectedPrompt,
    stream: false,
    options: {
      temperature: 0.2,
    },
  });
};
