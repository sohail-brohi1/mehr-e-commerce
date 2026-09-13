import { api } from "@/services/api";
import type { Order } from "@/store/shop";

export type PayToSettings = {
  jazzcash: string;
  easypaisa: string;
  bankTitle: string;
  bankName: string;
  iban: string;
};

export const DEFAULT_PAY_TO: PayToSettings = {
  jazzcash: "0300 8484848",
  easypaisa: "0300 8484848",
  bankTitle: "MEHR Atelier",
  bankName: "Habib Bank Limited",
  iban: "PK12 HABB 0000 0000 0000 0000",
};

/** @deprecated Prefer live `/pay-to` from studio settings. Kept as checkout fallback. */
export const PAY_TO = {
  jazzcash: DEFAULT_PAY_TO.jazzcash,
  easypaisa: DEFAULT_PAY_TO.easypaisa,
  bank: {
    title: DEFAULT_PAY_TO.bankTitle,
    name: DEFAULT_PAY_TO.bankName,
    iban: DEFAULT_PAY_TO.iban,
  },
};

export type StripeCheckoutResult = {
  url: string | null;
  alreadyPaid: boolean;
  order: Order;
};

export function stripeReturnUrls() {
  const origin = window.location.origin;
  return {
    successUrl: `${origin}/checkout?stripe=success&session_id={CHECKOUT_SESSION_ID}`,
    cancelUrl: `${origin}/checkout?stripe=cancel`,
  };
}

export type StripeCheckoutDraft = {
  orderId?: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  addressLine1: string;
  city: string;
  postalCode: string;
  shipping: number;
  items: { productId: string; size: string; color: string; qty: number }[];
};

export function startStripeCheckout(draft: StripeCheckoutDraft) {
  return api<StripeCheckoutResult>("/payments/stripe/session", {
    method: "POST",
    body: JSON.stringify({
      ...draft,
      paymentMethod: "card",
      paymentStatus: "pending",
      ...stripeReturnUrls(),
    }),
  });
}

export function confirmStripeSession(sessionId: string) {
  return api<Order>(`/payments/stripe/session/${encodeURIComponent(sessionId)}`);
}

export function displayPayTo(s: PayToSettings) {
  return {
    jazzcash: s.jazzcash,
    easypaisa: s.easypaisa,
    bank: { title: s.bankTitle, name: s.bankName, iban: s.iban },
  };
}
