import type { ApiError } from '@checkout/contracts';

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://127.0.0.1:4000';

/** Normalized shape for every failure: network, HTTP, and parse errors alike. */
export class RequestError extends Error {
  readonly status: number;
  readonly code: string;
  readonly fields?: { path: string; message: string }[];
  readonly requestId?: string;

  constructor(status: number, body?: ApiError, fallbackMessage?: string) {
    super(body?.error.message ?? fallbackMessage ?? 'Не удалось выполнить запрос.');
    this.status = status;
    this.code = body?.error.code ?? (status === 0 ? 'NETWORK_ERROR' : 'UNKNOWN_ERROR');
    this.fields = body?.error.fields;
    this.requestId = body?.meta.requestId;
  }
}

type RequestOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: unknown;
  token?: string;
  idempotencyKey?: string;
};

/** The only place that talks to fetch. Components never see a raw Response. */
export async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, token, idempotencyKey } = options;
  let response: Response;
  try {
    response = await fetch(`${BASE_URL}${path}`, {
      method,
      headers: {
        ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(idempotencyKey ? { 'Idempotency-Key': idempotencyKey } : {}),
      },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch {
    throw new RequestError(0, undefined, 'Проверьте подключение к сети.');
  }

  if (response.status === 204) return undefined as T;

  let payload: unknown;
  try {
    payload = await response.json();
  } catch {
    if (response.ok) return undefined as T;
    throw new RequestError(response.status, undefined, 'Не удалось разобрать ответ сервера.');
  }

  if (!response.ok) throw new RequestError(response.status, payload as ApiError);
  return (payload as { data: T }).data;
}
