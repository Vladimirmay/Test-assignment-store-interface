import { Link } from 'react-router-dom';
import { formatMoney } from '../lib/money';
import { useCart, useRemoveCartItem, useSetCartItem } from '../queries/useCart';
import { ErrorBanner } from '../ui/ErrorBanner';
import { Loading } from '../ui/Loading';

export function CartPage() {
  const cart = useCart();
  const setItem = useSetCartItem();
  const removeItem = useRemoveCartItem();

  if (cart.isPending) return <Loading label="Загружаем корзину…" />;
  if (cart.isError) return <ErrorBanner error={cart.error} onRetry={() => cart.refetch()} />;

  if (cart.data.items.length === 0)
    return (
      <p>
        Корзина пуста. <Link to="/">Вернуться в каталог</Link>
      </p>
    );

  return (
    <div className="cart">
      <ul>
        {cart.data.items.map((item) => (
          <li key={item.productId} className="cart__item">
            <span>{item.title}</span>
            <label>
              Количество
              <input
                type="number"
                min={1}
                max={99}
                value={item.quantity}
                disabled={setItem.isPending}
                onChange={(event) => {
                  const quantity = Number(event.target.value);
                  if (quantity >= 1 && quantity <= 99)
                    setItem.mutate({ productId: item.productId, quantity });
                }}
              />
            </label>
            <span>{formatMoney(item.lineTotal)}</span>
            <button
              disabled={removeItem.isPending}
              onClick={() => removeItem.mutate(item.productId)}
            >
              Удалить
            </button>
          </li>
        ))}
      </ul>
      {setItem.isError && (
        <ErrorBanner error={setItem.error} onRetry={() => setItem.mutate(setItem.variables!)} />
      )}
      {removeItem.isError && (
        <ErrorBanner
          error={removeItem.error}
          onRetry={() => removeItem.mutate(removeItem.variables!)}
        />
      )}
      <p className="cart__total">Итого: {formatMoney(cart.data.subtotal)}</p>
      <Link to="/checkout">Оформить заказ</Link>
    </div>
  );
}
