import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../api/client';
import type { RouteRequest } from '../types/maritime';

export function useOptimizeRoute() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: RouteRequest) => apiClient.optimizeRoute(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['routes'] });
    },
  });
}
