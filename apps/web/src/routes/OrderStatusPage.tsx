import { useParams } from 'react-router-dom';
import { PaymentPanel } from '../components/PaymentPanel';
import { formatMoney } from '../lib/money';
import { useOrder } from '../queries/useOrder';
import { ErrorBanner } from '../ui/ErrorBanner';
import { Loading } from '../ui/Loading';

export function OrderStatusPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const order = useOrder(orderId);

  if (order.isPending) return <Loading label="Загружаем заказ…" />;
  if (order.isError) return <ErrorBanner error={order.error} />;

  const data = order.data;
  const settled = data.paymentMethod === 'cash_on_delivery' || data.paymentStatus === 'succeeded';

  return (
    <div className="order">
      <h2>Заказ {data.number}</h2>
      <ul>
        {data.items.map((item) => (
          <li key={item.productId}>
            {item.title} × {item.quantity} — {formatMoney(item.lineTotal)}
          </li>
        ))}
      </ul>
      <p>Доставка: {data.delivery.method === 'pickup' ? 'самовывоз' : 'курьер'}</p>
      <p>
        Товары: {formatMoney(data.subtotal)}, доставка: {formatMoney(data.shipping)}, итого:{' '}
        {formatMoney(data.total)}
      </p>
      {settled ? (
        <p role="status">
          {data.paymentMethod === 'cash_on_delivery'
            ? 'Заказ оформлен, оплата при получении.'
            : 'Оплата прошла успешно.'}
        </p>
      ) : (
        <PaymentPanel order={data} />
      )}
    </div>
  );
}
