import type { Query } from '@tanstack/react-query';

export const POLL_INTERVAL_MS = 800;

export function pollUntil<T>(isSettled: (data: T | undefined) => boolean) {
  return (query: Query<T>) => (isSettled(query.state.data) ? false : POLL_INTERVAL_MS);
}
