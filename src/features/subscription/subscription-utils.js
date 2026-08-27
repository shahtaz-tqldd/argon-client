const firstDefined = (...values) =>
  values.find((value) => value !== undefined && value !== null && value !== "");

const toNumber = (value, fallback = 0) => {
  const number = Number.parseFloat(value);
  return Number.isFinite(number) ? number : fallback;
};

export const unwrapApiData = (response) => {
  if (!response || typeof response !== "object") return response;
  if (!Object.hasOwn(response, "data")) return response;

  const payload = response.data;
  if (
    payload &&
    typeof payload === "object" &&
    !Array.isArray(payload) &&
    Object.hasOwn(payload, "data")
  ) {
    return payload.data;
  }

  return payload;
};

export const getApiList = (response) => {
  const payload = unwrapApiData(response);
  if (Array.isArray(payload)) return payload;

  const candidates = [payload?.results, payload?.payments, payload?.items];
  return candidates.find(Array.isArray) || [];
};

export const getStripeSessionUrl = (response) => {
  const payload = unwrapApiData(response);
  return firstDefined(
    payload?.url,
    payload?.checkout_url,
    payload?.session_url,
    payload?.portal_url,
    payload?.checkout_session?.url,
    payload?.session?.url,
  );
};

export const getStripeClientSecret = (response) => {
  const payload = unwrapApiData(response);
  return firstDefined(
    payload?.client_secret,
    payload?.checkout_client_secret,
    payload?.session?.client_secret,
  );
};

export const normalizeSubscription = (response) => {
  const payload = unwrapApiData(response);
  const subscription =
    payload &&
    typeof payload === "object" &&
    Object.hasOwn(payload, "subscription")
      ? payload.subscription
      : payload;
  if (!subscription || Array.isArray(subscription)) return null;

  const snapshot = subscription.snapshot || {};
  const plan =
    snapshot.plan ||
    subscription.plan_snapshot ||
    subscription.plan ||
    subscription.plan_details ||
    {};
  const price =
    snapshot.pricing ||
    subscription.price_snapshot ||
    subscription.plan_price ||
    subscription.price ||
    {};
  const limits = snapshot.limits || {};
  const rawAmount = firstDefined(
    price.amount,
    subscription.amount,
    subscription.recurring_amount,
  );
  const unitAmount = firstDefined(price.unit_amount, subscription.unit_amount);
  const amount =
    rawAmount !== undefined
      ? toNumber(rawAmount)
      : unitAmount !== undefined
        ? toNumber(unitAmount) / 100
        : 0;
  const isFree = Boolean(
    firstDefined(plan.is_free, subscription.is_free, amount === 0),
  );
  const features = firstDefined(
    plan.features,
    subscription.features,
    subscription.feature_snapshot,
  );

  return {
    ...subscription,
    id: firstDefined(subscription.id, subscription.subscription_id),
    status: firstDefined(subscription.status, "active"),
    cancelAtPeriodEnd: Boolean(subscription.cancel_at_period_end),
    currentPeriodEnd: firstDefined(
      subscription.current_period_end,
      subscription.period_end,
      subscription.renews_at,
    ),
    currentPeriodStart: firstDefined(
      subscription.current_period_start,
      subscription.period_start,
    ),
    customerEmail: firstDefined(
      subscription.customer_email,
      subscription.billing_email,
      subscription.stripe_customer_email,
    ),
    amount,
    currency: String(
      firstDefined(price.currency, subscription.currency, "USD"),
    ).toUpperCase(),
    billingInterval: firstDefined(
      price.billing_interval,
      subscription.billing_interval,
      subscription.interval,
    ),
    plan: {
      ...plan,
      id: firstDefined(plan.id, subscription.plan_id),
      slug: firstDefined(plan.slug, subscription.plan_slug),
      name: firstDefined(plan.name, subscription.plan_name, "Subscription"),
      isFree,
      features: Array.isArray(features) ? features : [],
      limits: {
        messages: toNumber(
          firstDefined(
            plan.ai_message_limit,
            limits.ai_message_limit,
            subscription.ai_message_limit,
            subscription.ai_message_limit_snapshot,
          ),
        ),
        chunks: toNumber(
          firstDefined(
            plan.knowledge_chunk_limit,
            limits.knowledge_chunk_limit,
            subscription.knowledge_chunk_limit,
            subscription.knowledge_chunk_limit_snapshot,
          ),
        ),
        fileSize: toNumber(
          firstDefined(
            plan.file_size_limit_mb,
            limits.file_size_limit_mb,
            subscription.file_size_limit_mb,
            subscription.file_size_limit_mb_snapshot,
          ),
        ),
      },
    },
    isFree,
  };
};

const paymentAmount = (payment) => {
  const decimalAmount = firstDefined(
    payment.amount,
    payment.total,
    payment.amount_decimal,
  );
  if (decimalAmount !== undefined) return toNumber(decimalAmount);

  const stripeAmount = firstDefined(
    payment.amount_paid,
    payment.amount_due,
    payment.amount_refunded,
  );
  if (stripeAmount === undefined) return 0;

  const value = String(stripeAmount);
  return value.includes(".") ? toNumber(value) : toNumber(value) / 100;
};

export const normalizePayment = (payment) => ({
  ...payment,
  id: firstDefined(
    payment.provider_reference,
    payment.stripe_invoice_id,
    payment.invoice_id,
    payment.stripe_payment_intent_id,
    payment.id,
  ),
  date: firstDefined(
    payment.paid_at,
    payment.created_at,
    payment.created,
    payment.updated_at,
  ),
  description: firstDefined(
    payment.description,
    payment.plan_name,
    payment.lines?.[0]?.description,
    "Subscription payment",
  ),
  amount: paymentAmount(payment),
  currency: String(firstDefined(payment.currency, "USD")).toUpperCase(),
  status: firstDefined(payment.status, payment.payment_status, "recorded"),
  receiptUrl: firstDefined(
    payment.invoice_pdf,
    payment.invoice_url,
    payment.hosted_invoice_url,
    payment.receipt_url,
  ),
});

export const formatCurrency = (
  amount,
  currency = "USD",
  minimumFractionDigits = 2,
) => {
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency,
      minimumFractionDigits,
      maximumFractionDigits: 2,
    }).format(toNumber(amount));
  } catch {
    return currency + " " + toNumber(amount).toFixed(minimumFractionDigits);
  }
};
