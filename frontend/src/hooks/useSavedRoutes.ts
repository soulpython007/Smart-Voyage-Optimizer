import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../api/client';
import type { SavedRoute } from '../api/client';

export function useSavedRoutes() {
  return useQuery({
    queryKey: ['savedRoutes'],
    queryFn: () => apiClient.getSavedRoutes(),
    staleTime: 30000,
    retry: 2,
  });
}

export function useSaveRoute() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<SavedRoute>) => apiClient.saveRoute(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['savedRoutes'] });
    },
  });
}

export function useDeleteSavedRoute() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiClient.deleteSavedRoute(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['savedRoutes'] });
    },
  });
}
