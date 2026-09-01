import { describe, expect, it } from 'vitest';

import { ConfigError, loadConfig } from './config';

describe('loadConfig', () => {
  it('fails fast when FAVQS_API_KEY is missing', () => {
    expect(() => loadConfig({})).toThrow(ConfigError);
    expect(() => loadConfig({})).toThrow(/FAVQS_API_KEY/);
  });

  it('rejects a blank FAVQS_API_KEY', () => {
    expect(() => loadConfig({ FAVQS_API_KEY: '   ' })).toThrow(ConfigError);
  });

  it('defaults PORT to 4000', () => {
    expect(loadConfig({ FAVQS_API_KEY: 'key' }).port).toBe(4000);
  });

  it('reads PORT and the key from the environment', () => {
    expect(loadConfig({ FAVQS_API_KEY: 'key', PORT: '4100' })).toEqual({
      port: 4100,
      favqsApiKey: 'key',
    });
  });

  it('rejects an invalid PORT', () => {
    expect(() => loadConfig({ FAVQS_API_KEY: 'key', PORT: 'abc' })).toThrow(/PORT/);
    expect(() => loadConfig({ FAVQS_API_KEY: 'key', PORT: '-1' })).toThrow(/PORT/);
  });
});
