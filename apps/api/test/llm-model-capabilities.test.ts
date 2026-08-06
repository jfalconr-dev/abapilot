import { describe, expect, it } from 'vitest';

import { resolveLlmModelCapabilities } from '../src/infrastructure/ai/llm-model-capabilities.js';

describe('resolveLlmModelCapabilities', () => {
  it('should return the capabilities registered for a model', () => {
    const capabilities = resolveLlmModelCapabilities('ollama', 'qwen2.5-coder:7b');

    expect(capabilities).toEqual({
      codeSuggestionMode: 'snippets',
    });
  });

  it('should normalize the provider identifier', () => {
    const capabilities = resolveLlmModelCapabilities(' OLLAMA ', 'qwen2.5-coder:7b');

    expect(capabilities).toEqual({
      codeSuggestionMode: 'snippets',
    });
  });

  it('should return snippets for an unregistered model', () => {
    const capabilities = resolveLlmModelCapabilities('ollama', 'unregistered-model');

    expect(capabilities).toEqual({
      codeSuggestionMode: 'snippets',
    });
  });
});
