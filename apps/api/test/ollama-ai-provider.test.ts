import { describe, expect, it, vi } from 'vitest';

import { OllamaAIProvider } from '../src/infrastructure/ai/ollama-ai-provider.js';

const config = {
  baseUrl: 'http://localhost:11434',
  model: 'qwen2.5-coder:7b',
  timeoutMs: 120_000,
};

const providerModel = 'qwen2.5-coder:7b';
const codeSuggestionMode = 'snippets' as const;

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
    const provider = new OllamaAIProvider(config, providerModel, codeSuggestionMode, fetchClient);

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
      }),
    );

    const requestBody = getRequestBody(fetchClient);
    const system = requestBody.system;

    if (typeof system !== 'string') {
      throw new TypeError('El prompt de sistema debe ser una cadena.');
    }

    expect(system).toContain('Política de generación de código:');
    expect(system).toContain('Puedes incluir únicamente fragmentos mínimos de código');

    expect(requestBody).toEqual({
      model: 'qwen2.5-coder:7b',
      system,
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
    });
    const requestOptions = fetchClient.mock.calls[0]?.[1];

    expect(requestOptions?.signal).toBeInstanceOf(AbortSignal);
  });

  it('should use the ABAP explanation instruction', async () => {
    const fetchClient = createSuccessfulFetch('El código declara una variable.');
    const provider = new OllamaAIProvider(config, providerModel, codeSuggestionMode, fetchClient);

    await provider.explainCode({
      content: 'DATA lv_value TYPE string.',
    });

    expectRequestPrompt(fetchClient, [
      'Explica de forma clara el siguiente código ABAP.',
      'Contenido:\nDATA lv_value TYPE string.',
    ]);
  });

  it('should use the ABAP review instruction', async () => {
    const fetchClient = createSuccessfulFetch('La revisión no identifica errores.');
    const provider = new OllamaAIProvider(config, providerModel, codeSuggestionMode, fetchClient);

    await provider.reviewCode({
      content: 'WRITE lv_value.',
    });

    expectRequestPrompt(fetchClient, [
      'Revisa el siguiente código ABAP en cuanto a corrección, rendimiento, seguridad,',
      'Clasifica cada hallazgo exclusivamente como error confirmado, riesgo condicionado o mejora opcional',
      'Contenido:\nWRITE lv_value.',
    ]);
  });

  it('should reject an unsuccessful HTTP response', async () => {
    const fetchClient = vi
      .fn<typeof fetch>()
      .mockResolvedValue(new Response(null, { status: 500 }));
    const provider = new OllamaAIProvider(config, providerModel, codeSuggestionMode, fetchClient);

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
    const provider = new OllamaAIProvider(config, providerModel, codeSuggestionMode, fetchClient);

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
  expectedFragments: readonly string[],
): void => {
  const prompt = getRequestBody(fetchClient).prompt;

  if (typeof prompt !== 'string') {
    throw new TypeError('El prompt de la petición debe ser una cadena.');
  }

  for (const fragment of expectedFragments) {
    expect(prompt).toContain(fragment);
  }
};

const getRequestBody = (
  fetchClient: ReturnType<typeof createSuccessfulFetch>,
): Record<string, unknown> => {
  const requestOptions = fetchClient.mock.calls[0]?.[1];
  const requestBody = requestOptions?.body;

  if (typeof requestBody !== 'string') {
    throw new TypeError('El cuerpo de la petición debe ser una cadena JSON.');
  }

  const parsedRequestBody: unknown = JSON.parse(requestBody);

  if (
    typeof parsedRequestBody !== 'object' ||
    parsedRequestBody === null ||
    !('prompt' in parsedRequestBody)
  ) {
    throw new TypeError('El cuerpo de la petición no tiene el formato esperado.');
  }

  return parsedRequestBody;
};
