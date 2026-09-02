import { defineConfig } from '@playwright/test';

const PORT = 4123;

export default defineConfig({
  testDir: './e2e',
  use: { baseURL: `http://localhost:${PORT}` },
  webServer: {
    command: 'npx tsx src/index.ts',
    url: `http://localhost:${PORT}/health`,
    reuseExistingServer: false,
    env: {
      PORT: String(PORT),
      FAVQS_API_KEY: process.env.FAVQS_API_KEY ?? 'e2e-dummy-key',
      LOG_LEVEL: 'silent',
    },
  },
});
