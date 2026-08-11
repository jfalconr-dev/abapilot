import { describe, expect, it } from 'vitest';

import {
  CODE_SUGGESTION_LABELS,
  OPERATION_DEFINITIONS,
  parseAssistantContent,
} from '../src/assistant-ui.js';

describe('assistant UI configuration', () => {
  it('defines the supported assistant operations', () => {
    expect(OPERATION_DEFINITIONS.query).toMatchObject({
      endpoint: '/assistant/query',
      fieldName: 'query',
      inputLabel: 'Consulta',
    });

    expect(OPERATION_DEFINITIONS.explain).toMatchObject({
      endpoint: '/assistant/explain',
      fieldName: 'code',
      inputLabel: 'Código ABAP',
    });

    expect(OPERATION_DEFINITIONS.review).toMatchObject({
      endpoint: '/assistant/review',
      fieldName: 'code',
      inputLabel: 'Código ABAP',
    });
  });

  it('maps code suggestion modes to their public labels', () => {
    expect(CODE_SUGGESTION_LABELS).toEqual({
      none: 'No disponibles',
      snippets: 'Fragmentos',
      full: 'Completas',
    });
  });
});

describe('parseAssistantContent', () => {
  it('returns plain responses as text content', () => {
    expect(parseAssistantContent('La transacción debe verificarse antes de utilizarla.')).toEqual([
      {
        type: 'text',
        content: 'La transacción debe verificarse antes de utilizarla.',
      },
    ]);
  });

  it('separates explanatory text and fenced code blocks', () => {
    const response = [
      'Puede utilizar un fragmento como referencia.',
      '',
      '```abap',
      'DATA lv_value TYPE string.',
      'WRITE lv_value.',
      '```',
      '',
      'Debe validarlo antes de utilizarlo.',
    ].join('\n');

    expect(parseAssistantContent(response)).toEqual([
      {
        type: 'text',
        content: 'Puede utilizar un fragmento como referencia.',
      },
      {
        type: 'code',
        language: 'abap',
        content: 'DATA lv_value TYPE string.\nWRITE lv_value.',
      },
      {
        type: 'text',
        content: 'Debe validarlo antes de utilizarlo.',
      },
    ]);
  });

  it('treats script-like LLM output exclusively as content data', () => {
    const untrustedContent = '<script>alert("unsafe")</script>';

    const response = ['Ejemplo recibido:', '', '```html', untrustedContent, '```'].join('\n');

    expect(parseAssistantContent(response)).toEqual([
      {
        type: 'text',
        content: 'Ejemplo recibido:',
      },
      {
        type: 'code',
        language: 'html',
        content: untrustedContent,
      },
    ]);
  });

  it('treats an incomplete code fence as plain text', () => {
    const response = ['Respuesta:', '```abap', 'WRITE lv_value.'].join('\n');

    expect(parseAssistantContent(response)).toEqual([
      {
        type: 'text',
        content: response,
      },
    ]);
  });
});
