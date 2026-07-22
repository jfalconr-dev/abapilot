import { describe, expect, it } from 'vitest';

import { getInitialModules } from '../src/index.js';

describe('getInitialModules', () => {
  it('defines the planned MVP workspace modules', () => {
    expect(getInitialModules().map((module) => module.id)).toEqual([
      'diagnosis',
      'sap-explorer',
      'abap-generator',
    ]);
  });
});
