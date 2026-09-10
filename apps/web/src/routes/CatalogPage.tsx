import { useMemo } from 'react';
import { formatMoney } from '../lib/money';
import { useCart, useSetCartItem } from '../queries/useCart';
import { useProducts } from '../queries/useProducts';
import { ErrorBanner } from '../ui/ErrorBanner';
import { Loading } from '../ui/Loading';

export function CatalogPage() {
  const products = useProducts();
  const cart = useCart();
  const setItem = useSetCartItem();

  const quantityByProductId = useMemo(
    () => new Map(cart.data?.items.map((item) => [item.productId, item.quantity])),
    [cart.data],
  );

  if (products.isPending) return <Loading label="Загружаем каталог…" />;
  if (products.isError)
    return <ErrorBanner error={products.error} onRetry={() => products.refetch()} />;

  return (
    <>
      <ul className="catalog">
        {products.data.map((product) => {
          const inCart = quantityByProductId.get(product.id) ?? 0;
          const soldOut = product.stock === 0;
          const atLimit = inCart >= product.stock;
          return (
            <li key={product.id} className="catalog__item">
              <h3>{product.title}</h3>
              <p>{product.description}</p>
              <p>{formatMoney(product.price)}</p>
              <button
                disabled={soldOut || atLimit || setItem.isPending}
                onClick={() => setItem.mutate({ productId: product.id, quantity: inCart + 1 })}
              >
                {soldOut
                  ? 'Нет в наличии'
                  : atLimit
                    ? `В корзине: ${inCart} (максимум)`
                    : inCart
                      ? `В корзине: ${inCart}`
                      : 'В корзину'}
              </button>
            </li>
          );
        })}
      </ul>
      {setItem.isError && (
        <ErrorBanner error={setItem.error} onRetry={() => setItem.mutate(setItem.variables!)} />
      )}
    </>
  );
}
