import { describe, expect, it } from 'vitest';

import { applyAssistantResponsePolicy } from '../src/presentation/assistant/assistant-response-policy.js';

describe('applyAssistantResponsePolicy', () => {
  it('does not modify plain text responses in none mode', () => {
    const content = 'La mejora debe describirse conceptualmente.';

    expect(applyAssistantResponsePolicy(content, 'none')).toEqual({
      content,
      policy: {
        filtered: false,
      },
    });
  });

  it('filters fenced code blocks in none mode', () => {
    const content = [
      'La consulta puede optimizarse.',
      '',
      '```abap',
      'WRITE lv_value.',
      '```',
      '',
      'También debe revisarse el contexto funcional.',
    ].join('\n');

    expect(applyAssistantResponsePolicy(content, 'none')).toEqual({
      content: [
        'La consulta puede optimizarse.',
        '',
        '[[ABAPCOMPASS_CODE_BLOCK_FILTERED]]',
        '',
        'También debe revisarse el contexto funcional.',
      ].join('\n'),
      policy: {
        filtered: true,
        reason: 'CODE_SUGGESTION_NOT_ALLOWED',
      },
    });
  });

  it('filters multiple fenced code blocks in none mode', () => {
    const content = [
      'Primera propuesta:',
      '```abap',
      'WRITE lv_first.',
      '```',
      'Segunda propuesta:',
      '```abap',
      'WRITE lv_second.',
      '```',
    ].join('\n');

    const result = applyAssistantResponsePolicy(content, 'none');

    expect(result.policy).toEqual({
      filtered: true,
      reason: 'CODE_SUGGESTION_NOT_ALLOWED',
    });
    expect(result.content).not.toContain('WRITE lv_first.');
    expect(result.content).not.toContain('WRITE lv_second.');
  });

  it('does not filter fenced code blocks in snippets mode', () => {
    const content = ['```abap', 'WRITE lv_value.', '```'].join('\n');

    expect(applyAssistantResponsePolicy(content, 'snippets')).toEqual({
      content,
      policy: {
        filtered: false,
      },
    });
  });

  it('does not filter fenced code blocks in full mode', () => {
    const content = ['```abap', 'REPORT z_example.', '```'].join('\n');

    expect(applyAssistantResponsePolicy(content, 'full')).toEqual({
      content,
      policy: {
        filtered: false,
      },
    });
  });

  it('does not filter an incomplete code fence', () => {
    const content = ['Respuesta:', '```abap', 'WRITE lv_value.'].join('\n');

    expect(applyAssistantResponsePolicy(content, 'none')).toEqual({
      content,
      policy: {
        filtered: false,
      },
    });
  });
});
