/**
 * Defines the code generation policy associated with an AI model.
 */
export type CodeSuggestionMode = 'none' | 'snippets' | 'full';

/**
 * Represents the configuration of an AI model supported by ABAPilot.
 */
export interface ModelDefinition {
  readonly id: string;
  readonly displayName: string;
  readonly description: string;
  readonly providerId: string;
  readonly providerModel: string;
  readonly codeSuggestionMode: CodeSuggestionMode;
}
