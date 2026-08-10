import { DEFAULT_MODEL_ID } from '@abapilot/core';
import request from 'supertest';
import { describe, expect, it } from 'vitest';

import { createTestApp } from './test-app.js';

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
      error: 'El campo query es obligatorio y debe contener texto.',
    });
  });

  it('returns status 400 when the query is missing', async () => {
    const response = await request(createTestApp()).post('/assistant/query').send({
      modelId: DEFAULT_MODEL_ID,
    });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      error: 'El campo query es obligatorio y debe contener texto.',
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
    });
  });

  it('returns status 400 when modelId is empty', async () => {
    const response = await request(createTestApp()).post('/assistant/query').send({
      modelId: '   ',
      query: '¿Cómo puedo analizar un dump ABAP?',
    });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      error: 'El campo modelId es obligatorio y debe contener un identificador de modelo.',
    });
  });

  it('returns status 400 when modelId is missing', async () => {
    const response = await request(createTestApp()).post('/assistant/query').send({
      query: '¿Cómo puedo analizar un dump ABAP?',
    });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      error: 'El campo modelId es obligatorio y debe contener un identificador de modelo.',
    });
  });

  it('returns status 400 when modelId is not supported', async () => {
    const response = await request(createTestApp()).post('/assistant/query').send({
      modelId: 'unsupported-model',
      query: '¿Cómo puedo analizar un dump ABAP?',
    });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      error: 'El modelo solicitado no está soportado por ABAPilot.',
    });
  });
});
