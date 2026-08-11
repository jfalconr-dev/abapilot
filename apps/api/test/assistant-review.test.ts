import { DEFAULT_MODEL_ID, ModelCatalog, type AIProvider } from '@abapilot/core';
import request from 'supertest';
import { describe, expect, it } from 'vitest';

import { PROFESSIONAL_VALIDATION } from '../src/presentation/assistant/professional-validation.js';
import { createTestApp } from './test-app.js';

const modelCatalog = new ModelCatalog();
const defaultModel = modelCatalog.getById(DEFAULT_MODEL_ID);

const expectedMetadata = {
  modelId: DEFAULT_MODEL_ID,
  codeSuggestionMode: defaultModel.codeSuggestionMode,
  policy: {
    filtered: false,
  },
  validation: PROFESSIONAL_VALIDATION,
};

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
      ...expectedMetadata,
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
  ])('returns status 400 when the code is %s', async (_description, code) => {
    const response = await request(createTestApp()).post('/assistant/review').send({
      modelId: DEFAULT_MODEL_ID,
      code,
    });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      code: 'INVALID_REQUEST',
      message: 'El campo code es obligatorio y debe contener código ABAP.',
    });
  });

  it('returns status 400 when the code is missing', async () => {
    const response = await request(createTestApp()).post('/assistant/review').send({
      modelId: DEFAULT_MODEL_ID,
    });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      code: 'INVALID_REQUEST',
      message: 'El campo code es obligatorio y debe contener código ABAP.',
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
      ...expectedMetadata,
    });
  });

  it('returns status 400 when modelId is empty', async () => {
    const response = await request(createTestApp()).post('/assistant/review').send({
      modelId: '   ',
      code: 'SELECT * FROM mara INTO TABLE lt_mara.',
    });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      code: 'INVALID_REQUEST',
      message: 'El campo modelId es obligatorio y debe contener un identificador de modelo.',
    });
  });

  it('returns status 400 when modelId is missing', async () => {
    const response = await request(createTestApp()).post('/assistant/review').send({
      code: 'SELECT * FROM mara INTO TABLE lt_mara.',
    });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      code: 'INVALID_REQUEST',
      message: 'El campo modelId es obligatorio y debe contener un identificador de modelo.',
    });
  });

  it('returns status 400 when modelId is not supported', async () => {
    const response = await request(createTestApp()).post('/assistant/review').send({
      modelId: 'unsupported-model',
      code: 'SELECT * FROM mara INTO TABLE lt_mara.',
    });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      code: 'MODEL_NOT_SUPPORTED',
      message: 'El modelo solicitado no está soportado por ABAPilot.',
    });
  });

  it('filters fenced code returned by a none model while preserving the explanation', async () => {
    const provider: AIProvider = {
      generateResponse: () =>
        Promise.resolve({
          content: 'Respuesta de consulta.',
        }),

      explainCode: () =>
        Promise.resolve({
          content: 'Respuesta de explicación.',
        }),

      reviewCode: () =>
        Promise.resolve({
          content: [
            'La lectura completa de MARA puede suponer un riesgo condicionado por el volumen.',
            '',
            'Código propuesto:',
            '',
            '```abap',
            'SELECT matnr',
            '  FROM mara',
            '  INTO TABLE lt_mara.',
            '```',
            '',
            'También deben revisarse los requisitos funcionales antes de realizar cambios.',
          ].join('\n'),
        }),
    };

    const response = await request(createTestApp(provider)).post('/assistant/review').send({
      modelId: 'llama-3.2-3b',
      code: 'SELECT * FROM mara INTO TABLE lt_mara.',
    });

    expect(response.status).toBe(200);

    expect(response.body).toEqual({
      response: [
        'La lectura completa de MARA puede suponer un riesgo condicionado por el volumen.',
        '',
        'Código propuesto:',
        '',
        '[[ABAPILOT_CODE_BLOCK_FILTERED]]',
        '',
        'También deben revisarse los requisitos funcionales antes de realizar cambios.',
      ].join('\n'),
      modelId: 'llama-3.2-3b',
      codeSuggestionMode: 'none',
      policy: {
        filtered: true,
        reason: 'CODE_SUGGESTION_NOT_ALLOWED',
      },
      validation: PROFESSIONAL_VALIDATION,
    });

    expect(response.text).not.toContain('SELECT matnr');
    expect(response.text).not.toContain('INTO TABLE lt_mara');
  });
});
