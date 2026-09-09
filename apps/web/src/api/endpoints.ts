import type { Cart, CreateOrder, Delivery, Order, Payment, Product, Quote, Scenario, Simulation } from '@checkout/contracts';
import { request } from './client';
import type { CheckoutOptions, Sandbox, Session } from './types';

export const createSession = () => request<Session>('/api/sessions', { method: 'POST', body: {} });

export const getProducts = () => request<Product[]>('/api/products');

export const getCart = (token: string) => request<Cart>('/api/cart', { token });

export const setCartItem = (token: string, productId: string, quantity: number) =>
  request<Cart['items'][number]>(`/api/cart/items/${productId}`, {
    method: 'PUT',
    token,
    body: { quantity },
  });

export const removeCartItem = (token: string, productId: string) =>
  request<void>(`/api/cart/items/${productId}`, { method: 'DELETE', token });

export const getCheckoutOptions = (token: string) =>
  request<CheckoutOptions>('/api/checkout/options', { token });

export const getSandbox = () => request<Sandbox>('/api/sandbox');

export const createQuote = (token: string, cartVersion: number, delivery: Delivery) =>
  request<Quote>('/api/quotes', { method: 'POST', token, body: { cartVersion, delivery } });

export const createOrder = (token: string, body: CreateOrder, idempotencyKey: string) =>
  request<Order>('/api/orders', { method: 'POST', token, body, idempotencyKey });

export const getOrder = (token: string, orderId: string) =>
  request<Order>(`/api/orders/${orderId}`, { token });

export const createPayment = (token: string, orderId: string, idempotencyKey: string) =>
  request<Payment>(`/api/orders/${orderId}/payments`, { method: 'POST', token, body: {}, idempotencyKey });

export const getPayment = (token: string, paymentId: string) =>
  request<Payment>(`/api/payments/${paymentId}`, { token });

export const createSimulation = (token: string, paymentId: string, scenario: Scenario) =>
  request<Simulation>(`/api/payments/${paymentId}/simulations`, {
    method: 'POST',
    token,
    body: { scenario },
  });
