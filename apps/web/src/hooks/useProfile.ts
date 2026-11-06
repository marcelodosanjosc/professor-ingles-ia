import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { ProfileInput, PublicUser } from '@fluencialab/shared';
import { apiFetch, ApiRequestError } from '../lib/api';
import { AUTH_QUERY_KEY } from './useAuth';

export const PROFILE_QUERY_KEY = ['profile'] as const;

export function useProfile() {
  const queryClient = useQueryClient();

  const {
    data: profile,
    isLoading,
    error,
    refetch,
  } = useQuery<ProfileInput | null>({
    queryKey: PROFILE_QUERY_KEY,
    queryFn: async () => {
      try {
        const res = await apiFetch<{ profile: ProfileInput }>('/api/profile');
        return res.profile;
      } catch (err) {
        if (err instanceof ApiRequestError && err.status === 404) {
          return null;
        }
        throw err;
      }
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (input: ProfileInput) => {
      const res = await apiFetch<{ profile: ProfileInput }>('/api/profile', {
        method: 'PUT',
        body: JSON.stringify(input),
      });
      return res.profile;
    },
    onSuccess: (savedProfile) => {
      queryClient.setQueryData(PROFILE_QUERY_KEY, savedProfile);
      // Atualiza optimisticamente o flag hasProfile no cache do usuário autenticado
      queryClient.setQueryData<PublicUser | null>(AUTH_QUERY_KEY, (old) => {
        if (!old) return old;
        return { ...old, hasProfile: true };
      });
      void queryClient.invalidateQueries({ queryKey: PROFILE_QUERY_KEY });
      void queryClient.invalidateQueries({ queryKey: AUTH_QUERY_KEY });
      void queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });

  return {
    profile: profile ?? null,
    isLoading,
    error,
    refetch,
    saveProfile: saveMutation.mutateAsync,
    isSaving: saveMutation.isPending,
    saveError: saveMutation.error,
  };
}
