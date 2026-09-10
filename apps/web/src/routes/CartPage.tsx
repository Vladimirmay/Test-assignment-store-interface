import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import type { Cart } from '@checkout/contracts';
import { formatMoney } from '../lib/money';
import { useCart, useRemoveCartItem, useSetCartItem } from '../queries/useCart';
import { ErrorBanner } from '../ui/ErrorBanner';
import { Loading } from '../ui/Loading';

type CartItemRowProps = {
  item: Cart['items'][number];
  onValidityChange: (productId: string, isValid: boolean) => void;
};

function CartItemRow({ item, onValidityChange }: CartItemRowProps) {
  const [value, setValue] = useState(String(item.quantity));
  const setItem = useSetCartItem();
  const removeItem = useRemoveCartItem();

  useEffect(() => {
    setValue(String(item.quantity));
  }, [item.quantity]);

  useEffect(() => {
    onValidityChange(item.productId, !setItem.isError);
  }, [setItem.isError, item.productId, onValidityChange]);

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
          aria-invalid={setItem.isError}
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
      {setItem.isError && <ErrorBanner error={setItem.error} />}
      {removeItem.isError && <ErrorBanner error={removeItem.error} />}
    </li>
  );
}

export function CartPage() {
  const cart = useCart();
  const navigate = useNavigate();
  const [invalidProductIds, setInvalidProductIds] = useState<Set<string>>(new Set());

  const handleValidityChange = useCallback((productId: string, isValid: boolean) => {
    setInvalidProductIds((prev) => {
      if (isValid === !prev.has(productId)) return prev;
      const next = new Set(prev);
      if (isValid) next.delete(productId);
      else next.add(productId);
      return next;
    });
  }, []);

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
          <CartItemRow key={item.productId} item={item} onValidityChange={handleValidityChange} />
        ))}
      </ul>
      <p className="cart__total">Итого: {formatMoney(cart.data.subtotal)}</p>
      <button
        type="button"
        className="button button--primary"
        disabled={invalidProductIds.size > 0}
        onClick={() => navigate('/checkout')}
      >
        Оформить заказ
      </button>
    </div>
  );
}
