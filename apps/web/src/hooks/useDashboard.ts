import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { DashboardData } from '@fluencialab/shared';
import { apiFetch } from '../lib/api';

export const DASHBOARD_QUERY_KEY = ['dashboard'] as const;

export function useDashboard() {
  const queryClient = useQueryClient();

  const query = useQuery<DashboardData>({
    queryKey: DASHBOARD_QUERY_KEY,
    queryFn: async () => {
      return await apiFetch<DashboardData>('/api/dashboard');
    },
  });

  const updateGoalMutation = useMutation({
    mutationFn: async ({ goalId, done }: { goalId: string; done: boolean }) => {
      return await apiFetch<{ ok: boolean }>(`/api/dashboard/weekly-goals/${goalId}`, {
        method: 'PATCH',
        body: JSON.stringify({ done }),
      });
    },
    onMutate: async ({ goalId, done }) => {
      // Cancela refetches em andamento para não sobrescrever a atualização otimista
      await queryClient.cancelQueries({ queryKey: DASHBOARD_QUERY_KEY });

      const previousDashboard = queryClient.getQueryData<DashboardData>(DASHBOARD_QUERY_KEY);

      if (previousDashboard) {
        queryClient.setQueryData<DashboardData>(DASHBOARD_QUERY_KEY, {
          ...previousDashboard,
          weeklyGoals: previousDashboard.weeklyGoals.map((goal) =>
            goal.id === goalId ? { ...goal, done } : goal
          ),
        });
      }

      return { previousDashboard };
    },
    onError: (_err, _vars, context) => {
      if (context?.previousDashboard) {
        queryClient.setQueryData(DASHBOARD_QUERY_KEY, context.previousDashboard);
      }
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: DASHBOARD_QUERY_KEY });
    },
  });

  return {
    data: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    updateWeeklyGoal: (goalId: string, done: boolean) =>
      updateGoalMutation.mutateAsync({ goalId, done }),
    isUpdatingGoal: updateGoalMutation.isPending,
  };
}
