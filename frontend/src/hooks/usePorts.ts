import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../api/client';
import { API_CONFIG } from '../api/config';

export function usePorts() {
  return useQuery({
    queryKey: ['ports'],
    queryFn: () => apiClient.getPorts(),
    staleTime: API_CONFIG.staleTime,
    refetchInterval: false,
    retry: API_CONFIG.retryAttempts,
  });
}
