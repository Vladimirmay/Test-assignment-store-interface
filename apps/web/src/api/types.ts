import type { Cart } from '@checkout/contracts';

/**
 * Not exported by @checkout/contracts as a TS type (only as a TypeBox schema),
 * so it's described here directly, per docs/ASSIGNMENT.md's suggestion.
 */
export type Session = { id: string; token: string; cart: Cart };

export type DeliveryMethodOption = {
  id: 'pickup' | 'courier';
  title: string;
  price: number;
  freeFrom: number | null;
  pickupPoints: { id: string; title: string; address: string }[];
};

export type PaymentMethodOption = { id: 'card' | 'cash_on_delivery'; title: string };

export type CheckoutOptions = {
  cart: Cart;
  deliveryMethods: DeliveryMethodOption[];
  paymentMethods: PaymentMethodOption[];
};

export type SandboxCard = {
  id: string;
  title: string;
  maskedNumber: string;
  scenario: 'success' | 'decline';
};

export type Sandbox = { settlementDelayMs: number; cards: SandboxCard[] };
