import request from 'supertest';
import { describe, expect, it } from 'vitest';

import { createApp } from '../src/app.js';
import { getHealthStatus } from '../src/index.js';

describe('getHealthStatus', () => {
  it('returns a deterministic healthy status', () => {
    expect(getHealthStatus()).toEqual({
      service: 'abapilot-api',
      version: '0.1.0',
      status: 'ok',
    });
  });
});

describe('GET /health', () => {
  it('returns the API health status', async () => {
    const response = await request(createApp()).get('/health');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      service: 'abapilot-api',
      version: '0.1.0',
      status: 'ok',
    });
  });
});
