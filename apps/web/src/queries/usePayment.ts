import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { Scenario } from '@checkout/contracts';
import { createPayment, createSimulation, getPayment } from '../api/endpoints';
import { pollUntil } from '../lib/polling';
import { useSession } from '../session/SessionProvider';
import { queryKeys } from './queryKeys';

export function usePayment(paymentId: string | undefined) {
  const { token } = useSession();
  return useQuery({
    queryKey: queryKeys.payment(token, paymentId ?? ''),
    queryFn: () => getPayment(token, paymentId!),
    enabled: Boolean(paymentId),
    refetchInterval: pollUntil((payment) => payment?.status !== 'processing'),
  });
}

export function useCreatePayment() {
  const { token } = useSession();
  return useMutation({
    mutationFn: ({ orderId, idempotencyKey }: { orderId: string; idempotencyKey: string }) =>
      createPayment(token, orderId, idempotencyKey),
  });
}

export function useSimulatePayment() {
  const { token } = useSession();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ paymentId, scenario }: { paymentId: string; scenario: Scenario }) =>
      createSimulation(token, paymentId, scenario),
    onSuccess: (_simulation, variables) =>
      queryClient.invalidateQueries({ queryKey: queryKeys.payment(token, variables.paymentId) }),
  });
}
