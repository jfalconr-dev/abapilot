import { DEFAULT_MODEL_ID } from '@abapilot/core';
import request from 'supertest';
import { describe, expect, it } from 'vitest';

import { createTestApp } from './test-app.js';

describe('POST /assistant/review', () => {
  it('returns the exact JSON response for valid ABAP code', async () => {
    const code = 'SELECT * FROM mara INTO TABLE lt_mara.';

    const response = await request(createTestApp()).post('/assistant/review').send({
      modelId: DEFAULT_MODEL_ID,
      code,
    });

    expect(response.status).toBe(200);
    expect(response.headers['content-type']).toContain('application/json');
    expect(response.body).toEqual({
      response: `Revisión estática para el código ABAP: ${code}`,
    });
  });

  it('trims the modelId, code and context', async () => {
    const response = await request(createTestApp())
      .post('/assistant/review')
      .send({
        modelId: `  ${DEFAULT_MODEL_ID}  `,
        code: '  SELECT * FROM mara INTO TABLE lt_mara.  ',
        context: '  El código se ejecuta en SAP ECC.  ',
      });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      response:
        'Revisión estática para el código ABAP: SELECT * FROM mara INTO TABLE lt_mara.' +
        ' Contexto recibido: El código se ejecuta en SAP ECC.',
    });
  });

  it.each([
    ['empty', '   '],
    ['null', null],
    ['number', 42],
    ['boolean', true],
    ['object', {}],
    ['array', []],
  ])('returns status 400 when the code is %s', async (_description, code) => {
    const response = await request(createTestApp()).post('/assistant/review').send({
      modelId: DEFAULT_MODEL_ID,
      code,
    });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      error: 'El campo code es obligatorio y debe contener código ABAP.',
    });
  });

  it('returns status 400 when the code is missing', async () => {
    const response = await request(createTestApp()).post('/assistant/review').send({
      modelId: DEFAULT_MODEL_ID,
    });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      error: 'El campo code es obligatorio y debe contener código ABAP.',
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
    const code = 'SELECT * FROM mara INTO TABLE lt_mara.';

    const response = await request(createTestApp()).post('/assistant/review').send({
      modelId: DEFAULT_MODEL_ID,
      code,
      context,
    });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      response: `Revisión estática para el código ABAP: ${code}`,
    });
  });

  it('returns status 400 when modelId is empty', async () => {
    const response = await request(createTestApp()).post('/assistant/review').send({
      modelId: '   ',
      code: 'SELECT * FROM mara INTO TABLE lt_mara.',
    });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      error: 'El campo modelId es obligatorio y debe contener un identificador de modelo.',
    });
  });

  it('returns status 400 when modelId is missing', async () => {
    const response = await request(createTestApp()).post('/assistant/review').send({
      code: 'SELECT * FROM mara INTO TABLE lt_mara.',
    });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      error: 'El campo modelId es obligatorio y debe contener un identificador de modelo.',
    });
  });

  it('returns status 400 when modelId is not supported', async () => {
    const response = await request(createTestApp()).post('/assistant/review').send({
      modelId: 'unsupported-model',
      code: 'SELECT * FROM mara INTO TABLE lt_mara.',
    });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      error: 'El modelo solicitado no está soportado por ABAPilot.',
    });
  });
});
