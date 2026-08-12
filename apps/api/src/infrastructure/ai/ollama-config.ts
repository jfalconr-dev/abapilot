export interface OllamaConfig {
  readonly baseUrl: string;
  readonly timeoutMs: number;
}

type Environment = Readonly<Record<string, string | undefined>>;

const DEFAULT_BASE_URL = 'http://localhost:11434';
const DEFAULT_TIMEOUT_MS = 180_000;

export const loadOllamaConfig = (environment: Environment = process.env): OllamaConfig => {
  const baseUrl = environment.OLLAMA_BASE_URL?.trim() || DEFAULT_BASE_URL;
  const timeoutValue = environment.OLLAMA_TIMEOUT_MS?.trim() || String(DEFAULT_TIMEOUT_MS);

  validateBaseUrl(baseUrl);

  const timeoutMs = Number(timeoutValue);

  if (!Number.isInteger(timeoutMs) || timeoutMs <= 0) {
    throw new Error('OLLAMA_TIMEOUT_MS debe ser un número entero positivo.');
  }

  return {
    baseUrl: removeTrailingSlashes(baseUrl),
    timeoutMs,
  };
};

const validateBaseUrl = (baseUrl: string): void => {
  let url: URL;

  try {
    url = new URL(baseUrl);
  } catch {
    throw new Error('OLLAMA_BASE_URL debe contener una URL válida.');
  }

  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    throw new Error('OLLAMA_BASE_URL debe utilizar el protocolo HTTP o HTTPS.');
  }
};

const removeTrailingSlashes = (value: string): string => {
  let endIndex = value.length;

  while (endIndex > 0 && value[endIndex - 1] === '/') {
    endIndex -= 1;
  }

  return value.slice(0, endIndex);
};
