import { describe, expect, it } from 'vitest';

import { getProjectMetadata } from '../src/index.js';

describe('getProjectMetadata', () => {
  it('exposes the project identity', () => {
    expect(getProjectMetadata().name).toBe('ABAPCompass');
    expect(getProjectMetadata().version).toBe('0.2.0');
  });
});
