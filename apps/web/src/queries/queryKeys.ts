export const queryKeys = {
  products: ['products'] as const,
  sandbox: ['sandbox'] as const,
  cart: (token: string) => ['cart', token] as const,
  checkoutOptions: (token: string) => ['checkout-options', token] as const,
  order: (token: string, orderId: string) => ['order', token, orderId] as const,
  payment: (token: string, paymentId: string) => ['payment', token, paymentId] as const,
};
