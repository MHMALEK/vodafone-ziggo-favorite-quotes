export interface Config {
  port: number;
  favqsApiKey: string;
}

export class ConfigError extends Error {}

export function loadConfig(env: NodeJS.ProcessEnv = process.env): Config {
  const favqsApiKey = env.FAVQS_API_KEY?.trim();
  if (!favqsApiKey) {
    throw new ConfigError(
      'FAVQS_API_KEY is not set. Copy server/.env.example to server/.env and add your FavQs API key (sign up at https://favqs.com/api).',
    );
  }

  const rawPort = env.PORT ?? '4000';
  const port = Number(rawPort);
  if (!Number.isInteger(port) || port <= 0 || port > 65535) {
    throw new ConfigError(`PORT must be a valid port number, got "${rawPort}".`);
  }

  return { port, favqsApiKey };
}
