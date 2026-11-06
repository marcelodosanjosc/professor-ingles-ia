import type { ApiError } from '@fluencialab/shared';

export class ApiRequestError extends Error {
  readonly status: number;
  readonly code: string;
  readonly details?: unknown;

  constructor(status: number, code: string, message: string, details?: unknown) {
    super(message);
    this.name = 'ApiRequestError';
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export async function apiFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers);

  if (!headers.has('Accept')) {
    headers.set('Accept', 'application/json');
  }

  if (
    init.body !== undefined &&
    typeof init.body === 'string' &&
    !headers.has('Content-Type')
  ) {
    headers.set('Content-Type', 'application/json');
  }

  let response: Response;
  try {
    response = await fetch(path, {
      ...init,
      headers,
      credentials: 'include',
    });
  } catch (_err) {
    throw new ApiRequestError(
      0,
      'NETWORK_ERROR',
      'Não foi possível conectar ao servidor'
    );
  }

  if (!response.ok) {
    let errorData: ApiError | null = null;
    try {
      const json = await response.json();
      if (json && typeof json === 'object' && 'error' in json) {
        errorData = json as ApiError;
      }
    } catch {
      // Resposta não é JSON válido
    }

    const code = errorData?.error?.code ?? `HTTP_${response.status}`;
    const message =
      errorData?.error?.message ??
      (response.statusText || 'Erro inesperado no servidor');
    const details = errorData?.error?.details;

    throw new ApiRequestError(response.status, code, message, details);
  }

  if (response.status === 204) {
    return undefined as unknown as T;
  }

  return (await response.json()) as T;
}
