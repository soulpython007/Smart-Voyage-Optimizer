import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../api/client';
import { API_CONFIG } from '../api/config';

export function useShips() {
  return useQuery({
    queryKey: ['ships'],
    queryFn: () => apiClient.getShips(),
    staleTime: API_CONFIG.staleTime,
    refetchInterval: API_CONFIG.refetchInterval,
    retry: API_CONFIG.retryAttempts,
  });
}
