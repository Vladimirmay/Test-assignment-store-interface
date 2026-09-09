import { formatMoney } from '../lib/money';
import { useCart, useSetCartItem } from '../queries/useCart';
import { useProducts } from '../queries/useProducts';
import { ErrorBanner } from '../ui/ErrorBanner';
import { Loading } from '../ui/Loading';

export function CatalogPage() {
  const products = useProducts();
  const cart = useCart();
  const setItem = useSetCartItem();

  if (products.isPending) return <Loading label="Загружаем каталог…" />;
  if (products.isError) return <ErrorBanner error={products.error} />;

  const quantityOf = (productId: string) =>
    cart.data?.items.find((item) => item.productId === productId)?.quantity ?? 0;

  return (
    <ul className="catalog">
      {products.data.map((product) => {
        const inCart = quantityOf(product.id);
        const soldOut = product.stock === 0;
        return (
          <li key={product.id} className="catalog__item">
            <h3>{product.title}</h3>
            <p>{product.description}</p>
            <p>{formatMoney(product.price)}</p>
            <button
              disabled={soldOut || setItem.isPending}
              onClick={() => setItem.mutate({ productId: product.id, quantity: inCart + 1 })}
            >
              {soldOut ? 'Нет в наличии' : inCart ? `В корзине: ${inCart}` : 'В корзину'}
            </button>
          </li>
        );
      })}
    </ul>
  );
}
