import { useQuery } from '@tanstack/react-query';
import { getProducts } from '../api/endpoints';
import { queryKeys } from './queryKeys';

export function useProducts() {
  return useQuery({ queryKey: queryKeys.products, queryFn: getProducts });
}
