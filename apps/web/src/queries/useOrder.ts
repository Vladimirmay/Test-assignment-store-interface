import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import type { CreateOrder } from '@checkout/contracts';
import { createOrder, getOrder } from '../api/endpoints';
import { pollUntil } from '../lib/polling';
import { useSession } from '../session/SessionProvider';
import { queryKeys } from './queryKeys';

/** paymentStatus stays "pending" for both "attempt created" and "processing" — poll until it settles. */
export function useOrder(orderId: string | undefined) {
  const { token } = useSession();
  return useQuery({
    queryKey: queryKeys.order(token, orderId ?? ''),
    queryFn: () => getOrder(token, orderId!),
    enabled: Boolean(orderId),
    refetchInterval: pollUntil((order) => order?.paymentStatus !== 'pending'),
  });
}

export function useCreateOrder() {
  const { token } = useSession();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ body, idempotencyKey }: { body: CreateOrder; idempotencyKey: string }) =>
      createOrder(token, body, idempotencyKey),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.cart(token) }),
  });
}

export function useInvalidateOrder(orderId: string) {
  const { token } = useSession();
  const queryClient = useQueryClient();
  return useCallback(
    () => queryClient.invalidateQueries({ queryKey: queryKeys.order(token, orderId) }),
    [queryClient, token, orderId],
  );
}
