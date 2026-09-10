import { RequestError } from '../api/client';

/** Renders whatever normalize() in api/client.ts produced — never a raw Response or exception. */
export function ErrorBanner({ error, onRetry }: { error: unknown; onRetry?: () => void }) {
  const message = error instanceof RequestError ? error.message : 'Что-то пошло не так.';
  return (
    <p role="alert" className="error-banner">
      {message}
      {onRetry && (
        <button type="button" className="error-banner__retry" onClick={onRetry}>
          Повторить
        </button>
      )}
    </p>
  );
}
