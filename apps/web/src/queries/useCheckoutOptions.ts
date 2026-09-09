import { useQuery } from '@tanstack/react-query';
import { getCheckoutOptions } from '../api/endpoints';
import { useSession } from '../session/SessionProvider';
import { queryKeys } from './queryKeys';

export function useCheckoutOptions() {
  const { token } = useSession();
  return useQuery({
    queryKey: queryKeys.checkoutOptions(token),
    queryFn: () => getCheckoutOptions(token),
  });
}
