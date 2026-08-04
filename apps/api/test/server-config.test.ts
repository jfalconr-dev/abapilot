import { describe, expect, it } from 'vitest';

import { loadApiPort } from '../src/server-config.js';

describe('loadApiPort', () => {
  it('should return the default API port', () => {
    expect(loadApiPort({})).toBe(3000);
  });

  it('should return the configured API port', () => {
    expect(
      loadApiPort({
        API_PORT: ' 4000 ',
      }),
    ).toBe(4000);
  });

  it.each(['not-a-number', '3000.5', '0', '65536'])(
    'should reject the invalid API port %s',
    (configuredPort) => {
      expect(() =>
        loadApiPort({
          API_PORT: configuredPort,
        }),
      ).toThrow('API_PORT debe ser un número entero comprendido entre 1 y 65535.');
    },
  );
});
