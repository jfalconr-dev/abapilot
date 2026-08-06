export type CodeSuggestionMode = 'none' | 'snippets' | 'full';

export interface LlmModelCapabilities {
  readonly codeSuggestionMode: CodeSuggestionMode;
}

const DEFAULT_MODEL_CAPABILITIES: LlmModelCapabilities = {
  codeSuggestionMode: 'snippets',
};

const MODEL_CAPABILITIES: Readonly<Record<string, LlmModelCapabilities>> = {
  'ollama:qwen2.5-coder:7b': {
    codeSuggestionMode: 'snippets',
  },
};

export const resolveLlmModelCapabilities = (
  provider: string,
  model: string,
): LlmModelCapabilities =>
  MODEL_CAPABILITIES[buildModelIdentifier(provider, model)] ?? DEFAULT_MODEL_CAPABILITIES;

const buildModelIdentifier = (provider: string, model: string): string =>
  `${provider.trim().toLowerCase()}:${model.trim()}`;
