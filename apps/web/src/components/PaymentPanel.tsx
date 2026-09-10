import { useEffect, useRef, useState } from 'react';
import type { Order } from '@checkout/contracts';
import { createIdempotencyKey } from '../api/idempotency';
import { useInvalidateOrder } from '../queries/useOrder';
import { useCreatePayment, usePayment, useSimulatePayment } from '../queries/usePayment';
import { useSandbox } from '../queries/useSandbox';
import { ErrorBanner } from '../ui/ErrorBanner';
import { Loading } from '../ui/Loading';

/**
 * Drives one card-payment attempt for an order: start, pick a test card, pay or cancel,
 * poll until it settles, retry with a fresh attempt after decline/cancel. Used both right
 * after checkout and on the order page when returning to a reload or a previously failed order.
 */
export function PaymentPanel({ order }: { order: Order }) {
  const [paymentId, setPaymentId] = useState<string>();
  const [selectedCardId, setSelectedCardId] = useState<string>();
  const keyRef = useRef(createIdempotencyKey());
  const createPayment = useCreatePayment();
  const simulate = useSimulatePayment();
  const payment = usePayment(paymentId);
  const sandbox = useSandbox();
  const invalidateOrder = useInvalidateOrder(order.id);

  useEffect(() => {
    const status = payment.data?.status;
    if (status && status !== 'pending' && status !== 'processing') invalidateOrder();
  }, [payment.data?.status, invalidateOrder]);

  const retry = () => {
    keyRef.current = createIdempotencyKey();
    setPaymentId(undefined);
    setSelectedCardId(undefined);
  };

  const startPayment = () =>
    createPayment.mutate(
      { orderId: order.id, idempotencyKey: keyRef.current },
      { onSuccess: (created) => setPaymentId(created.id) },
    );

  if (!paymentId) {
    return (
      <div>
        <button disabled={createPayment.isPending} onClick={startPayment}>
          Оплатить картой
        </button>
        {createPayment.isError && (
          <ErrorBanner error={createPayment.error} onRetry={startPayment} />
        )}
      </div>
    );
  }

  if (payment.isPending) return <Loading label="Открываем платёжную форму…" />;
  if (payment.isError)
    return <ErrorBanner error={payment.error} onRetry={() => payment.refetch()} />;
  if (sandbox.isPending) return <Loading label="Загружаем тестовые карты…" />;
  if (sandbox.isError)
    return <ErrorBanner error={sandbox.error} onRetry={() => sandbox.refetch()} />;

  const status = payment.data.status;

  if (status === 'processing') return <Loading label="Обрабатываем оплату…" />;

  if (status === 'failed' || status === 'cancelled') {
    return (
      <div>
        <p role="alert">{status === 'failed' ? 'Банк отклонил карту.' : 'Оплата отменена.'}</p>
        <button onClick={retry}>Попробовать снова</button>
      </div>
    );
  }

  return (
    <fieldset disabled={simulate.isPending}>
      <legend>Выберите тестовую карту</legend>
      {sandbox.data.cards.map((card) => (
        <label key={card.id} className="payment-panel__card">
          <input
            type="radio"
            name="test-card"
            checked={selectedCardId === card.id}
            onChange={() => setSelectedCardId(card.id)}
          />
          {card.title} {card.maskedNumber}
        </label>
      ))}
      <div className="payment-panel__actions">
        <button
          disabled={!selectedCardId}
          onClick={() => {
            const card = sandbox.data.cards.find((item) => item.id === selectedCardId)!;
            simulate.mutate({ paymentId, scenario: card.scenario });
          }}
        >
          Оплатить
        </button>
        <button onClick={() => simulate.mutate({ paymentId, scenario: 'cancel' })}>Отмена</button>
      </div>
      {simulate.isError && <ErrorBanner error={simulate.error} />}
    </fieldset>
  );
}
