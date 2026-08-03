import request from 'supertest';
import { describe, expect, it } from 'vitest';

import { createApp } from '../src/app.js';

describe('POST /assistant/review', () => {
  it('returns a review for valid ABAP code', async () => {
    const code = 'SELECT * FROM mara INTO TABLE lt_mara.';

    const response = await request(createApp()).post('/assistant/review').send({ code });

    expect(response.status).toBe(200);
    expect(response.headers['content-type']).toContain('application/json');
    expect(response.text).toContain(code);
  });

  it('includes the optional context in the review', async () => {
    const code = 'SELECT * FROM mara INTO TABLE lt_mara.';
    const context = 'El código se ejecuta en SAP ECC.';

    const response = await request(createApp()).post('/assistant/review').send({ code, context });

    expect(response.status).toBe(200);
    expect(response.text).toContain(code);
    expect(response.text).toContain(context);
  });

  it('returns status 400 when the code is empty', async () => {
    const response = await request(createApp()).post('/assistant/review').send({ code: '   ' });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      error: 'El campo code es obligatorio y debe contener código ABAP.',
    });
  });
});
