/** One key per user attempt: stable across automatic retries of that attempt, fresh for a new one. */
export function createIdempotencyKey(): string {
  return crypto.randomUUID();
}
