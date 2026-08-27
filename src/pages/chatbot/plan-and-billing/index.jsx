import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  CalendarDays,
  Check,
  ChevronRight,
  CircleAlert,
  CreditCard,
  Download,
  ExternalLink,
  FileText,
  HardDrive,
  Landmark,
  LoaderCircle,
  MessageSquareText,
  ReceiptText,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  WalletCards,
  Zap,
} from "lucide-react";
import { useParams, useSearchParams } from "react-router-dom";
import { toast } from "sonner";

import ConfirmDialog from "@/components/dialog/confirm-dialog";
import { Button } from "@/components/ui/button";
import Card from "@/components/ui/card";
import Container from "@/components/ui/container";
import { SectionTitle } from "@/components/ui/section";
import TabMenu from "@/components/ui/tab";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  useActivateFreeSubscriptionMutation,
  useCreateBillingPortalMutation,
  useCreateSubscriptionCheckoutMutation,
  useCurrentSubscriptionQuery,
  useSubscriptionPaymentsQuery,
  useUpdateSubscriptionCancellationMutation,
} from "@/features/subscription/subscriptionApiSlice";
import {
  formatCurrency,
  getApiList,
  getStripeClientSecret,
  getStripeSessionUrl,
  normalizePayment,
  normalizeSubscription,
} from "@/features/subscription/subscription-utils";
import { formatDate } from "@/lib/date-time";
import { getApiErrorMessage } from "@/lib/get-api-error-message";
import {
  initializeStripe,
  rememberStripeReturnPath,
  redirectToStripeSession,
} from "@/lib/stripe";
import { cn, formatStatus } from "@/lib/utils";

import PlanListDialog from "./components/plan-dialog";
import EmbeddedCheckoutDialog from "./components/embedded-checkout-dialog";

const CHECKOUT_SUCCESS_VALUES = new Set(["success", "complete", "completed"]);
const CHECKOUT_CANCEL_VALUES = new Set(["cancel", "cancelled", "canceled"]);

const humanizeFeature = (feature) =>
  String(feature || "")
    .replaceAll(/[_-]+/g, " ")
    .replace(/^\w/, (letter) => letter.toUpperCase())
    .replace(/\b(ai|api|crm|html)\b/gi, (word) => word.toUpperCase());

const subscriptionStatusStyles = {
  active: "bg-emerald-500/10 text-emerald-600",
  succeeded: "bg-emerald-500/10 text-emerald-600",
  trialing: "bg-sky-500/10 text-sky-600",
  processing: "bg-sky-500/10 text-sky-600",
  pending: "bg-amber-500/10 text-amber-600",
  requires_action: "bg-amber-500/10 text-amber-600",
  past_due: "bg-amber-500/10 text-amber-600",
  incomplete: "bg-amber-500/10 text-amber-600",
  unpaid: "bg-destructive/10 text-destructive",
  failed: "bg-destructive/10 text-destructive",
  refunded: "bg-violet-500/10 text-violet-600",
  partially_refunded: "bg-violet-500/10 text-violet-600",
  canceled: "bg-muted text-muted-foreground",
};

function SubscriptionStatus({ status }) {
  const normalizedStatus = String(status || "active").toLowerCase();

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-semibold",
        subscriptionStatusStyles[normalizedStatus] ||
          "bg-muted text-muted-foreground",
      )}
    >
      <span className="size-1.5 rounded-full bg-current" />
      {formatStatus(normalizedStatus)}
    </span>
  );
}

function BillingLoadingState() {
  return (
    <div className="grid gap-5 xl:grid-cols-[minmax(0,1.5fr)_minmax(300px,0.55fr)]">
      {[0, 1].map((item) => (
        <Card key={item} className="min-h-64 animate-pulse bg-muted/35" />
      ))}
    </div>
  );
}

function EntitlementItem({ icon, label, value, detail }) {
  const Icon = icon;
  return (
    <div className="rounded-2xl border bg-muted/15 p-4">
      <span className="flex size-8 items-center justify-center rounded-xl bg-primary/10 text-primary">
        <Icon className="size-4" />
      </span>
      <p className="mt-4 text-lg font-bold">{value}</p>
      <p className="mt-1 text-xs font-semibold">{label}</p>
      <p className="mt-1 text-[10px] leading-4 text-muted-foreground">
        {detail}
      </p>
    </div>
  );
}

function EmptySubscription({ onChoosePlan }) {
  return (
    <Card className="flex min-h-80 flex-col items-center justify-center text-center">
      <span className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
        <Sparkles className="size-5" />
      </span>
      <h2 className="mt-4 text-base font-bold">No active subscription</h2>
      <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">
        Choose a plan to activate chatbot entitlements. Free plans activate
        immediately, while paid plans continue through Stripe Checkout.
      </p>
      <Button className="mt-6" onClick={onChoosePlan}>
        <WalletCards />
        Choose a plan
      </Button>
    </Card>
  );
}

function SubscriptionError({ error, onRetry, onChoosePlan }) {
  return (
    <Card className="flex min-h-72 flex-col items-center justify-center text-center">
      <span className="flex size-11 items-center justify-center rounded-full bg-destructive/10 text-destructive">
        <CircleAlert className="size-5" />
      </span>
      <h2 className="mt-4 text-base font-bold">Unable to load subscription</h2>
      <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">
        {getApiErrorMessage(
          error,
          "The chatbot subscription could not be loaded.",
        )}
      </p>
      <div className="mt-5 flex gap-2">
        <Button variant="outline" onClick={onRetry}>
          <RefreshCw />
          Try again
        </Button>
        <Button onClick={onChoosePlan}>View plans</Button>
      </div>
    </Card>
  );
}

function PaymentHistory({ payments, isLoading, isError, error, onRetry }) {
  if (isLoading) {
    return (
      <Card className="flex min-h-64 items-center justify-center">
        <LoaderCircle className="size-6 animate-spin text-primary" />
      </Card>
    );
  }

  if (isError) {
    return (
      <Card className="flex min-h-64 flex-col items-center justify-center text-center">
        <CircleAlert className="size-6 text-destructive" />
        <p className="mt-3 text-sm font-semibold">
          Payment history could not be loaded
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          {getApiErrorMessage(error, "Please try again.")}
        </p>
        <Button className="mt-4" size="sm" variant="outline" onClick={onRetry}>
          Try again
        </Button>
      </Card>
    );
  }

  return (
    <Card className="p-0">
      <div className="border-b p-5">
        <h2 className="text-sm font-bold">Payment history</h2>
        <p className="mt-1 text-xs text-muted-foreground">
          Stripe invoices and payments recorded for this chatbot
        </p>
      </div>
      {payments.length ? (
        <Table>
          <TableHeader className="bg-muted/40">
            <TableRow className="hover:bg-transparent">
              <TableHead className="h-12 px-5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Reference
              </TableHead>
              <TableHead className="h-12 px-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Date
              </TableHead>
              <TableHead className="h-12 px-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Description
              </TableHead>
              <TableHead className="h-12 px-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Amount
              </TableHead>
              <TableHead className="h-12 px-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Status
              </TableHead>
              <TableHead className="h-12 px-5 text-right text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Receipt
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {payments.map((payment) => (
              <TableRow key={payment.id}>
                <TableCell className="max-w-52 truncate px-5 py-4 font-mono text-xs font-semibold">
                  {payment.id}
                </TableCell>
                <TableCell className="px-3 py-4 text-xs text-muted-foreground">
                  {formatDate(payment.date)}
                </TableCell>
                <TableCell className="max-w-64 truncate px-3 py-4 text-xs font-medium">
                  {payment.description}
                </TableCell>
                <TableCell className="px-3 py-4 text-xs font-semibold">
                  {formatCurrency(payment.amount, payment.currency)}
                </TableCell>
                <TableCell className="px-3 py-4">
                  <SubscriptionStatus status={payment.status} />
                </TableCell>
                <TableCell className="px-5 py-4 text-right">
                  {payment.receiptUrl ? (
                    <Button variant="ghost" size="icon-sm" asChild>
                      <a
                        href={payment.receiptUrl}
                        target="_blank"
                        rel="noreferrer"
                        aria-label={"Open receipt " + payment.id}
                      >
                        <Download />
                      </a>
                    </Button>
                  ) : (
                    <span className="text-xs text-muted-foreground">—</span>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <div className="flex min-h-64 flex-col items-center justify-center px-6 text-center">
          <ReceiptText className="size-7 text-muted-foreground" />
          <p className="mt-3 text-sm font-semibold">No payments recorded</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Completed Stripe invoices will appear here.
          </p>
        </div>
      )}
    </Card>
  );
}

const PlanAndBillingPage = () => {
  const { chatbotSlug } = useParams();
  const [searchParams] = useSearchParams();
  const checkoutMarker = String(
    searchParams.get("checkout") ||
      searchParams.get("checkout_status") ||
      "",
  ).toLowerCase();
  const returnedFromCheckout =
    CHECKOUT_SUCCESS_VALUES.has(checkoutMarker) ||
    searchParams.has("session_id") ||
    searchParams.has("checkout_session_id");
  const checkoutCancelled = CHECKOUT_CANCEL_VALUES.has(checkoutMarker);
  const [activeTab, setActiveTab] = useState("overview");
  const [planDialogOpen, setPlanDialogOpen] = useState(false);
  const [checkoutClientSecret, setCheckoutClientSecret] = useState(null);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [awaitingActivation, setAwaitingActivation] =
    useState(returnedFromCheckout);
  const cancellationToastShown = useRef(false);
  const activationToastShown = useRef(false);

  const {
    data: subscriptionResponse,
    isLoading: isSubscriptionLoading,
    isFetching: isSubscriptionFetching,
    isError: isSubscriptionError,
    error: subscriptionError,
    refetch: refetchSubscription,
  } = useCurrentSubscriptionQuery(
    { chatbotSlug },
    {
      skip: !chatbotSlug,
      pollingInterval: awaitingActivation ? 2000 : 0,
      refetchOnMountOrArgChange: true,
    },
  );
  const {
    data: paymentsResponse,
    isLoading: isPaymentsLoading,
    isFetching: isPaymentsFetching,
    isError: isPaymentsError,
    error: paymentsError,
    refetch: refetchPayments,
  } = useSubscriptionPaymentsQuery(
    { chatbotSlug },
    { skip: !chatbotSlug, refetchOnMountOrArgChange: true },
  );
  const [createCheckout, { isLoading: isCreatingCheckout }] =
    useCreateSubscriptionCheckoutMutation();
  const [activateFree, { isLoading: isActivatingFree }] =
    useActivateFreeSubscriptionMutation();
  const [createPortal, { isLoading: isCreatingPortal }] =
    useCreateBillingPortalMutation();
  const [updateCancellation, { isLoading: isUpdatingCancellation }] =
    useUpdateSubscriptionCancellationMutation();

  const subscription = useMemo(
    () => normalizeSubscription(subscriptionResponse),
    [subscriptionResponse],
  );
  const payments = useMemo(
    () => getApiList(paymentsResponse).map(normalizePayment),
    [paymentsResponse],
  );
  const subscriptionMissing = subscriptionError?.status === 404;
  const isPlanActionLoading = isCreatingCheckout || isActivatingFree;

  useEffect(() => {
    initializeStripe().catch(() => undefined);
  }, []);

  useEffect(() => {
    if (!checkoutCancelled || cancellationToastShown.current) return;
    cancellationToastShown.current = true;
    toast.info("Stripe Checkout was cancelled. No plan changes were made.");
  }, [checkoutCancelled]);

  useEffect(() => {
    if (!awaitingActivation) return undefined;

    const timeout = window.setTimeout(() => {
      setAwaitingActivation(false);
      refetchSubscription();
      refetchPayments();
    }, 12000);

    return () => window.clearTimeout(timeout);
  }, [awaitingActivation, refetchPayments, refetchSubscription]);

  useEffect(() => {
    if (!awaitingActivation || subscription?.status !== "active") {
      return undefined;
    }

    const timeout = window.setTimeout(() => {
      setAwaitingActivation(false);
      if (!activationToastShown.current) {
        activationToastShown.current = true;
        toast.success("Subscription activated successfully.");
      }
    }, 0);

    return () => window.clearTimeout(timeout);
  }, [awaitingActivation, subscription?.status]);

  const billingTabs = [
    { value: "overview", label: "Plan overview", icon: WalletCards },
    {
      value: "history",
      label: "Payment history",
      icon: ReceiptText,
      count: Number(paymentsResponse?.meta?.count ?? payments.length),
    },
  ];

  const handlePlanAction = async (plan) => {
    if (!chatbotSlug) return;

    if (plan.requiresSalesContact) {
      const salesUrl = plan.sales_contact_url || plan.salesContactUrl;
      if (salesUrl) {
        window.location.assign(salesUrl);
      } else {
        toast.info("Please contact sales to activate this plan.");
      }
      return;
    }

    try {
      if (plan.isFree) {
        const planPriceId = plan.selectedPrice?.id;
        if (!planPriceId) {
          throw new Error("This free plan does not have an activatable price.");
        }
        await activateFree({ chatbotSlug, planPriceId }).unwrap();
        setPlanDialogOpen(false);
        toast.success(plan.name + " has been activated.");
        return;
      }

      const planPriceId = plan.selectedPrice?.id;
      if (!planPriceId) {
        throw new Error("This billing option does not have a purchasable price.");
      }

      rememberStripeReturnPath(
        "/chatbot/" +
          encodeURIComponent(chatbotSlug) +
          "/plan-and-billing",
      );
      const response = await createCheckout({
        chatbotSlug,
        planPriceId,
      }).unwrap();
      const clientSecret = getStripeClientSecret(response);
      if (!clientSecret) {
        throw new Error(
          "The server did not return an Embedded Checkout client secret.",
        );
      }
      setPlanDialogOpen(false);
      setCheckoutClientSecret(clientSecret);
    } catch (error) {
      toast.error(
        getApiErrorMessage(
          error,
          error?.message || "Unable to start Stripe Checkout.",
        ),
      );
    }
  };

  const handleOpenPortal = async () => {
    try {
      rememberStripeReturnPath(
        "/chatbot/" +
          encodeURIComponent(chatbotSlug) +
          "/plan-and-billing",
      );
      const response = await createPortal({ chatbotSlug }).unwrap();
      await redirectToStripeSession(getStripeSessionUrl(response));
    } catch (error) {
      toast.error(
        getApiErrorMessage(
          error,
          error?.message || "Unable to open the Stripe billing portal.",
        ),
      );
    }
  };

  const handleEmbeddedCheckoutComplete = useCallback(() => {
    setCheckoutClientSecret(null);
    activationToastShown.current = false;
    setAwaitingActivation(true);
    refetchSubscription();
    refetchPayments();
    toast.info(
      "Payment submitted. Confirming the subscription with Stripe…",
    );
  }, [refetchPayments, refetchSubscription]);

  const handleCancellation = async () => {
    const cancelAtPeriodEnd = subscription.isFree
      ? true
      : !subscription.cancelAtPeriodEnd;

    try {
      await updateCancellation({
        chatbotSlug,
        cancelAtPeriodEnd,
      }).unwrap();
      setCancelDialogOpen(false);
      toast.success(
        subscription.isFree
          ? "Free subscription canceled."
          : cancelAtPeriodEnd
          ? "Cancellation scheduled for the end of the billing period."
          : "Scheduled cancellation removed.",
      );
    } catch (error) {
      toast.error(
        getApiErrorMessage(error, "Unable to update subscription cancellation."),
      );
    }
  };

  const plan = subscription?.plan;
  const features = (plan?.features || []).map(humanizeFeature);
  const renewalAmount = subscription?.amount || 0;
  const periodEndLabel = formatDate(subscription?.currentPeriodEnd);
  const checkoutPending = subscription?.status === "incomplete";
  const canManageStripe =
    subscription?.provider === "stripe" &&
    !checkoutPending &&
    !subscription?.isFree;
  const canUpdateCancellation = Boolean(subscription?.isFree || canManageStripe);

  return (
    <Container>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <SectionTitle
          icon={Landmark}
          title="Plan & Billing"
          details="Manage this chatbot's subscription, Stripe billing, and payment history."
          lg
        />
        <Button
          variant="outline"
          disabled={isSubscriptionFetching || isPaymentsFetching}
          onClick={() => {
            refetchSubscription();
            refetchPayments();
          }}
        >
          <RefreshCw
            className={cn(
              (isSubscriptionFetching || isPaymentsFetching) && "animate-spin",
            )}
          />
          Refresh
        </Button>
      </div>

      {awaitingActivation && (
        <div className="flex items-start gap-3 rounded-2xl border border-sky-500/20 bg-sky-500/[0.06] p-4">
          <LoaderCircle className="mt-0.5 size-5 shrink-0 animate-spin text-sky-600" />
          <div>
            <p className="text-sm font-semibold">
              Confirming your subscription
            </p>
            <p className="mt-1 text-xs leading-5 text-muted-foreground">
              Stripe Checkout has returned. This page is polling the current
              subscription while the signed webhook finishes activation.
            </p>
          </div>
        </div>
      )}

      <TabMenu
        tabs={billingTabs}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        className="sticky top-0 z-10 w-fit bg-background/95 backdrop-blur"
      />

      {activeTab === "overview" && (
        <>
          {isSubscriptionLoading ? (
            <BillingLoadingState />
          ) : isSubscriptionError && !subscriptionMissing ? (
            <SubscriptionError
              error={subscriptionError}
              onRetry={refetchSubscription}
              onChoosePlan={() => setPlanDialogOpen(true)}
            />
          ) : !subscription ? (
            <EmptySubscription onChoosePlan={() => setPlanDialogOpen(true)} />
          ) : (
            <>
              <div className="grid items-stretch gap-5 xl:grid-cols-[minmax(0,1.5fr)_minmax(300px,0.55fr)]">
                <Card className="relative overflow-hidden p-0">
                  <div className="absolute -right-20 -top-24 size-72 rounded-full bg-primary/10 blur-3xl" />
                  <div className="relative flex h-full flex-col p-6 sm:p-7">
                    <div className="flex flex-wrap items-start justify-between gap-5">
                      <div>
                        <div className="flex items-center gap-3">
                          <span
                            className={cn(
                              "flex size-10 items-center justify-center rounded-2xl text-white",
                              subscription.isFree
                                ? "bg-slate-500"
                                : "bg-primary",
                            )}
                          >
                            {subscription.isFree ? (
                              <Sparkles className="size-5" />
                            ) : (
                              <Zap className="size-5" />
                            )}
                          </span>
                          <div>
                            <p className="text-xs text-muted-foreground">
                              Current plan
                            </p>
                            <div className="mt-0.5 flex flex-wrap items-center gap-2">
                              <h2 className="text-xl font-bold">{plan.name}</h2>
                              <SubscriptionStatus status={subscription.status} />
                            </div>
                          </div>
                        </div>
                        <p className="mt-4 max-w-lg text-sm leading-6 text-muted-foreground">
                          Entitlements are stored in this chatbot's immutable
                          subscription snapshot.
                        </p>
                      </div>
                      <div className="text-left sm:text-right">
                        <p>
                          <span className="text-4xl font-bold">
                            {subscription.isFree
                              ? "Free"
                              : formatCurrency(
                                  subscription.amount,
                                  subscription.currency,
                                  0,
                                )}
                          </span>
                          {!subscription.isFree && (
                            <span className="text-sm text-muted-foreground">
                              {" "}/ {subscription.billingInterval === "annual" ? "year" : "month"}
                            </span>
                          )}
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {subscription.isFree
                            ? "No Stripe payment required"
                            : subscription.billingInterval === "annual"
                              ? "Billed annually"
                              : "Billed monthly"}
                        </p>
                      </div>
                    </div>

                    {subscription.cancelAtPeriodEnd && (
                      <div className="mt-5 flex items-start gap-2 rounded-2xl border border-amber-500/20 bg-amber-500/[0.06] p-3 text-xs">
                        <CircleAlert className="mt-0.5 size-4 shrink-0 text-amber-600" />
                        <span>
                          Cancellation is scheduled. Access remains available
                          through {periodEndLabel}.
                        </span>
                      </div>
                    )}

                    <div className="mt-auto flex flex-wrap items-center justify-between gap-4 border-t pt-6">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <ShieldCheck className="size-4 text-emerald-600" />
                        Prices and entitlements are controlled by the server
                      </div>
                      {canManageStripe ? (
                        <Button
                          variant="outline"
                          disabled={isCreatingPortal}
                          onClick={handleOpenPortal}
                        >
                          {isCreatingPortal ? (
                            <LoaderCircle className="animate-spin" />
                          ) : (
                            <ExternalLink />
                          )}
                          Manage billing
                        </Button>
                      ) : (
                        <Button
                          variant="outline"
                          onClick={() => setPlanDialogOpen(true)}
                        >
                          {checkoutPending
                            ? "Continue checkout"
                            : "Compare plans"}
                          <ChevronRight />
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>

                <Card className="p-0">
                  <div className="border-b p-5">
                    <div className="flex items-center gap-3">
                      <span className="flex size-9 items-center justify-center rounded-xl bg-violet-500/10 text-violet-600">
                        <CalendarDays className="size-4" />
                      </span>
                      <div>
                        <h2 className="text-sm font-bold">
                          {subscription.cancelAtPeriodEnd
                            ? "Access ends"
                            : checkoutPending
                              ? "Checkout pending"
                              : "Next renewal"}
                        </h2>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          Current billing period
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="p-5">
                    {checkoutPending ? (
                      <div className="flex min-h-36 flex-col items-center justify-center text-center">
                        <CreditCard className="size-6 text-muted-foreground" />
                        <p className="mt-3 text-sm font-semibold">
                          Payment not completed
                        </p>
                        <p className="mt-1 max-w-56 text-xs leading-5 text-muted-foreground">
                          Reopen the plan chooser to continue the existing
                          Stripe Checkout Session.
                        </p>
                        <Button
                          className="mt-4"
                          size="sm"
                          onClick={() => setPlanDialogOpen(true)}
                        >
                          Continue checkout
                        </Button>
                      </div>
                    ) : subscription.isFree ? (
                      <div className="flex min-h-36 flex-col items-center justify-center text-center">
                        <CalendarDays className="size-6 text-muted-foreground" />
                        <p className="mt-3 text-sm font-semibold">
                          No upcoming payment
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          Free plans do not renew through Stripe.
                        </p>
                      </div>
                    ) : (
                      <>
                        <p className="text-2xl font-bold">{periodEndLabel}</p>
                        <p className="mt-1 text-xs leading-5 text-muted-foreground">
                          {subscription.cancelAtPeriodEnd
                            ? "The chatbot keeps its current entitlements until this date."
                            : formatCurrency(
                                renewalAmount,
                                subscription.currency,
                              ) + " is scheduled for renewal."}
                        </p>
                        <div className="mt-5 rounded-2xl bg-muted/40 p-4">
                          <div className="flex justify-between gap-4 text-xs">
                            <span className="text-muted-foreground">
                              Billing interval
                            </span>
                            <span className="font-semibold capitalize">
                              {subscription.billingInterval || "Recurring"}
                            </span>
                          </div>
                          <div className="mt-2 flex justify-between gap-4 text-xs">
                            <span className="text-muted-foreground">
                              Taxes
                            </span>
                            <span className="font-semibold">
                              Calculated by Stripe
                            </span>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </Card>
              </div>

              <Card className="p-0">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b px-6 py-5">
                  <div>
                    <h2 className="text-sm font-bold">Plan entitlements</h2>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Limits enforced from the active subscription snapshot
                    </p>
                  </div>
                  <span className="rounded-full bg-muted px-3 py-1 text-xs font-semibold">
                    {plan.name} limits
                  </span>
                </div>
                <div className="grid gap-4 p-5 sm:grid-cols-2 xl:grid-cols-4">
                  <EntitlementItem
                    icon={MessageSquareText}
                    label="AI messages"
                    value={plan.limits.messages.toLocaleString()}
                    detail="Messages included in the subscription period"
                  />
                  <EntitlementItem
                    icon={FileText}
                    label="Knowledge chunks"
                    value={plan.limits.chunks.toLocaleString()}
                    detail="Maximum trained knowledge chunks"
                  />
                  <EntitlementItem
                    icon={HardDrive}
                    label="File size limit"
                    value={plan.limits.fileSize.toLocaleString() + " MB"}
                    detail="Maximum size for each knowledge upload"
                  />
                  <EntitlementItem
                    icon={Sparkles}
                    label="Enabled features"
                    value={features.length.toLocaleString()}
                    detail={
                      features.length
                        ? features.join(" · ")
                        : "Core plan capabilities"
                    }
                  />
                </div>
              </Card>

              <div className="grid items-start gap-5 xl:grid-cols-2">
                <Card className="p-0">
                  <div className="border-b p-5">
                    <div className="flex items-center gap-3">
                      <span className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                        <CreditCard className="size-4" />
                      </span>
                      <div>
                        <h2 className="text-sm font-bold">
                          Stripe billing portal
                        </h2>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          Payment methods, invoices, and billing details
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="p-5">
                    <p className="text-sm leading-6 text-muted-foreground">
                      Stripe securely manages card details. Argon never
                      collects or stores full payment card information.
                    </p>
                    {subscription.customerEmail && (
                      <p className="mt-3 text-xs">
                        Billing account:{" "}
                        <span className="font-semibold">
                          {subscription.customerEmail}
                        </span>
                      </p>
                    )}
                    <Button
                      className="mt-5"
                      variant="outline"
                      disabled={!canManageStripe || isCreatingPortal}
                      onClick={handleOpenPortal}
                    >
                      {isCreatingPortal ? (
                        <LoaderCircle className="animate-spin" />
                      ) : (
                        <ExternalLink />
                      )}
                      Manage billing in Stripe
                    </Button>
                    {!canManageStripe && (
                      <p className="mt-2 text-[10px] text-muted-foreground">
                        The billing portal becomes available after Stripe
                        confirms the paid subscription.
                      </p>
                    )}
                  </div>
                </Card>

                <Card className="p-0">
                  <div className="border-b p-5">
                    <div className="flex items-center gap-3">
                      <span className="flex size-9 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600">
                        <CircleAlert className="size-4" />
                      </span>
                      <div>
                        <h2 className="text-sm font-bold">
                          Subscription controls
                        </h2>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          End-of-period cancellation
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="p-5">
                    <p className="text-sm leading-6 text-muted-foreground">
                      {subscription.isFree
                        ? "Canceling a free subscription removes its chatbot entitlements immediately. You can activate a plan again later."
                        : subscription.cancelAtPeriodEnd
                        ? "This subscription is scheduled to cancel at the end of its current period. You can resume it before then."
                        : "Cancellation is scheduled for the end of the current period, so access is not removed immediately."}
                    </p>
                    <Button
                      className={cn(
                        "mt-5",
                        !subscription.cancelAtPeriodEnd && "text-destructive",
                      )}
                      variant="outline"
                      disabled={!canUpdateCancellation}
                      onClick={() => setCancelDialogOpen(true)}
                    >
                      {subscription.isFree
                        ? "Cancel free plan"
                        : subscription.cancelAtPeriodEnd
                        ? "Resume subscription"
                        : "Cancel at period end"}
                    </Button>
                  </div>
                </Card>
              </div>
            </>
          )}
        </>
      )}

      {activeTab === "history" && (
        <PaymentHistory
          payments={payments}
          isLoading={isPaymentsLoading || isPaymentsFetching}
          isError={isPaymentsError}
          error={paymentsError}
          onRetry={refetchPayments}
        />
      )}

      <PlanListDialog
        key={
          String(planDialogOpen) +
          "-" +
          String(plan?.id || plan?.slug || "none")
        }
        open={planDialogOpen}
        onClose={() => setPlanDialogOpen(false)}
        currentPlan={plan || {}}
        onUpgrade={handlePlanAction}
        isSubmitting={isPlanActionLoading}
        allowCurrentPlanSelection={checkoutPending}
      />

      <EmbeddedCheckoutDialog
        key={checkoutClientSecret || "embedded-checkout"}
        open={Boolean(checkoutClientSecret)}
        clientSecret={checkoutClientSecret}
        onClose={() => setCheckoutClientSecret(null)}
        onComplete={handleEmbeddedCheckoutComplete}
      />

      {subscription && canUpdateCancellation && (
        <ConfirmDialog
          open={cancelDialogOpen}
          setOpen={setCancelDialogOpen}
          title={
            subscription.isFree
              ? "Cancel free subscription?"
              : subscription.cancelAtPeriodEnd
              ? "Resume subscription?"
              : "Cancel subscription?"
          }
          description={
            subscription.isFree
              ? "This immediately removes the free plan entitlements from the chatbot."
              : subscription.cancelAtPeriodEnd
              ? "Renewal will resume and the subscription will remain active."
              : "Cancellation will be scheduled for " +
                periodEndLabel +
                ". The chatbot keeps its current entitlements until then."
          }
          confirmText={
            subscription.isFree
              ? "Cancel free plan"
              : subscription.cancelAtPeriodEnd
              ? "Resume subscription"
              : "Schedule cancellation"
          }
          confirmVariant={
            subscription.cancelAtPeriodEnd ? "default" : "destructive"
          }
          onConfirm={handleCancellation}
          isLoading={isUpdatingCancellation}
        >
          <div className="flex items-start gap-3 rounded-xl bg-muted/50 p-3 text-xs text-muted-foreground">
            <Check className="mt-0.5 size-4 shrink-0 text-emerald-600" />
            {subscription.isFree
              ? "Free plan entitlements are removed immediately."
              : "No immediate entitlement changes will be made."}
          </div>
        </ConfirmDialog>
      )}
    </Container>
  );
};

export default PlanAndBillingPage;
