import { useMemo, useState } from "react";
import {
  Check,
  CircleAlert,
  LoaderCircle,
  Sparkles,
  Zap,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { usePlanListQuery } from "@/features/subscription/subscriptionApiSlice";
import { getApiErrorMessage } from "@/lib/get-api-error-message";
import { cn } from "@/lib/utils";

const PLAN_COLORS = [
  "bg-sky-500",
  "bg-primary",
  "bg-violet-600",
  "bg-emerald-600",
];

const HTML_ENTITIES = {
  amp: "&",
  apos: "'",
  gt: ">",
  lt: "<",
  nbsp: " ",
  quot: '"',
};

const decodeHtmlEntities = (value) =>
  value
    .replace(/&#x([\da-f]+);/gi, (_, code) =>
      String.fromCodePoint(Number.parseInt(code, 16)),
    )
    .replace(/&#(\d+);/g, (_, code) =>
      String.fromCodePoint(Number.parseInt(code, 10)),
    )
    .replace(/&([a-z]+);/gi, (entity, name) =>
      Object.hasOwn(HTML_ENTITIES, name.toLowerCase())
        ? HTML_ENTITIES[name.toLowerCase()]
        : entity,
    );

const humanize = (value = "") => {
  const label = String(value).replaceAll(/[_-]+/g, " ").trim();
  if (!label) return "";

  return label
    .replace(/^\w/, (letter) => letter.toUpperCase())
    .replace(/\b(ai|api|crm|html|mb|usd)\b/gi, (word) => word.toUpperCase());
};

const getDetailItems = (detailsHtml) => {
  if (!detailsHtml) return [];

  const text = String(detailsHtml)
    .replace(/<\s*br\s*\/?\s*>/gi, "\n")
    .replace(/<\/(?:div|li|p)>/gi, "\n")
    .replace(/<li[^>]*>/gi, "")
    .replace(/<[^>]+>/g, "");

  return decodeHtmlEntities(text)
    .split(/\r?\n|•/)
    .map((item) => item.trim())
    .filter(Boolean);
};

const toAmount = (value) => {
  const amount = Number.parseFloat(value);
  return Number.isFinite(amount) ? amount : null;
};

const normalizePlan = (plan, index) => {
  const prices = Array.isArray(plan.prices) ? plan.prices : [];
  const priceByInterval = prices.reduce((result, price) => {
    const interval = price.billing_interval?.toLowerCase();
    if (!interval) return result;

    result[interval] = {
      ...price,
      amount: toAmount(price.amount),
      overageUnitPrice: toAmount(price.ai_message_overage_unit_price),
    };
    return result;
  }, {});
  const detailItems = getDetailItems(plan.details_html);
  const features = detailItems.length
    ? detailItems
    : (Array.isArray(plan.features) ? plan.features : [])
        .map(humanize)
        .filter(Boolean);
  const monthlyPrice =
    priceByInterval.monthly?.amount ?? priceByInterval.annual?.amount ?? 0;

  return {
    ...plan,
    id: plan.id || plan.slug || "plan-" + index,
    slug: plan.slug || plan.id,
    planType: humanize(plan.plan_type),
    isFree: Boolean(plan.is_free),
    requiresSalesContact: Boolean(plan.requires_sales_contact),
    overageEnabled: Boolean(plan.ai_message_overage_enabled),
    sortOrder: Number(plan.sort_order) || 0,
    color: PLAN_COLORS[index % PLAN_COLORS.length],
    popular: Boolean(plan.is_popular),
    features,
    description: features.length
      ? features.join(" · ")
      : (humanize(plan.plan_type) || "Subscription") + " plan",
    limits: {
      messages: Number(plan.ai_message_limit) || 0,
      chunks: Number(plan.knowledge_chunk_limit) || 0,
      storage: Number(plan.file_size_limit_mb) || 0,
      seats: Number(plan.team_member_limit) || 1,
    },
    monthlyPrice,
    annualPrice: priceByInterval.annual?.amount ?? null,
    priceByInterval,
  };
};

const isSamePlan = (currentPlan, plan) =>
  [currentPlan?.id, currentPlan?.slug].filter(Boolean).some((identifier) =>
    [plan.id, plan.slug].includes(identifier),
  );

const getPrice = (plan, interval) => {
  if (!plan) return null;
  if (plan.isFree) {
    return (
      plan.priceByInterval[interval] ||
      Object.values(plan.priceByInterval)[0] || {
        amount: 0,
        billing_interval: interval,
        currency: plan.prices?.[0]?.currency || "USD",
        overageUnitPrice: null,
      }
    );
  }

  const price = plan.priceByInterval[interval];
  return price?.amount == null ? null : price;
};

const formatNumber = (value) => Number(value || 0).toLocaleString();

const formatMoney = (amount, currency = "USD", minimumFractionDigits = 0) => {
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency,
      minimumFractionDigits,
      maximumFractionDigits: Math.max(minimumFractionDigits, 2),
    }).format(amount);
  } catch {
    return currency + " " + Number(amount).toFixed(minimumFractionDigits);
  }
};

function PlanLoadingState() {
  return (
    <div className="flex min-h-80 flex-col items-center justify-center px-6 py-12 text-center">
      <LoaderCircle className="size-7 animate-spin text-primary" />
      <p className="mt-4 text-sm font-semibold">Loading subscription plans</p>
      <p className="mt-1 text-xs text-muted-foreground">
        Fetching the latest prices and limits…
      </p>
    </div>
  );
}

function PlanErrorState({ error, onRetry }) {
  return (
    <div className="flex min-h-80 flex-col items-center justify-center px-6 py-12 text-center">
      <span className="flex size-11 items-center justify-center rounded-full bg-destructive/10 text-destructive">
        <CircleAlert className="size-5" />
      </span>
      <p className="mt-4 text-sm font-semibold">Unable to load plans</p>
      <p className="mt-1 max-w-sm text-xs leading-5 text-muted-foreground">
        {getApiErrorMessage(error, "Please try loading the plans again.")}
      </p>
      <Button className="mt-5" size="sm" variant="outline" onClick={onRetry}>
        Try again
      </Button>
    </div>
  );
}

const PlanListDialog = ({
  open,
  onClose,
  currentPlan,
  onUpgrade,
  isSubmitting = false,
  allowCurrentPlanSelection = false,
}) => {
  const { data, isLoading, isFetching, isError, error, refetch } =
    usePlanListQuery(undefined, { skip: !open });
  const [billingCycle, setBillingCycle] = useState("annual");
  const [selectedPlanId, setSelectedPlanId] = useState(null);

  const plans = useMemo(() => {
    const planList = Array.isArray(data?.data)
      ? data.data
      : Array.isArray(data)
        ? data
        : [];

    return planList
      .map(normalizePlan)
      .sort((first, second) => first.sortOrder - second.sortOrder);
  }, [data]);

  const monthlyAvailable = plans.some(
    (plan) => plan.isFree || Boolean(getPrice(plan, "monthly")),
  );
  const annualAvailable = plans.some(
    (plan) => plan.isFree || Boolean(getPrice(plan, "annual")),
  );
  const activeBillingCycle =
    billingCycle === "annual" && !annualAvailable && monthlyAvailable
      ? "monthly"
      : billingCycle === "monthly" && !monthlyAvailable && annualAvailable
        ? "annual"
        : billingCycle;
  const selectablePlans = plans.filter(
    (plan) =>
      (allowCurrentPlanSelection || !isSamePlan(currentPlan, plan)) &&
      (plan.requiresSalesContact || getPrice(plan, activeBillingCycle)),
  );
  const selected =
    selectablePlans.find((plan) => plan.id === selectedPlanId) ||
    (allowCurrentPlanSelection
      ? selectablePlans.find((plan) => isSamePlan(currentPlan, plan))
      : null) ||
    selectablePlans[0] ||
    plans.find((plan) => isSamePlan(currentPlan, plan)) ||
    null;
  const selectedPrice = getPrice(selected, activeBillingCycle);
  const selectedIsCurrent = selected
    ? isSamePlan(currentPlan, selected) && !allowCurrentPlanSelection
    : false;

  const savings = useMemo(() => {
    const percentages = plans
      .map((plan) => {
        const monthly = getPrice(plan, "monthly")?.amount;
        const annual = getPrice(plan, "annual")?.amount;
        if (!monthly || annual == null || annual >= monthly * 12) return 0;
        return Math.round((1 - annual / (monthly * 12)) * 100);
      })
      .filter(Boolean);

    return percentages.length ? Math.max(...percentages) : 0;
  }, [plans]);

  const handleUpgrade = () => {
    if (!selected || selectedIsCurrent) return;
    onUpgrade(
      {
        ...selected,
        selectedPrice,
      },
      activeBillingCycle,
    );
  };

  const chargedNow = selectedPrice
    ? selectedPrice.amount
    : null;
  const currency = selectedPrice?.currency || "USD";
  const showLoading = isLoading || (isFetching && !plans.length);

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => !next && !isSubmitting && onClose()}
    >
      <DialogContent className="custom-scrollbar max-h-[94vh] overflow-y-auto rounded-3xl p-0 sm:max-w-7xl">
        <DialogHeader className="border-b bg-muted/25 px-6 py-6 sm:px-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between sm:pr-10">
            <div>
              <DialogTitle className="text-xl">
                Choose the plan that fits your team
              </DialogTitle>
              <DialogDescription className="mt-2">
                Compare limits and features, then choose your billing period.
              </DialogDescription>
            </div>
            {!showLoading && !isError && plans.length > 0 && (
              <div className="flex rounded-full border bg-background p-1">
                <button
                  type="button"
                  disabled={!monthlyAvailable}
                  onClick={() => setBillingCycle("monthly")}
                  className={cn(
                    "rounded-full px-3 py-1.5 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-40",
                    activeBillingCycle === "monthly" &&
                      "bg-foreground text-background",
                  )}
                >
                  Monthly
                </button>
                <button
                  type="button"
                  disabled={!annualAvailable}
                  onClick={() => setBillingCycle("annual")}
                  className={cn(
                    "rounded-full px-3 py-1.5 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-40",
                    activeBillingCycle === "annual" &&
                      "bg-foreground text-background",
                  )}
                >
                  Annual
                  {savings > 0 && (
                    <span className="ml-1 text-emerald-500">
                      Save up to {savings}%
                    </span>
                  )}
                </button>
              </div>
            )}
          </div>
        </DialogHeader>

        {showLoading ? (
          <PlanLoadingState />
        ) : isError ? (
          <PlanErrorState error={error} onRetry={refetch} />
        ) : plans.length === 0 ? (
          <div className="flex min-h-80 flex-col items-center justify-center px-6 py-12 text-center">
            <Sparkles className="size-7 text-muted-foreground" />
            <p className="mt-4 text-sm font-semibold">No plans available</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Subscription plans have not been configured yet.
            </p>
          </div>
        ) : (
          <div
            className={cn(
              "grid gap-4 px-6 py-6 sm:px-8",
              plans.length === 1
                ? "mx-auto w-full max-w-md grid-cols-1"
                : "md:grid-cols-2 xl:grid-cols-4",
            )}
          >
            {plans.map((plan) => {
              const price = getPrice(plan, activeBillingCycle);
              const isSelected = plan.id === selected?.id;
              const isCurrent = isSamePlan(currentPlan, plan);
              const currentSelectionBlocked =
                isCurrent && !allowCurrentPlanSelection;
              const isUnavailable = !price && !plan.requiresSalesContact;
              const overagePrice = price?.overageUnitPrice;

              return (
                <button
                  key={plan.id}
                  type="button"
                  aria-pressed={isSelected}
                  disabled={
                    currentSelectionBlocked || isUnavailable || isSubmitting
                  }
                  onClick={() => setSelectedPlanId(plan.id)}
                  className={cn(
                    "relative flex min-h-[29rem] flex-col rounded-3xl border p-5 text-left transition",
                    isSelected && !currentSelectionBlocked
                      ? "border-primary bg-primary/[0.04] ring-4 ring-primary/10"
                      : "hover:border-primary/40",
                    (currentSelectionBlocked || isUnavailable) &&
                      "cursor-default bg-muted/30 opacity-65",
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    <span
                      className={cn(
                        "flex size-10 items-center justify-center rounded-xl text-white",
                        plan.isFree ? "bg-slate-500" : plan.color,
                      )}
                    >
                      {plan.isFree ? (
                        <Sparkles className="size-4" />
                      ) : (
                        <Zap className="size-4" />
                      )}
                    </span>
                    <div className="flex flex-wrap justify-end gap-1.5">
                      {plan.popular && (
                        <span className="rounded-full bg-primary px-2 py-1 text-[9px] font-bold uppercase text-primary-foreground">
                          Popular
                        </span>
                      )}
                      {isCurrent && (
                        <span className="rounded-full bg-muted px-2 py-1 text-[9px] font-semibold">
                          {allowCurrentPlanSelection
                            ? "Checkout pending"
                            : "Current plan"}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="mt-4">
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold">{plan.name}</h3>
                      {plan.planType && (
                        <span className="rounded-full border px-2 py-0.5 text-[9px] font-semibold uppercase text-muted-foreground">
                          {plan.planType}
                        </span>
                      )}
                    </div>
                    <div className="mt-3">
                      {plan.requiresSalesContact ? (
                        <span className="text-3xl font-bold">Custom</span>
                      ) : price ? (
                        <>
                          <span className="text-3xl font-bold">
                            {price.amount === 0
                              ? "Free"
                              : formatMoney(price.amount, price.currency)}
                          </span>
                          {price.amount > 0 && (
                            <span className="text-xs text-muted-foreground">
                              {" "}/ {activeBillingCycle === "annual" ? "year" : "month"}
                            </span>
                          )}
                        </>
                      ) : (
                        <span className="text-xl font-bold text-muted-foreground">
                          Unavailable
                        </span>
                      )}
                      <p className="mt-1 min-h-4 text-[10px] text-muted-foreground">
                        {price?.amount > 0 && activeBillingCycle === "annual"
                          ? formatMoney(price.amount, price.currency) +
                            " billed annually"
                          : price?.amount > 0
                            ? "Billed monthly"
                            : plan.requiresSalesContact
                              ? "Talk to sales for tailored pricing"
                              : "No payment required"}
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 grid grid-cols-3 gap-2 border-y py-4">
                    <div>
                      <p className="text-sm font-bold">
                        {formatNumber(plan.limits.messages)}
                      </p>
                      <p className="mt-0.5 text-[9px] leading-3 text-muted-foreground">
                        AI messages
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-bold">
                        {formatNumber(plan.limits.chunks)}
                      </p>
                      <p className="mt-0.5 text-[9px] leading-3 text-muted-foreground">
                        Knowledge chunks
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-bold">
                        {formatNumber(plan.limits.storage)} MB
                      </p>
                      <p className="mt-0.5 text-[9px] leading-3 text-muted-foreground">
                        File size limit
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 space-y-2.5">
                    <p className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
                      Included features
                    </p>
                    {plan.features.length ? (
                      plan.features.map((feature) => (
                        <div key={feature} className="flex gap-2 text-xs">
                          <Check className="mt-0.5 size-3.5 shrink-0 text-emerald-500" />
                          <span>{feature}</span>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-muted-foreground">
                        Core subscription features included
                      </p>
                    )}
                  </div>

                  {plan.overageEnabled && overagePrice != null && (
                    <p className="mt-4 rounded-xl bg-muted/50 px-3 py-2 text-[10px] leading-4 text-muted-foreground">
                      Additional AI messages are{" "}
                      {formatMoney(overagePrice, price.currency, 2)} each.
                    </p>
                  )}

                  {isSelected && !currentSelectionBlocked && (
                    <span className="mt-auto pt-5 text-center text-xs font-bold text-primary">
                      Selected plan
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}

        <DialogFooter className="items-center gap-4 border-t bg-muted/20 px-6 py-4 sm:justify-between sm:px-8">
          <div className="text-left">
            {selected ? (
              <>
                <p className="text-xs font-semibold">
                  {selected.requiresSalesContact
                    ? "Sales-assisted plan"
                    : selected.isFree
                      ? "Free plan activation"
                      : "Secure checkout powered by Stripe"}
                </p>
                <p className="mt-0.5 text-[10px] text-muted-foreground">
                  {selected.requiresSalesContact
                    ? "Our team will help tailor this plan to your needs."
                    : chargedNow === 0
                      ? "No charge for this plan"
                      : chargedNow != null
                        ? formatMoney(chargedNow, currency, 2) +
                          " due at checkout · billed " +
                          (activeBillingCycle === "annual"
                            ? "annually"
                            : "monthly")
                        : "Pricing is unavailable for this billing period"}
                </p>
              </>
            ) : (
              <p className="text-xs text-muted-foreground">
                Select a plan to continue
              </p>
            )}
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              disabled={isSubmitting}
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              disabled={
                isSubmitting ||
                !selected ||
                selectedIsCurrent ||
                (!selectedPrice && !selected?.requiresSalesContact)
              }
              onClick={handleUpgrade}
            >
              {isSubmitting ? (
                <LoaderCircle className="animate-spin" />
              ) : (
                <Zap />
              )}
              {isSubmitting
                ? "Preparing…"
                : selected?.requiresSalesContact
                  ? "Contact sales"
                  : selectedIsCurrent
                    ? "Current plan"
                    : selected?.isFree
                      ? "Activate " + selected.name
                      : selected
                        ? "Continue to payment"
                        : "Choose a plan"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PlanListDialog;
