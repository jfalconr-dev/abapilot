type Environment = Readonly<Record<string, string | undefined>>;

const DEFAULT_API_PORT = 3000;
const MIN_PORT = 1;
const MAX_PORT = 65_535;

export const loadApiPort = (environment: Environment = process.env): number => {
  const configuredPort = environment.API_PORT?.trim() || String(DEFAULT_API_PORT);
  const port = Number(configuredPort);

  if (!Number.isInteger(port) || port < MIN_PORT || port > MAX_PORT) {
    throw new Error(
      `API_PORT debe ser un número entero comprendido entre ${MIN_PORT} y ${MAX_PORT}.`,
    );
  }

  return port;
};
