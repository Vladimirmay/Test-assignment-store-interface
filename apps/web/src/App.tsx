import { Link, Route, Routes } from 'react-router-dom';
import { CartPage } from './routes/CartPage';
import { CatalogPage } from './routes/CatalogPage';
import { CheckoutPage } from './routes/CheckoutPage';
import { OrderStatusPage } from './routes/OrderStatusPage';

export function App() {
  return (
    <div className="app">
      <header className="app__header">
        <Link to="/">Каталог</Link>
        <Link to="/cart">Корзина</Link>
      </header>
      <main>
        <Routes>
          <Route path="/" element={<CatalogPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/orders/:orderId" element={<OrderStatusPage />} />
        </Routes>
      </main>
    </div>
  );
}
