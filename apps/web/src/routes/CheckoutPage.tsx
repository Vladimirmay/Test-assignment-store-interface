import { useEffect, useMemo, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import type { Delivery, Quote } from '@checkout/contracts';
import { createIdempotencyKey } from '../api/idempotency';
import { RequestError } from '../api/client';
import { applyServerFieldErrors } from '../lib/applyServerFieldErrors';
import { useDebouncedValue } from '../lib/useDebouncedValue';
import { formatMoney } from '../lib/money';
import { useCart } from '../queries/useCart';
import { useCheckoutOptions } from '../queries/useCheckoutOptions';
import { useCreateOrder } from '../queries/useOrder';
import { queryKeys } from '../queries/queryKeys';
import { useCreateQuote } from '../queries/useQuote';
import { useSession } from '../session/SessionProvider';
import { ErrorBanner } from '../ui/ErrorBanner';
import { Loading } from '../ui/Loading';

function isStaleCartError(error: unknown): boolean {
  return (
    error instanceof RequestError && ['CART_VERSION_CONFLICT', 'QUOTE_EXPIRED'].includes(error.code)
  );
}

type CheckoutFormValues = {
  name: string;
  email: string;
  phone: string;
  deliveryMethod: 'pickup' | 'courier';
  pickupPointId: string;
  city: string;
  street: string;
  house: string;
  apartment: string;
  paymentMethod: 'card' | 'cash_on_delivery';
};

export function CheckoutPage() {
  const cart = useCart();
  const checkoutOptions = useCheckoutOptions();
  const createQuoteMutation = useCreateQuote();
  const createOrderMutation = useCreateOrder();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { token } = useSession();
  const orderKeyRef = useRef(createIdempotencyKey());
  const [quote, setQuote] = useState<Quote>();

  const {
    register,
    handleSubmit,
    watch,
    setError,
    formState: { errors },
  } = useForm<CheckoutFormValues>({
    defaultValues: { deliveryMethod: 'pickup', paymentMethod: 'card' },
  });

  const [deliveryMethod, pickupPointId, city, street, house, apartment] = watch([
    'deliveryMethod',
    'pickupPointId',
    'city',
    'street',
    'house',
    'apartment',
  ]);

  const delivery = useMemo<Delivery | undefined>(() => {
    if (deliveryMethod === 'pickup')
      return pickupPointId ? { method: 'pickup', pickupPointId } : undefined;
    if (city && street && house)
      return {
        method: 'courier',
        address: { city, street, house, apartment: apartment || undefined },
      };
    return undefined;
  }, [deliveryMethod, pickupPointId, city, street, house, apartment]);

  const debouncedDelivery = useDebouncedValue(delivery, 400);

  useEffect(() => {
    if (!debouncedDelivery || !cart.data || cart.data.items.length === 0) return;
    createQuoteMutation.mutate(
      { cartVersion: cart.data.version, delivery: debouncedDelivery },
      {
        onSuccess: setQuote,
        onError: (error) => {
          if (isStaleCartError(error))
            queryClient.invalidateQueries({ queryKey: queryKeys.cart(token) });
        },
      },
    );
  }, [debouncedDelivery, cart.data?.version]);

  if (cart.isPending || checkoutOptions.isPending) return <Loading label="Загружаем оформление…" />;
  if (cart.isError) return <ErrorBanner error={cart.error} onRetry={() => cart.refetch()} />;
  if (checkoutOptions.isError)
    return <ErrorBanner error={checkoutOptions.error} onRetry={() => checkoutOptions.refetch()} />;
  if (cart.data.items.length === 0)
    return (
      <p>
        Корзина пуста. <Link to="/">Вернуться в каталог</Link>
      </p>
    );

  const quoteIsCurrent =
    quote &&
    quote.cartVersion === cart.data.version &&
    JSON.stringify(quote.delivery) === JSON.stringify(debouncedDelivery) &&
    Date.parse(quote.expiresAt) > Date.now();

  const pickupPoints =
    checkoutOptions.data.deliveryMethods.find((m) => m.id === 'pickup')?.pickupPoints ?? [];

  const onSubmit = handleSubmit((values) => {
    if (!quote || !quoteIsCurrent) return;
    createOrderMutation.mutate(
      {
        body: {
          quoteId: quote.id,
          paymentMethod: values.paymentMethod,
          customer: { name: values.name, email: values.email, phone: values.phone },
        },
        idempotencyKey: orderKeyRef.current,
      },
      {
        onSuccess: (order) => navigate(`/orders/${order.id}`),
        onError: (error) => {
          applyServerFieldErrors(error, setError);
          if (isStaleCartError(error)) {
            setQuote(undefined);
            queryClient.invalidateQueries({ queryKey: queryKeys.cart(token) });
          }
        },
      },
    );
  });

  return (
    <form className="checkout" onSubmit={onSubmit} noValidate>
      <fieldset>
        <legend>Контакты</legend>
        <label className="form-field">
          Имя
          <input {...register('name', { required: 'Укажите имя', minLength: 2 })} />
          {errors.name && <span className="form-error">{errors.name.message}</span>}
        </label>
        <label className="form-field">
          Email
          <input
            type="email"
            {...register('email', { required: 'Укажите email', pattern: /^\S+@\S+\.\S+$/ })}
          />
          {errors.email && (
            <span className="form-error">{errors.email.message || 'Некорректный email'}</span>
          )}
        </label>
        <label className="form-field">
          Телефон
          <input
            type="tel"
            placeholder="+79990000000"
            {...register('phone', { required: 'Укажите телефон', pattern: /^\+[1-9]\d{9,14}$/ })}
          />
          {errors.phone && (
            <span className="form-error">{errors.phone.message || 'Формат: +79990000000'}</span>
          )}
        </label>
      </fieldset>

      <fieldset>
        <legend>Доставка</legend>
        <label>
          <input type="radio" value="pickup" {...register('deliveryMethod')} /> Самовывоз
        </label>
        <label>
          <input type="radio" value="courier" {...register('deliveryMethod')} /> Курьер
        </label>

        {deliveryMethod === 'pickup' && (
          <label className="form-field">
            Пункт выдачи
            <select {...register('pickupPointId', { required: true })}>
              <option value="">Выберите пункт</option>
              {pickupPoints.map((point) => (
                <option key={point.id} value={point.id}>
                  {point.title} — {point.address}
                </option>
              ))}
            </select>
          </label>
        )}

        {deliveryMethod === 'courier' && (
          <>
            <label className="form-field">
              Город
              <input {...register('city', { required: true })} />
            </label>
            <label className="form-field">
              Улица
              <input {...register('street', { required: true })} />
            </label>
            <label className="form-field">
              Дом
              <input {...register('house', { required: true })} />
            </label>
            <label className="form-field">
              Квартира (необязательно)
              <input {...register('apartment')} />
            </label>
          </>
        )}
      </fieldset>

      <fieldset>
        <legend>Оплата</legend>
        {checkoutOptions.data.paymentMethods.map((method) => (
          <label key={method.id}>
            <input type="radio" value={method.id} {...register('paymentMethod')} /> {method.title}
          </label>
        ))}
      </fieldset>

      <div className="checkout__summary">
        {!delivery && <p>Выберите способ доставки, чтобы увидеть итоговую сумму.</p>}
        {delivery && !quoteIsCurrent && <Loading label="Рассчитываем стоимость…" />}
        {quoteIsCurrent && (
          <p>
            Товары: {formatMoney(quote.subtotal)}, доставка: {formatMoney(quote.shipping)}, итого:{' '}
            <strong>{formatMoney(quote.total)}</strong>
          </p>
        )}
      </div>

      {createOrderMutation.isError && <ErrorBanner error={createOrderMutation.error} />}

      <button type="submit" disabled={!quoteIsCurrent || createOrderMutation.isPending}>
        Оформить заказ
      </button>
    </form>
  );
}
