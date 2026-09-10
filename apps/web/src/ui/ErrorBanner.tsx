import { RequestError } from '../api/client';

export function ErrorBanner({ error, onRetry }: { error: unknown; onRetry?: () => void }) {
  const message = error instanceof RequestError ? error.message : 'Что-то пошло не так.';
  const canRetry = onRetry && (!(error instanceof RequestError) || error.isTransient);
  return (
    <p role="alert" className="error-banner">
      {message}
      {canRetry && (
        <button type="button" className="error-banner__retry" onClick={onRetry}>
          Повторить
        </button>
      )}
    </p>
  );
}
