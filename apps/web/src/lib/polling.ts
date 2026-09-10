import type { Query } from '@tanstack/react-query';

/** Shared by every query that waits out an async server operation (order/payment status). */
export const POLL_INTERVAL_MS = 800;

/** A `refetchInterval` that polls while `isSettled` says no, and stops once it says yes. */
export function pollUntil<T>(isSettled: (data: T | undefined) => boolean) {
  return (query: Query<T>) => (isSettled(query.state.data) ? false : POLL_INTERVAL_MS);
}
