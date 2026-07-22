import { describe, expect, it } from 'vitest';

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
