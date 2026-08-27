import { useMemo } from "react";
import {
  EmbeddedCheckout,
  EmbeddedCheckoutProvider,
} from "@stripe/react-stripe-js";
import { CreditCard } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { initializeStripe, isStripeConfigured } from "@/lib/stripe";

const stripePromise = initializeStripe();

const EmbeddedCheckoutDialog = ({
  open,
  clientSecret,
  onClose,
  onComplete,
}) => {
  const options = useMemo(
    () => ({ clientSecret, onComplete }),
    [clientSecret, onComplete],
  );

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent className="custom-scrollbar max-h-[94vh] overflow-y-auto rounded-3xl p-0 sm:max-w-4xl">
        <DialogHeader className="border-b bg-muted/25 px-6 py-5 sm:px-8">
          <span className="mb-1 flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <CreditCard className="size-4" />
          </span>
          <DialogTitle>Complete your subscription</DialogTitle>
          <DialogDescription>
            Payment is securely handled by Stripe without leaving Argon.
          </DialogDescription>
        </DialogHeader>

        <div className="min-h-[32rem] bg-white px-2 py-5 sm:px-6">
          {!isStripeConfigured ? (
            <div className="flex min-h-[28rem] flex-col items-center justify-center px-6 text-center">
              <CreditCard className="size-7 text-muted-foreground" />
              <p className="mt-4 text-sm font-semibold">
                Stripe is not configured
              </p>
              <p className="mt-1 max-w-md text-xs leading-5 text-muted-foreground">
                Add VITE_STRIPE_PUBLISHABLE_KEY to the client environment and
                restart the application.
              </p>
            </div>
          ) : clientSecret ? (
            <EmbeddedCheckoutProvider stripe={stripePromise} options={options}>
              <EmbeddedCheckout className="mx-auto" />
            </EmbeddedCheckoutProvider>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EmbeddedCheckoutDialog;
