import { DEFAULT_MODEL_ID, ModelCatalog } from '@abapilot/core';
import request from 'supertest';
import { describe, expect, it } from 'vitest';

import { PROFESSIONAL_VALIDATION } from '../src/presentation/assistant/professional-validation.js';
import { createTestApp } from './test-app.js';

const modelCatalog = new ModelCatalog();
const defaultModel = modelCatalog.getById(DEFAULT_MODEL_ID);

const expectedMetadata = {
  modelId: DEFAULT_MODEL_ID,
  codeSuggestionMode: defaultModel.codeSuggestionMode,
  validation: PROFESSIONAL_VALIDATION,
};

interface AssistantSuccessResponseBody {
  readonly response: string;
  readonly modelId: string;
  readonly codeSuggestionMode: 'none' | 'snippets' | 'full';
  readonly validation: {
    readonly title: string;
    readonly message: string;
  };
}

describe('POST /assistant/query', () => {
  it('returns the exact JSON response for a valid query', async () => {
    const query = '¿Cómo puedo analizar un dump ABAP?';

    const response = await request(createTestApp()).post('/assistant/query').send({
      modelId: DEFAULT_MODEL_ID,
      query,
    });

    expect(response.status).toBe(200);
    expect(response.headers['content-type']).toContain('application/json');
    expect(response.body).toEqual({
      response: `Respuesta estática para la consulta: ${query}`,
      ...expectedMetadata,
    });
  });

  it('trims the modelId, query and context', async () => {
    const response = await request(createTestApp())
      .post('/assistant/query')
      .send({
        modelId: `  ${DEFAULT_MODEL_ID}  `,
        query: '  ¿Cómo puedo analizar un dump ABAP?  ',
        context: '  El dump se ha producido en un proceso de fondo.  ',
      });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      response:
        'Respuesta estática para la consulta: ¿Cómo puedo analizar un dump ABAP?' +
        ' Contexto recibido: El dump se ha producido en un proceso de fondo.',
      ...expectedMetadata,
    });
  });

  it.each([
    ['empty', '   '],
    ['null', null],
    ['number', 42],
    ['boolean', true],
    ['object', {}],
    ['array', []],
  ])('returns status 400 when the query is %s', async (_description, query) => {
    const response = await request(createTestApp()).post('/assistant/query').send({
      modelId: DEFAULT_MODEL_ID,
      query,
    });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      code: 'INVALID_REQUEST',
      message: 'El campo query es obligatorio y debe contener texto.',
    });
  });

  it('returns status 400 when the query is missing', async () => {
    const response = await request(createTestApp()).post('/assistant/query').send({
      modelId: DEFAULT_MODEL_ID,
    });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      code: 'INVALID_REQUEST',
      message: 'El campo query es obligatorio y debe contener texto.',
    });
  });

  it.each([
    ['empty', '   '],
    ['null', null],
    ['number', 42],
    ['boolean', true],
    ['object', {}],
    ['array', []],
  ])('ignores the context when it is %s', async (_description, context) => {
    const query = '¿Cómo puedo analizar un dump ABAP?';

    const response = await request(createTestApp()).post('/assistant/query').send({
      modelId: DEFAULT_MODEL_ID,
      query,
      context,
    });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      response: `Respuesta estática para la consulta: ${query}`,
      ...expectedMetadata,
    });
  });

  it('returns status 400 when modelId is empty', async () => {
    const response = await request(createTestApp()).post('/assistant/query').send({
      modelId: '   ',
      query: '¿Cómo puedo analizar un dump ABAP?',
    });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      code: 'INVALID_REQUEST',
      message: 'El campo modelId es obligatorio y debe contener un identificador de modelo.',
    });
  });

  it('returns status 400 when modelId is missing', async () => {
    const response = await request(createTestApp()).post('/assistant/query').send({
      query: '¿Cómo puedo analizar un dump ABAP?',
    });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      code: 'INVALID_REQUEST',
      message: 'El campo modelId es obligatorio y debe contener un identificador de modelo.',
    });
  });

  it('returns status 400 when modelId is not supported', async () => {
    const response = await request(createTestApp()).post('/assistant/query').send({
      modelId: 'unsupported-model',
      query: '¿Cómo puedo analizar un dump ABAP?',
    });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      code: 'MODEL_NOT_SUPPORTED',
      message: 'El modelo solicitado no está soportado por ABAPilot.',
    });
  });

  it('includes the professional validation warning in successful responses', async () => {
    const response = await request(createTestApp()).post('/assistant/query').send({
      modelId: DEFAULT_MODEL_ID,
      query: '¿Cómo puedo generar un albarán a partir de un pedido?',
    });

    expect(response.status).toBe(200);

    const responseBody = response.body as AssistantSuccessResponseBody;

    expect(responseBody.validation.title).toBe('Validación profesional requerida');

    expect(responseBody.validation.message).toContain(
      'No incorpores código ni ejecutes acciones propuestas directamente en entornos productivos',
    );

    expect(responseBody.validation.message).toContain('sin una revisión técnica previa.');
  });
});
