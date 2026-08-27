import { loadStripe } from "@stripe/stripe-js/pure";

const publishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY?.trim();
const billingReturnPathKey = "argon.stripe.billing-return-path";
let stripePromise;

export const isStripeConfigured = Boolean(publishableKey);

export const initializeStripe = () => {
  if (!publishableKey) return Promise.resolve(null);

  stripePromise ||= loadStripe(publishableKey);
  return stripePromise;
};

export const rememberStripeReturnPath = (path) => {
  try {
    window.sessionStorage.setItem(billingReturnPathKey, path);
  } catch {
    // Checkout can still proceed when browser storage is unavailable.
  }
};

export const getStripeReturnPath = () => {
  try {
    const path = window.sessionStorage.getItem(billingReturnPathKey);
    return path?.startsWith("/") && !path.startsWith("//") ? path : "/";
  } catch {
    return "/";
  }
};

export const redirectToStripeSession = async (sessionUrl) => {
  if (!sessionUrl) {
    throw new Error("The server did not return a Stripe Session URL.");
  }

  const url = new URL(sessionUrl, window.location.origin);
  if (!["http:", "https:"].includes(url.protocol)) {
    throw new Error("The server returned an invalid Stripe Session URL.");
  }

  // Stripe.js no longer exposes redirectToCheckout. The current hosted
  // Checkout flow navigates to the server-created Session URL directly.
  await initializeStripe().catch(() => null);
  window.location.assign(url.toString());
};
