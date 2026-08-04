import { describe, expect, it, vi } from 'vitest';

import { OllamaAIProvider } from '../src/infrastructure/ai/ollama-ai-provider.js';

const config = {
  baseUrl: 'http://localhost:11434',
  model: 'qwen2.5-coder:7b',
  timeoutMs: 120_000,
};

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
          prompt:
            'Responde a la siguiente consulta relacionada con el ecosistema SAP.\n\n' +
            'Contenido:\n¿Cómo puedo implementar una BAdI en SAP ECC?\n\n' +
            'Contexto adicional:\nEl usuario desarrolla en ABAP sobre SAP ECC.',
          stream: false,
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
      'Explica de forma clara el siguiente código ABAP.\n\n' +
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
      'Revisa el siguiente código ABAP e identifica oportunidades de mejora en su ' +
        'legibilidad, mantenibilidad y buenas prácticas.\n\n' +
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
    prompt: expectedPrompt,
    stream: false,
  });
};
