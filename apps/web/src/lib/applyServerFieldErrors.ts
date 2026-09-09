import type { FieldValues, Path, UseFormSetError } from 'react-hook-form';
import { RequestError } from '../api/client';

/**
 * Maps API error.fields (e.g. "body/customer/email") onto react-hook-form fields
 * with the matching name. The single place forms use to surface server validation —
 * no form re-parses RequestError on its own.
 */
export function applyServerFieldErrors<T extends FieldValues>(
  error: unknown,
  setError: UseFormSetError<T>,
): boolean {
  if (!(error instanceof RequestError) || !error.fields?.length) return false;
  for (const field of error.fields) {
    const name = field.path.split('/').pop();
    if (name) setError(name as Path<T>, { type: 'server', message: field.message });
  }
  return true;
}
