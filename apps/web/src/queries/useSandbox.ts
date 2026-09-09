import { useQuery } from '@tanstack/react-query';
import { getSandbox } from '../api/endpoints';
import { queryKeys } from './queryKeys';

export function useSandbox() {
  return useQuery({ queryKey: queryKeys.sandbox, queryFn: getSandbox });
}
