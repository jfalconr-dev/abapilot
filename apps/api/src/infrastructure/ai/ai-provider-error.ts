export class AIProviderUnavailableError extends Error {
  public constructor() {
    super('The AI provider is unavailable.');
    this.name = 'AIProviderUnavailableError';
  }
}

export class AIProviderTimeoutError extends Error {
  public constructor() {
    super('The AI provider request timed out.');
    this.name = 'AIProviderTimeoutError';
  }
}
