import request from 'supertest';
import { describe, expect, it } from 'vitest';

import { createApp } from '../src/app.js';

describe('POST /assistant/query', () => {
  it('returns a response for a valid query', async () => {
    const query = '¿Cómo puedo analizar un dump ABAP?';

    const response = await request(createApp()).post('/assistant/query').send({ query });

    expect(response.status).toBe(200);
    expect(response.headers['content-type']).toContain('application/json');
    expect(response.text).toContain(query);
  });

  it('includes the optional context in the response', async () => {
    const query = '¿Cómo puedo analizar un dump ABAP?';
    const context = 'El dump se ha producido en un proceso de fondo.';

    const response = await request(createApp()).post('/assistant/query').send({ query, context });

    expect(response.status).toBe(200);
    expect(response.text).toContain(query);
    expect(response.text).toContain(context);
  });

  it('returns status 400 when the query is empty', async () => {
    await request(createApp()).post('/assistant/query').send({ query: '   ' }).expect(400).expect({
      error: 'El campo query es obligatorio y debe contener texto.',
    });
  });
});
