import type { FieldValues, Path, UseFormSetError } from 'react-hook-form';
import { RequestError } from '../api/client';

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
