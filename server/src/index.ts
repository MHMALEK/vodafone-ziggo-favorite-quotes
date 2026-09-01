import 'dotenv/config';

import { createApp } from './app';
import { ConfigError, loadConfig } from './config';

function main(): void {
  const config = loadConfig();
  const app = createApp();

  app.listen(config.port, () => {
    console.log(`favorites-quotes server listening on port ${config.port}`);
  });
}

try {
  main();
} catch (err) {
  if (err instanceof ConfigError) {
    console.error(`Configuration error: ${err.message}`);
    process.exit(1);
  }
  throw err;
}
