import { useMemo, useState } from "react";
import {
  ArrowLeft,
  Bot,
  CalendarDays,
  Check,
  ChevronRight,
  CircleAlert,
  Copy,
  CreditCard,
  Download,
  FileText,
  HardDrive,
  Mail,
  MessageSquareText,
  Plus,
  ReceiptText,
  ShieldCheck,
  Sparkles,
  UsersRound,
  WalletCards,
  Zap,
} from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import Card from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FloatingInput } from "@/components/ui/input";
import {
  FloatingSelect,
  SelectItem,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import TabMenu from "@/components/ui/tab";
import { cn } from "@/lib/utils";

const plans = [
  {
    id: "free",
    name: "Free",
    monthlyPrice: 0,
    description: "Explore Argon with one chatbot.",
    color: "bg-slate-500",
    limits: { messages: 1000, chunks: 500, storage: 10, seats: 1 },
    features: ["1 chatbot", "1,000 AI messages", "500 knowledge chunks", "Website widget"],
  },
  {
    id: "starter",
    name: "Starter",
    monthlyPrice: 19,
    description: "For small teams getting started with AI support.",
    color: "bg-sky-500",
    limits: { messages: 5000, chunks: 1500, storage: 25, seats: 3 },
    features: ["2 chatbots", "5,000 AI messages", "Lead collection", "3 team seats"],
  },
  {
    id: "growth",
    name: "Growth",
    monthlyPrice: 49,
    description: "For growing support and sales teams.",
    color: "bg-primary",
    popular: true,
    limits: { messages: 20000, chunks: 5000, storage: 100, seats: 8 },
    features: ["5 chatbots", "20,000 AI messages", "All channels", "Appointments & CRM sync"],
  },
  {
    id: "business",
    name: "Business",
    monthlyPrice: 99,
    description: "Advanced controls for established organizations.",
    color: "bg-violet-600",
    limits: { messages: 75000, chunks: 20000, storage: 500, seats: 25 },
    features: ["Unlimited chatbots", "75,000 AI messages", "Priority support", "Advanced permissions"],
  },
];

const usageValues = {
  messages: 742,
  chunks: 410,
  storage: 7.8,
  seats: 1,
};

const invoices = [
  { id: "INV-2026-008", date: "Aug 20, 2026", plan: "Free plan", amount: "$0.00", status: "Paid" },
  { id: "INV-2026-007", date: "Jul 20, 2026", plan: "Free plan", amount: "$0.00", status: "Paid" },
  { id: "INV-2026-006", date: "Jun 20, 2026", plan: "Free plan", amount: "$0.00", status: "Paid" },
];

const billingTabs = [
  { value: "overview", label: "Plan overview", icon: WalletCards },
  { value: "history", label: "Billing history", icon: ReceiptText, count: invoices.length },
];

function UsageItem({ icon, label, value, limit, unit = "", warningAt = 80 }) {
  const UsageIcon = icon;
  const percent = Math.min(100, Math.round((value / limit) * 100));
  const warning = percent >= warningAt;
  const displayValue = Number.isInteger(value) ? value.toLocaleString() : value;
  const displayLimit = Number.isInteger(limit) ? limit.toLocaleString() : limit;

  return (
    <div className="rounded-2xl border bg-muted/15 p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className={cn("flex size-8 items-center justify-center rounded-xl", warning ? "bg-amber-500/10 text-amber-600" : "bg-primary/10 text-primary")}><UsageIcon className="size-4" /></span>
          <div><p className="text-xs font-semibold">{label}</p><p className="mt-0.5 text-[11px] text-muted-foreground">{displayValue}{unit} of {displayLimit}{unit}</p></div>
        </div>
        <span className={cn("text-xs font-bold", warning ? "text-amber-600" : "text-foreground")}>{percent}%</span>
      </div>
      <div className="mt-4 h-2 overflow-hidden rounded-full bg-muted"><div className={cn("h-full rounded-full transition-all", warning ? "bg-amber-500" : "bg-primary")} style={{ width: `${percent}%` }} /></div>
      {warning && <p className="mt-2 flex items-center gap-1 text-[10px] font-medium text-amber-600"><CircleAlert className="size-3" />Approaching your plan limit</p>}
    </div>
  );
}

function UpgradeDialog({ open, onClose, currentPlan, onUpgrade, paymentMethod }) {
  const [billingCycle, setBillingCycle] = useState("annual");
  const [selectedPlan, setSelectedPlan] = useState(currentPlan.id === "free" ? "growth" : currentPlan.id);
  const selected = plans.find((plan) => plan.id === selectedPlan);
  const monthlyEquivalent = billingCycle === "annual" ? Math.round(selected.monthlyPrice * 0.8) : selected.monthlyPrice;
  const chargedNow = billingCycle === "annual" ? selected.monthlyPrice * 12 * 0.8 : selected.monthlyPrice;

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent className="custom-scrollbar max-h-[94vh] overflow-y-auto rounded-3xl p-0 sm:max-w-5xl">
        <DialogHeader className="border-b bg-muted/25 px-6 py-6 sm:px-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between sm:pr-10">
            <div><DialogTitle className="text-xl">Choose the plan that fits your team</DialogTitle><DialogDescription className="mt-2">Upgrade instantly. Your new limits are available as soon as payment succeeds.</DialogDescription></div>
            <div className="flex rounded-full border bg-background p-1">
              <button onClick={() => setBillingCycle("monthly")} className={cn("rounded-full px-3 py-1.5 text-xs font-semibold transition", billingCycle === "monthly" && "bg-foreground text-background")}>Monthly</button>
              <button onClick={() => setBillingCycle("annual")} className={cn("rounded-full px-3 py-1.5 text-xs font-semibold transition", billingCycle === "annual" && "bg-foreground text-background")}>Annual <span className="ml-1 text-emerald-500">Save 20%</span></button>
            </div>
          </div>
        </DialogHeader>
        <div className="grid gap-4 px-6 py-6 md:grid-cols-2 xl:grid-cols-4 sm:px-8">
          {plans.map((plan) => {
            const isSelected = plan.id === selectedPlan;
            const isCurrent = plan.id === currentPlan.id;
            const price = billingCycle === "annual" ? Math.round(plan.monthlyPrice * 0.8) : plan.monthlyPrice;
            return (
              <button key={plan.id} type="button" disabled={isCurrent} onClick={() => setSelectedPlan(plan.id)} className={cn("relative flex min-h-80 flex-col rounded-3xl border p-5 text-left transition", isSelected ? "border-primary bg-primary/[0.04] ring-4 ring-primary/10" : "hover:border-primary/40", isCurrent && "cursor-default bg-muted/30 opacity-65")}>
                {plan.popular && <span className="absolute right-4 top-4 rounded-full bg-primary px-2 py-1 text-[9px] font-bold uppercase text-primary-foreground">Popular</span>}
                <span className={cn("flex size-9 items-center justify-center rounded-xl text-white", plan.color)}>{plan.id === "free" ? <Sparkles className="size-4" /> : <Zap className="size-4" />}</span>
                <div className="mt-4 flex items-center gap-2"><h3 className="font-bold">{plan.name}</h3>{isCurrent && <span className="rounded-full bg-muted px-2 py-0.5 text-[9px] font-semibold">Current</span>}</div>
                <p className="mt-2 min-h-10 text-xs leading-5 text-muted-foreground">{plan.description}</p>
                <div className="mt-4"><span className="text-3xl font-bold">${price}</span><span className="text-xs text-muted-foreground"> / month</span>{billingCycle === "annual" && plan.monthlyPrice > 0 && <p className="mt-1 text-[10px] text-muted-foreground">Billed annually</p>}</div>
                <div className="mt-5 space-y-2.5">{plan.features.map((feature) => <div key={feature} className="flex gap-2 text-xs"><Check className="mt-0.5 size-3.5 shrink-0 text-emerald-500" /><span>{feature}</span></div>)}</div>
                {isSelected && <span className="mt-auto pt-5 text-center text-xs font-bold text-primary">Selected plan</span>}
              </button>
            );
          })}
        </div>
        <DialogFooter className="items-center justify-between gap-4 border-t bg-muted/20 px-6 py-4 sm:px-8">
          <div className="text-left"><p className="text-xs font-semibold">{paymentMethod ? `Visa ending in ${paymentMethod.last4}` : "No payment method selected"}</p><p className="mt-0.5 text-[10px] text-muted-foreground">{selected.monthlyPrice ? `$${chargedNow.toFixed(2)} charged today · $${monthlyEquivalent}/month equivalent` : "No charge for the Free plan"}</p></div>
          <div className="flex gap-2"><Button variant="outline" onClick={onClose}>Cancel</Button><Button disabled={selectedPlan === currentPlan.id} onClick={() => onUpgrade(selected, billingCycle)}><Zap />Upgrade to {selected.name}</Button></div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function AddCardDialog({ open, onClose, onAdd }) {
  const [form, setForm] = useState({ name: "", number: "", expiry: "", cvc: "", country: "Bangladesh" });
  const update = (key, value) => setForm((current) => ({ ...current, [key]: value }));
  const save = (event) => {
    event.preventDefault();
    const digits = form.number.replaceAll(/\D/g, "");
    if (digits.length < 12) { toast.error("Enter a valid card number"); return; }
    onAdd({ id: `card-${Date.now()}`, brand: digits.startsWith("5") ? "Mastercard" : "Visa", last4: digits.slice(-4), expiry: form.expiry || "12/29", primary: true });
    onClose();
  };
  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent className="rounded-3xl p-0 sm:max-w-xl">
        <form onSubmit={save}>
          <DialogHeader className="border-b bg-muted/30 px-6 py-6"><span className="mb-2 flex size-11 items-center justify-center rounded-2xl bg-primary/10 text-primary"><CreditCard className="size-5" /></span><DialogTitle>Add payment method</DialogTitle><DialogDescription>Your card details are encrypted and securely processed.</DialogDescription></DialogHeader>
          <div className="space-y-5 px-6 py-6">
            <FloatingInput name="cardholder" label="Name on card" value={form.name} onChange={(event) => update("name", event.target.value)} />
            <FloatingInput name="card-number" label="Card number" value={form.number} onChange={(event) => update("number", event.target.value)} placeholder="1234 1234 1234 1234" inputMode="numeric" />
            <div className="grid grid-cols-2 gap-4"><FloatingInput name="expiry" label="Expiry date" value={form.expiry} onChange={(event) => update("expiry", event.target.value)} placeholder="MM/YY" /><FloatingInput name="cvc" label="Security code" value={form.cvc} onChange={(event) => update("cvc", event.target.value)} placeholder="CVC" inputMode="numeric" /></div>
            <FloatingSelect label="Billing country" value={form.country} displayValue={form.country} onValueChange={(value) => update("country", value)}>{["Bangladesh", "United States", "United Kingdom", "Canada", "Singapore"].map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}</FloatingSelect>
            <div className="flex items-start gap-3 rounded-2xl bg-muted/40 p-4"><ShieldCheck className="mt-0.5 size-4 shrink-0 text-emerald-600" /><p className="text-xs leading-5 text-muted-foreground">Argon never stores full card details. Your payment information is handled by our PCI-compliant payment provider.</p></div>
          </div>
          <DialogFooter className="border-t bg-muted/20 px-6 py-4"><Button type="button" variant="outline" onClick={onClose}>Cancel</Button><Button type="submit"><Plus />Add card</Button></DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function PaymentCard({ card, onMakePrimary, onRemove }) {
  return (
    <div className="flex flex-wrap items-center gap-4 rounded-2xl border p-4">
      <span className={cn("flex h-10 w-14 items-center justify-center rounded-xl text-xs font-black italic text-white", card.brand === "Visa" ? "bg-blue-700" : "bg-gradient-to-br from-red-500 to-orange-400")}>{card.brand === "Visa" ? "VISA" : "MC"}</span>
      <div className="min-w-0 flex-1"><div className="flex items-center gap-2"><p className="text-sm font-semibold">{card.brand} •••• {card.last4}</p>{card.primary && <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[9px] font-semibold text-primary">Default</span>}</div><p className="mt-1 text-xs text-muted-foreground">Expires {card.expiry}</p></div>
      <div className="flex gap-1">{!card.primary && <Button size="sm" variant="ghost" onClick={onMakePrimary}>Make default</Button>}<Button size="sm" variant="ghost" className="text-destructive" onClick={onRemove}>Remove</Button></div>
    </div>
  );
}

const PlanAndBillingPage = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [currentPlan, setCurrentPlan] = useState(plans[0]);
  const [billingCycle, setBillingCycle] = useState("monthly");
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const [addCardOpen, setAddCardOpen] = useState(false);
  const [cards, setCards] = useState([{ id: "card-1", brand: "Visa", last4: "4242", expiry: "09/29", primary: true }]);
  const primaryCard = cards.find((card) => card.primary) || cards[0];
  const paid = currentPlan.monthlyPrice > 0;
  const renewalAmount = billingCycle === "annual" ? currentPlan.monthlyPrice * 12 * 0.8 : currentPlan.monthlyPrice;
  const usage = useMemo(() => currentPlan.limits, [currentPlan]);

  const upgrade = (plan, cycle) => {
    if (plan.monthlyPrice > 0 && !primaryCard) { setUpgradeOpen(false); setAddCardOpen(true); toast.error("Add a payment method before upgrading"); return; }
    setCurrentPlan(plan); setBillingCycle(cycle); setUpgradeOpen(false); toast.success(`You’re now on the ${plan.name} plan`);
  };
  const addCard = (card) => { setCards((current) => [...current.map((item) => ({ ...item, primary: false })), card]); toast.success("Payment method added"); };
  const makePrimary = (id) => { setCards((current) => current.map((card) => ({ ...card, primary: card.id === id }))); toast.success("Default payment method updated"); };
  const removeCard = (id) => { setCards((current) => { const next = current.filter((card) => card.id !== id); if (next.length && !next.some((card) => card.primary)) next[0] = { ...next[0], primary: true }; return next; }); toast.success("Payment method removed"); };

  return (
    <section className="mx-auto max-w-7xl space-y-6 pb-8">
      <header className="flex flex-col gap-5 pr-14 xl:flex-row xl:items-end xl:justify-between">
        <div><Link to="/" className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition hover:text-primary"><ArrowLeft className="size-4" />Back to workspace</Link><div className="flex items-center gap-4"><div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/20"><WalletCards className="size-7" /></div><div><h1 className="text-2xl font-bold tracking-tight md:text-3xl">Plan & billing</h1><p className="mt-1 text-sm text-muted-foreground">Manage your plan, usage, payment methods, and invoices.</p></div></div></div>
        <Button onClick={() => setUpgradeOpen(true)}><Zap />Upgrade plan</Button>
      </header>

      <TabMenu
        tabs={billingTabs}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        className="sticky top-0 z-10 bg-background/95 backdrop-blur"
      />

      {activeTab === "overview" && (
        <>

      <div className="grid items-stretch gap-5 xl:grid-cols-[minmax(0,1.5fr)_minmax(300px,0.55fr)]">
        <Card className="relative overflow-hidden p-0">
          <div className="absolute -right-20 -top-24 size-72 rounded-full bg-primary/10 blur-3xl" />
          <div className="relative flex h-full flex-col p-6 sm:p-7">
            <div className="flex flex-wrap items-start justify-between gap-5"><div><div className="flex items-center gap-2"><span className={cn("flex size-10 items-center justify-center rounded-2xl text-white", currentPlan.color)}>{currentPlan.id === "free" ? <Sparkles className="size-5" /> : <Zap className="size-5" />}</span><div><p className="text-xs text-muted-foreground">Current plan</p><div className="flex items-center gap-2"><h2 className="text-xl font-bold">{currentPlan.name}</h2><span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-600">Active</span></div></div></div><p className="mt-4 max-w-lg text-sm leading-6 text-muted-foreground">{currentPlan.description}</p></div><div className="text-right"><p><span className="text-4xl font-bold">${billingCycle === "annual" ? Math.round(currentPlan.monthlyPrice * 0.8) : currentPlan.monthlyPrice}</span><span className="text-sm text-muted-foreground"> / month</span></p><p className="mt-1 text-xs text-muted-foreground">{paid ? billingCycle === "annual" ? "Billed annually" : "Billed monthly" : "Free forever"}</p></div></div>
            <div className="mt-auto flex flex-wrap items-center justify-between gap-4 border-t pt-6"><div className="flex items-center gap-2 text-xs text-muted-foreground"><ShieldCheck className="size-4 text-emerald-600" />No contracts · Cancel anytime</div><Button variant="outline" onClick={() => setUpgradeOpen(true)}>Compare plans <ChevronRight /></Button></div>
          </div>
        </Card>
        <Card className="p-0">
          <div className="border-b p-5"><div className="flex items-center gap-3"><span className="flex size-9 items-center justify-center rounded-xl bg-violet-500/10 text-violet-600"><CalendarDays className="size-4" /></span><div><h2 className="text-sm font-bold">Next payment</h2><p className="mt-0.5 text-xs text-muted-foreground">Billing schedule</p></div></div></div>
          <div className="p-5">{paid ? <><p className="text-2xl font-bold">Sep 20, 2026</p><p className="mt-1 text-xs text-muted-foreground">${renewalAmount.toFixed(2)} will be charged to Visa •••• {primaryCard?.last4}</p><div className="mt-5 rounded-2xl bg-muted/40 p-4"><div className="flex justify-between text-xs"><span className="text-muted-foreground">{currentPlan.name} plan</span><span className="font-semibold">${renewalAmount.toFixed(2)}</span></div><div className="mt-2 flex justify-between text-xs"><span className="text-muted-foreground">Tax</span><span className="font-semibold">Calculated at payment</span></div></div></> : <div className="flex min-h-36 flex-col items-center justify-center text-center"><span className="flex size-11 items-center justify-center rounded-full bg-muted"><CalendarDays className="size-5 text-muted-foreground" /></span><p className="mt-3 text-sm font-semibold">No upcoming payment</p><p className="mt-1 max-w-52 text-xs leading-5 text-muted-foreground">The Free plan has no renewal charge or expiration date.</p></div>}</div>
        </Card>
      </div>

      <Card className="p-0">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b px-6 py-5"><div><h2 className="text-sm font-bold">Plan usage</h2><p className="mt-1 text-xs text-muted-foreground">Usage resets on Sep 20, 2026</p></div><span className="rounded-full bg-muted px-3 py-1 text-xs font-semibold">{currentPlan.name} limits</span></div>
        <div className="grid gap-4 p-5 sm:grid-cols-2 xl:grid-cols-4"><UsageItem icon={MessageSquareText} label="AI messages" value={usageValues.messages} limit={usage.messages} /><UsageItem icon={FileText} label="Knowledge chunks" value={usageValues.chunks} limit={usage.chunks} /><UsageItem icon={HardDrive} label="Storage" value={usageValues.storage} limit={usage.storage} unit=" MB" /><UsageItem icon={UsersRound} label="Team seats" value={usageValues.seats} limit={usage.seats} /></div>
        {currentPlan.id === "free" && <div className="mx-5 mb-5 flex flex-col gap-4 rounded-2xl border border-amber-500/20 bg-amber-500/[0.05] p-4 sm:flex-row sm:items-center sm:justify-between"><div className="flex gap-3"><CircleAlert className="mt-0.5 size-5 shrink-0 text-amber-600" /><div><p className="text-sm font-semibold">You’re close to multiple Free plan limits</p><p className="mt-1 text-xs text-muted-foreground">Upgrade to keep Atlas responding and add more teammates and knowledge.</p></div></div><Button size="sm" onClick={() => setUpgradeOpen(true)}>View upgrade options</Button></div>}
      </Card>

      <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(340px,0.65fr)]">
        <Card className="p-0">
          <div className="flex items-center justify-between gap-4 border-b p-5"><div className="flex items-center gap-3"><span className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary"><CreditCard className="size-4" /></span><div><h2 className="text-sm font-bold">Payment methods</h2><p className="mt-0.5 text-xs text-muted-foreground">Cards used for plan renewals</p></div></div><Button size="sm" variant="outline" onClick={() => setAddCardOpen(true)}><Plus />Add card</Button></div>
          <div className="space-y-3 p-5">{cards.length ? cards.map((card) => <PaymentCard key={card.id} card={card} onMakePrimary={() => makePrimary(card.id)} onRemove={() => removeCard(card.id)} />) : <div className="flex min-h-36 flex-col items-center justify-center rounded-2xl border border-dashed text-center"><CreditCard className="size-6 text-muted-foreground" /><p className="mt-2 text-sm font-semibold">No payment methods</p><button onClick={() => setAddCardOpen(true)} className="mt-1 text-xs font-semibold text-primary">Add your first card</button></div>}</div>
        </Card>
        <Card className="p-0"><div className="border-b p-5"><div className="flex items-center gap-3"><span className="flex size-9 items-center justify-center rounded-xl bg-violet-500/10 text-violet-600"><ReceiptText className="size-4" /></span><div><h2 className="text-sm font-bold">Billing details</h2><p className="mt-0.5 text-xs text-muted-foreground">Invoice recipient and address</p></div></div></div><div className="divide-y p-5"><div className="flex gap-3 py-3"><Mail className="mt-0.5 size-4 text-muted-foreground" /><div><p className="text-[10px] uppercase tracking-wide text-muted-foreground">Billing email</p><p className="mt-1 text-xs font-semibold">billing@atlas.co</p></div></div><div className="flex gap-3 py-3"><ReceiptText className="mt-0.5 size-4 text-muted-foreground" /><div><p className="text-[10px] uppercase tracking-wide text-muted-foreground">Billing entity</p><p className="mt-1 text-xs font-semibold">Atlas Support Ltd.</p><p className="mt-1 text-[11px] text-muted-foreground">Dhaka, Bangladesh</p></div></div></div><button className="flex w-full items-center justify-between border-t px-5 py-3 text-xs font-semibold text-primary">Edit billing details <ChevronRight className="size-3.5" /></button></Card>
      </div>
        </>
      )}

      {activeTab === "history" && (
        <Card className="p-0"><div className="flex items-center justify-between gap-4 border-b p-5"><div><h2 className="text-sm font-bold">Billing history</h2><p className="mt-1 text-xs text-muted-foreground">View and download past invoices</p></div><Button size="sm" variant="ghost"><Download />Download all</Button></div><Table><TableHeader className="bg-muted/40"><TableRow className="hover:bg-transparent"><TableHead className="h-12 px-5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Invoice</TableHead><TableHead className="h-12 px-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Date</TableHead><TableHead className="h-12 px-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Description</TableHead><TableHead className="h-12 px-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Amount</TableHead><TableHead className="h-12 px-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Status</TableHead><TableHead className="h-12 px-5 text-right text-xs font-semibold uppercase tracking-wide text-muted-foreground">Receipt</TableHead></TableRow></TableHeader><TableBody>{invoices.map((invoice) => <TableRow key={invoice.id}><TableCell className="px-5 py-4 font-mono text-xs font-semibold">{invoice.id}</TableCell><TableCell className="px-3 py-4 text-xs text-muted-foreground">{invoice.date}</TableCell><TableCell className="px-3 py-4 text-xs font-medium">{invoice.plan}</TableCell><TableCell className="px-3 py-4 text-xs font-semibold">{invoice.amount}</TableCell><TableCell className="px-3 py-4"><span className="rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-emerald-600">{invoice.status}</span></TableCell><TableCell className="px-5 py-4 text-right"><Button variant="ghost" size="icon-sm" aria-label={`Download ${invoice.id}`}><Download /></Button></TableCell></TableRow>)}</TableBody></Table></Card>
      )}

      <UpgradeDialog key={`${upgradeOpen}-${currentPlan.id}`} open={upgradeOpen} onClose={() => setUpgradeOpen(false)} currentPlan={currentPlan} onUpgrade={upgrade} paymentMethod={primaryCard} />
      <AddCardDialog open={addCardOpen} onClose={() => setAddCardOpen(false)} onAdd={addCard} />
    </section>
  );
};

export default PlanAndBillingPage;
