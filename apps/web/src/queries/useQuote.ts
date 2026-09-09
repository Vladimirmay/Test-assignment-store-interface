import { useMutation } from '@tanstack/react-query';
import type { Delivery } from '@checkout/contracts';
import { createQuote } from '../api/endpoints';
import { useSession } from '../session/SessionProvider';

export function useCreateQuote() {
  const { token } = useSession();
  return useMutation({
    mutationFn: ({ cartVersion, delivery }: { cartVersion: number; delivery: Delivery }) =>
      createQuote(token, cartVersion, delivery),
  });
}
