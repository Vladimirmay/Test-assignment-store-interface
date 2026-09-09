import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getCart, removeCartItem, setCartItem } from '../api/endpoints';
import { useSession } from '../session/SessionProvider';
import { queryKeys } from './queryKeys';

export function useCart() {
  const { token } = useSession();
  return useQuery({ queryKey: queryKeys.cart(token), queryFn: () => getCart(token) });
}

export function useSetCartItem() {
  const { token } = useSession();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ productId, quantity }: { productId: string; quantity: number }) =>
      setCartItem(token, productId, quantity),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.cart(token) }),
  });
}

export function useRemoveCartItem() {
  const { token } = useSession();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (productId: string) => removeCartItem(token, productId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.cart(token) }),
  });
}
