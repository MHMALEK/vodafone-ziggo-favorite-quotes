import { z } from 'zod';

export interface Quote {
  id: number;
  body: string;
  author: string;
  tags: string[];
}

export type UpstreamErrorKind = 'http' | 'timeout' | 'network' | 'malformed';

export class UpstreamError extends Error {
  constructor(
    public readonly kind: UpstreamErrorKind,
    message: string,
    public readonly status?: number,
  ) {
    super(message);
  }
}

const quoteSchema = z
  .object({
    id: z.number().int(),
    body: z.string(),
    author: z
      .string()
      .nullish()
      .transform((author) => author ?? 'Unknown'),
    tags: z
      .array(z.string())
      .nullish()
      .transform((tags) => tags ?? []),
  })
  .transform(({ id, body, author, tags }): Quote => ({ id, body, author, tags }));

const qotdResponseSchema = z.object({ quote: quoteSchema });
const searchResponseSchema = z.object({ quotes: z.array(quoteSchema) });

export interface FavqsClient {
  getQotd(): Promise<Quote>;
  searchQuotes(query: string): Promise<Quote[]>;
}

export interface FavqsClientOptions {
  apiKey: string;
  baseUrl?: string;
  timeoutMs?: number;
  fetchFn?: typeof fetch;
}

const DEFAULT_BASE_URL = 'https://favqs.com/api';
const DEFAULT_TIMEOUT_MS = 5_000;

export function createFavqsClient(options: FavqsClientOptions): FavqsClient {
  const baseUrl = options.baseUrl ?? DEFAULT_BASE_URL;
  const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  const fetchFn = options.fetchFn ?? fetch;
  // The API key is used exclusively here; it must never appear in errors or logs.
  const authorization = `Token token="${options.apiKey}"`;

  async function request(path: string): Promise<unknown> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    let response: Response;
    try {
      response = await fetchFn(`${baseUrl}${path}`, {
        headers: { Authorization: authorization },
        signal: controller.signal,
      });
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        throw new UpstreamError('timeout', `FavQs did not respond within ${timeoutMs}ms`);
      }
      throw new UpstreamError('network', 'Could not reach FavQs');
    } finally {
      clearTimeout(timer);
    }

    if (!response.ok) {
      throw new UpstreamError('http', `FavQs responded with status ${response.status}`, response.status);
    }
    try {
      return await response.json();
    } catch {
      throw new UpstreamError('malformed', 'FavQs returned a response that is not valid JSON');
    }
  }

  function parse<T>(schema: z.ZodType<T>, payload: unknown): T {
    const result = schema.safeParse(payload);
    if (!result.success) {
      throw new UpstreamError('malformed', 'FavQs response did not match the expected shape');
    }
    return result.data;
  }

  return {
    async getQotd(): Promise<Quote> {
      const payload = await request('/qotd');
      return parse(qotdResponseSchema, payload).quote;
    },

    async searchQuotes(query: string): Promise<Quote[]> {
      const payload = await request(`/quotes?filter=${encodeURIComponent(query)}`);
      const { quotes } = parse(searchResponseSchema, payload);
      // FavQs signals "no results" with a single placeholder row (id 0, "No quotes found").
      return quotes.filter((quote) => quote.id > 0);
    },
  };
}
