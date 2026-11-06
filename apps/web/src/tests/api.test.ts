import { describe, it, expect, vi, beforeEach } from 'vitest';
import { apiFetch, ApiRequestError } from '../lib/api';

describe('apiFetch', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('deve realizar GET com sucesso e retornar JSON', async () => {
    const mockData = { user: { id: '1', name: 'Teste' } };
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => mockData,
    } as Response);

    const result = await apiFetch<typeof mockData>('/api/test');
    expect(result).toEqual(mockData);
  });

  it('deve retornar undefined para status 204 No Content', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: true,
      status: 204,
    } as Response);

    const result = await apiFetch<void>('/api/auth/logout', { method: 'POST' });
    expect(result).toBeUndefined();
  });

  it('deve capturar erro da API estruturado e lançar ApiRequestError', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: false,
      status: 400,
      statusText: 'Bad Request',
      json: async () => ({
        error: { code: 'INVALID_CREDENTIALS', message: 'E-mail ou senha incorretos' },
      }),
    } as Response);

    try {
      await apiFetch('/api/auth/login');
      expect.fail('Deveria ter lançado ApiRequestError');
    } catch (err) {
      expect(err).toBeInstanceOf(ApiRequestError);
      if (err instanceof ApiRequestError) {
        expect(err.status).toBe(400);
        expect(err.code).toBe('INVALID_CREDENTIALS');
        expect(err.message).toBe('E-mail ou senha incorretos');
      }
    }
  });

  it('deve lidar com falha de rede e lançar erro amigável', async () => {
    vi.spyOn(globalThis, 'fetch').mockRejectedValueOnce(new TypeError('Failed to fetch'));

    await expect(apiFetch('/api/test')).rejects.toThrow(
      'Não foi possível conectar ao servidor'
    );
  });
});
