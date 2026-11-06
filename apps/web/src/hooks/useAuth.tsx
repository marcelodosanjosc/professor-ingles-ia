import {
  createContext,
  useContext,
  type ReactNode,
} from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { PublicUser, LoginInput, RegisterInput } from '@fluencialab/shared';
import { apiFetch, ApiRequestError } from '../lib/api';

export interface AuthContextValue {
  user: PublicUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: unknown;
  login: (input: LoginInput) => Promise<PublicUser>;
  register: (input: RegisterInput) => Promise<PublicUser>;
  logout: () => Promise<void>;
  refetchMe: () => Promise<unknown>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export const AUTH_QUERY_KEY = ['auth', 'me'] as const;

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();

  const {
    data: user,
    isLoading,
    error,
    refetch: refetchMe,
  } = useQuery<PublicUser | null>({
    queryKey: AUTH_QUERY_KEY,
    queryFn: async () => {
      try {
        const res = await apiFetch<{ user: PublicUser }>('/api/auth/me');
        return res.user;
      } catch (err) {
        if (err instanceof ApiRequestError && err.status === 401) {
          return null;
        }
        throw err;
      }
    },
  });

  const loginMutation = useMutation({
    mutationFn: async (input: LoginInput) => {
      const res = await apiFetch<{ user: PublicUser }>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify(input),
      });
      return res.user;
    },
    onSuccess: (newUser) => {
      queryClient.setQueryData(AUTH_QUERY_KEY, newUser);
      void queryClient.invalidateQueries({ queryKey: AUTH_QUERY_KEY });
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (input: RegisterInput) => {
      const res = await apiFetch<{ user: PublicUser }>('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify(input),
      });
      return res.user;
    },
    onSuccess: (newUser) => {
      queryClient.setQueryData(AUTH_QUERY_KEY, newUser);
      void queryClient.invalidateQueries({ queryKey: AUTH_QUERY_KEY });
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await apiFetch<void>('/api/auth/logout', { method: 'POST' });
    },
    onSuccess: () => {
      queryClient.setQueryData(AUTH_QUERY_KEY, null);
      queryClient.clear();
    },
  });

  const value: AuthContextValue = {
    user: user ?? null,
    isLoading,
    isAuthenticated: Boolean(user),
    error,
    login: loginMutation.mutateAsync,
    register: registerMutation.mutateAsync,
    logout: logoutMutation.mutateAsync,
    refetchMe,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser utilizado dentro de um <AuthProvider>');
  }
  return context;
}
