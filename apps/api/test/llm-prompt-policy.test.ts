import { describe, expect, it } from 'vitest';

import { buildLlmPrompt } from '../src/infrastructure/ai/llm-prompt-policy.js';

describe('buildLlmPrompt', () => {
  it('should build a query prompt with additional context', () => {
    const result = buildLlmPrompt({
      operation: 'query',
      content: '¿Cómo puedo implementar una BAdI?',
      context: 'El sistema utiliza SAP ECC.',
      codeSuggestionMode: 'snippets',
    });

    expect(result.prompt).toContain(
      'Responde a la siguiente consulta relacionada con SAP ECC o el desarrollo ABAP.',
    );
    expect(result.prompt).toContain('Contenido:\n¿Cómo puedo implementar una BAdI?');
    expect(result.prompt).toContain('Contexto adicional:\nEl sistema utiliza SAP ECC.');
  });

  it('should build an explanation prompt without an absent context section', () => {
    const result = buildLlmPrompt({
      operation: 'explain',
      content: 'DATA lv_value TYPE string.',
      codeSuggestionMode: 'snippets',
    });

    expect(result.prompt).toContain('Explica de forma clara el siguiente código ABAP.');
    expect(result.prompt).toContain('Contenido:\nDATA lv_value TYPE string.');
    expect(result.prompt).not.toContain('Contexto adicional:');
  });

  it('should build a review prompt without rules for specific ABAP syntax', () => {
    const result = buildLlmPrompt({
      operation: 'review',
      content: 'WRITE lv_value.',
      codeSuggestionMode: 'snippets',
    });

    expect(result.prompt).toContain('Revisa el siguiente código ABAP');
    expect(result.prompt).toContain(
      'Clasifica cada hallazgo exclusivamente como error confirmado, riesgo condicionado o mejora opcional',
    );
    expect(result.system).not.toContain('DATA(...)');
    expect(result.prompt).not.toContain('DATA(...)');
  });

  it('should prohibit code generation in none mode', () => {
    const result = buildLlmPrompt({
      operation: 'query',
      content: 'Consulta de prueba.',
      codeSuggestionMode: 'none',
    });

    expect(result.system).toContain('No generes código ni fragmentos de código.');
  });

  it('should allow only minimal code fragments in snippets mode', () => {
    const result = buildLlmPrompt({
      operation: 'review',
      content: 'WRITE lv_value.',
      codeSuggestionMode: 'snippets',
    });

    expect(result.system).toContain('únicamente fragmentos mínimos de código');
    expect(result.system).toContain('No generes una versión completa de un programa');
  });

  it('should allow complete solutions in full mode when justified', () => {
    const result = buildLlmPrompt({
      operation: 'query',
      content: 'Genera un informe ABAP.',
      codeSuggestionMode: 'full',
    });

    expect(result.system).toContain('Puedes generar soluciones completas de código');
    expect(result.system).toContain('dispongas de contexto suficiente para justificarlas');
  });
});
