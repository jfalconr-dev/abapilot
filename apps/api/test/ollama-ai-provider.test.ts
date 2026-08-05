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
No presentes como error confirmado aquello que solo sea un riesgo o dependa del contexto.
No afirmes compatibilidad con una versión de ABAP si no se ha proporcionado esa versión.
Propón código alternativo solo cuando puedas justificar su sintaxis y conservar el comportamiento funcional del código original.
Antes de incluir código alternativo, comprueba que sea coherente con la explicación que lo acompaña.
Si no puedes garantizar una corrección válida, describe el cambio necesario sin generar código.
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
        'contexto. Si no puedes garantizar un fragmento válido, describe el cambio sin generar código.\n\n' +
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
