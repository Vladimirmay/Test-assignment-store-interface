import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import type { Cart } from '@checkout/contracts';
import { formatMoney } from '../lib/money';
import { useCart, useRemoveCartItem, useSetCartItem } from '../queries/useCart';
import { ErrorBanner } from '../ui/ErrorBanner';
import { Loading } from '../ui/Loading';

type CartItemRowProps = {
  item: Cart['items'][number];
  setItem: ReturnType<typeof useSetCartItem>;
  removeItem: ReturnType<typeof useRemoveCartItem>;
};

function CartItemRow({ item, setItem, removeItem }: CartItemRowProps) {
  const [value, setValue] = useState(String(item.quantity));

  useEffect(() => {
    setValue(String(item.quantity));
  }, [item.quantity]);

  const commit = () => {
    const quantity = Number(value);
    const isValid = Number.isInteger(quantity) && quantity >= 1 && quantity <= 99;
    if (isValid && quantity !== item.quantity) {
      setItem.mutate({ productId: item.productId, quantity });
    } else {
      setValue(String(item.quantity));
      setItem.reset();
    }
  };

  return (
    <li className="cart__item">
      <span>{item.title}</span>
      <label>
        Количество
        <input
          type="number"
          min={1}
          max={99}
          value={value}
          disabled={setItem.isPending}
          onChange={(event) => setValue(event.target.value)}
          onBlur={commit}
          onKeyDown={(event) => {
            if (event.key === 'Enter') event.currentTarget.blur();
          }}
        />
      </label>
      <span>{formatMoney(item.lineTotal)}</span>
      <button disabled={removeItem.isPending} onClick={() => removeItem.mutate(item.productId)}>
        Удалить
      </button>
    </li>
  );
}

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
          <CartItemRow key={item.productId} item={item} setItem={setItem} removeItem={removeItem} />
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
      <Link to="/checkout" className="button button--primary">
        Оформить заказ
      </Link>
    </div>
  );
}
