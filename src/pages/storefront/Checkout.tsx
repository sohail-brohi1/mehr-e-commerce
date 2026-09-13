import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Seo } from "@/components/shared/Seo";
import { AnimatePresence, motion } from "motion/react";
import { ArrowLeft, Check } from "lucide-react";
import { toast } from "sonner";
import { formatPKR, priceOf } from "@/services/catalog";
import { confirmStripeSession, DEFAULT_PAY_TO, displayPayTo, startStripeCheckout } from "@/services/payments";
import { usePayTo } from "@/services/studio";
import { ORDER_FLOW, useProducts, useShop, type Order, type PaymentMethod } from "@/store/shop";

const STEPS = ["Payment", "Details", "Review"] as const;

type Payment = PaymentMethod;

type Form = {
  name: string;
  email: string;
  phone: string;
  line1: string;
  city: string;
  postal: string;
  payment: Payment | null;
  walletNumber: string;
  bankReference: string;
};

const INITIAL: Form = {
  name: "",
  email: "",
  phone: "",
  line1: "",
  city: "",
  postal: "",
  payment: null,
  walletNumber: "",
  bankReference: "",
};

const FREE_SHIP_AT = 15000;
const SHIP_COST = 300;

function paymentLabel(payment: Payment | null, extra = "") {
  if (payment === "cod") return "Cash on delivery";
  if (payment === "wallet") return `JazzCash / Easypaisa${extra}`;
  if (payment === "card") return "Card · Stripe Checkout";
  return `Bank transfer${extra}`;
}

export function Checkout() {
  const { cart, subtotal, placeOrder, clearCart, user } = useShop();
  const products = useProducts();
  const { data: paySettings } = usePayTo();
  const payTo = displayPayTo(paySettings ?? DEFAULT_PAY_TO);
  const [searchParams, setSearchParams] = useSearchParams();
  const [placing, setPlacing] = useState(false);
  const [confirmingStripe, setConfirmingStripe] = useState(false);
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<Form>(INITIAL);
  const [placed, setPlaced] = useState<Order | null>(null);

  useEffect(() => {
    if (!user) return;
    setForm((f) => ({
      ...f,
      name: f.name || user.name,
      email: f.email || user.email,
      phone: f.phone || user.phone || "",
    }));
  }, [user]);

  const shipping = subtotal >= FREE_SHIP_AT || subtotal === 0 ? 0 : SHIP_COST;
  const total = subtotal + shipping;

  const lines = useMemo(
    () =>
      cart
        .map((l) => ({ line: l, product: products.find((p) => p.id === l.productId) }))
        .filter((x) => x.product),
    [cart, products],
  );

  const set = (patch: Partial<Form>) => setForm((f) => ({ ...f, ...patch }));

  useEffect(() => {
    const stripe = searchParams.get("stripe");
    const sessionId = searchParams.get("session_id");
    if (stripe === "cancel") {
      toast("Card payment was cancelled. You can choose another method or try again.");
      setSearchParams({}, { replace: true });
      return;
    }
    if (stripe !== "success" || !sessionId) return;

    let cancelled = false;
    setConfirmingStripe(true);
    confirmStripeSession(sessionId)
      .then((order) => {
        if (cancelled) return;
        clearCart();
        setPlaced(order);
        window.scrollTo({ top: 0 });
        setSearchParams({}, { replace: true });
      })
      .catch(() => {
        if (!cancelled) toast("We couldn't confirm that card payment. Check your account or try again.");
      })
      .finally(() => {
        if (!cancelled) setConfirmingStripe(false);
      });

    return () => {
      cancelled = true;
    };
  }, [clearCart, searchParams, setSearchParams]);

  const canContinue =
    step === 0
      ? form.payment === "cod" || form.payment === "wallet" || form.payment === "bank" || form.payment === "card"
      : step === 1
        ? form.name.trim().length > 1 &&
          form.email.includes("@") &&
          form.phone.replace(/\D/g, "").length >= 10 &&
          form.line1.trim().length > 3 &&
          form.city.trim().length > 1
        : true;

  const confirm = async () => {
    if (placing) return;
    setPlacing(true);
    try {
      const payment = form.payment ?? "cod";
      const reference =
        payment === "wallet"
          ? form.walletNumber.trim()
          : payment === "bank"
            ? form.bankReference.trim()
            : "";
      if (payment === "card") {
        const session = await startStripeCheckout({
          customerName: form.name.trim(),
          customerEmail: form.email.trim(),
          customerPhone: form.phone.trim(),
          addressLine1: form.line1.trim(),
          city: form.city.trim(),
          postalCode: form.postal.trim(),
          shipping,
          items: cart.map((line) => ({
            productId: line.productId,
            size: line.size,
            color: line.color,
            qty: line.qty,
          })),
        });
        if (session.alreadyPaid) {
          clearCart();
          setPlaced(session.order);
          window.scrollTo({ top: 0 });
          return;
        }
        if (!session.url) throw new Error("Stripe checkout URL missing");
        clearCart();
        window.location.assign(session.url);
        return;
      }

      const order = await placeOrder({
        customerName: form.name.trim(),
        customerEmail: form.email.trim(),
        customerPhone: form.phone.trim(),
        addressLine1: form.line1.trim(),
        city: form.city.trim(),
        postalCode: form.postal.trim(),
        shipping,
        paymentMethod: payment,
        paymentStatus: payment === "cod" ? "unpaid" : "pending",
        ...(reference ? { paymentReference: reference } : {}),
      });

      setPlaced(order);
      window.scrollTo({ top: 0 });
    } catch {
      toast("We couldn't save your order. Please try again.");
    } finally {
      setPlacing(false);
    }
  };

  if (placed) return <Confirmation order={placed} />;

  if (confirmingStripe) {
    return (
      <div className="flex min-h-[80vh] flex-col items-center justify-center px-5 pt-24 text-center">
        <Seo title="Confirming payment | MEHR" robots="noindex" />
        <p className="font-display text-4xl">Confirming your payment</p>
        <p className="mt-3 text-sm text-muted-foreground">One moment while Stripe finishes the checkout.</p>
      </div>
    );
  }

  if (cart.length === 0)
    return (
      <div className="flex min-h-[80vh] flex-col items-center justify-center px-5 pt-24 text-center">
        <Seo title="Checkout | MEHR" robots="noindex" />
        <p className="font-display text-4xl">Your bag is empty</p>
        <p className="mt-3 text-sm text-muted-foreground">Add a piece before checking out.</p>
        <Link to="/new-arrivals" className="label-xs mt-8 border-b border-foreground pb-1">
          Explore new arrivals
        </Link>
      </div>
    );

  return (
    <div className="px-5 pt-32 md:px-10 md:pt-40">
      <Seo title="Checkout | MEHR" robots="noindex" />
      <span className="label-xs text-muted-foreground">Checkout</span>
      <h1 className="font-display mt-4 text-4xl md:text-6xl">Almost yours.</h1>
      {!user && (
        <p className="mt-4 text-sm text-muted-foreground">
          Have an account?{" "}
          <Link to="/account/login?next=/checkout" className="underline">
            Sign in
          </Link>{" "}
          to fill this in faster.
        </p>
      )}

      {/* Progress */}
      <ol className="mt-12 flex items-center gap-0 border-y">
        {STEPS.map((label, i) => (
          <li key={label} className="flex flex-1 items-center">
            <button
              type="button"
              onClick={() => i <= step && setStep(i)}
              className={`label-xs flex w-full items-center gap-3 py-4 ${
                i === step ? "text-foreground" : i < step ? "text-espresso" : "text-muted-foreground"
              }`}
            >
              <span
                className={`flex h-6 w-6 flex-none items-center justify-center border text-[0.6rem] ${
                  i < step
                    ? "border-espresso bg-espresso text-ivory"
                    : i === step
                      ? "border-charcoal"
                      : "border-border"
                }`}
              >
                {i < step ? <Check className="h-3 w-3" strokeWidth={1.5} /> : i + 1}
              </span>
              <span className="hidden sm:inline">{label}</span>
            </button>
            {i < STEPS.length - 1 && <span className="h-px w-6 flex-none bg-border" />}
          </li>
        ))}
      </ol>

      <div className="mt-12 grid gap-14 lg:grid-cols-12">
        {/* Form */}
        <div className="lg:col-span-7">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -24 }}
              transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            >
              {step === 0 && (
                <fieldset className="flex flex-col gap-3">
                  <legend className="sr-only">Payment method</legend>
                  <p className="text-sm text-muted-foreground">Choose how you want to pay, then we’ll take your details.</p>
                  <PaymentOption
                    name="payment"
                    value="cod"
                    checked={form.payment === "cod"}
                    onChange={() => set({ payment: "cod" })}
                    title="Cash on delivery"
                    note="Pay the courier when your order arrives. Available nationwide."
                  />
                  <PaymentOption
                    name="payment"
                    value="card"
                    checked={form.payment === "card"}
                    onChange={() => set({ payment: "card" })}
                    title="Card · Stripe"
                    note="Pay securely with Visa, Mastercard, or other cards. You’ll finish on Stripe Checkout."
                  />
                  <PaymentOption
                    name="payment"
                    value="wallet"
                    checked={form.payment === "wallet"}
                    onChange={() => set({ payment: "wallet" })}
                    title="JazzCash / Easypaisa"
                    note="Send the total, then drop the number you paid from — or we'll match it from your phone."
                  >
                    {form.payment === "wallet" && (
                      <div className="border-t px-5 pb-5 pt-4 md:px-6">
                        <p className="text-xs leading-relaxed text-muted-foreground">
                          JazzCash {payTo.jazzcash} · Easypaisa {payTo.easypaisa}
                        </p>
                        <Field label="Wallet number you paid from (optional)">
                          <input
                            id="wallet-number"
                            inputMode="numeric"
                            value={form.walletNumber}
                            onChange={(e) => set({ walletNumber: e.target.value })}
                            placeholder="03XX XXXXXXX"
                            className="input-line"
                          />
                        </Field>
                      </div>
                    )}
                  </PaymentOption>
                  <PaymentOption
                    name="payment"
                    value="bank"
                    checked={form.payment === "bank"}
                    onChange={() => set({ payment: "bank" })}
                    title="Bank transfer"
                    note="Transfer to our account. Reference can wait until after you place the order."
                  >
                    {form.payment === "bank" && (
                      <div className="border-t px-5 pb-5 pt-4 md:px-6">
                        <p className="text-xs leading-relaxed text-muted-foreground">
                          {payTo.bank.title} · {payTo.bank.name}
                          <br />
                          {payTo.bank.iban}
                        </p>
                        <Field label="Transaction reference (optional)">
                          <input
                            id="bank-reference"
                            value={form.bankReference}
                            onChange={(e) => set({ bankReference: e.target.value })}
                            placeholder="TRX-000000"
                            className="input-line"
                          />
                        </Field>
                      </div>
                    )}
                  </PaymentOption>
                  {form.payment && (
                    <p className="label-xs pt-2 text-espresso">Selected — {paymentLabel(form.payment)}</p>
                  )}
                </fieldset>
              )}

              {step === 1 && (
                <div className="flex flex-col gap-8">
                  <Field label="Full name">
                    <input
                      value={form.name}
                      onChange={(e) => set({ name: e.target.value })}
                      placeholder="Ayesha Khan"
                      className="input-line"
                      autoComplete="name"
                    />
                  </Field>
                  <Field label="Email">
                    <input
                      type="email"
                      value={form.email}
                      onChange={(e) => set({ email: e.target.value })}
                      placeholder="you@example.com"
                      className="input-line"
                      autoComplete="email"
                    />
                  </Field>
                  <Field label="Phone">
                    <input
                      type="tel"
                      value={form.phone}
                      onChange={(e) => set({ phone: e.target.value })}
                      placeholder="03XX XXXXXXX"
                      className="input-line"
                      autoComplete="tel"
                    />
                  </Field>
                  <Field label="Street address">
                    <input
                      value={form.line1}
                      onChange={(e) => set({ line1: e.target.value })}
                      placeholder="House 12, Street 4, Gulberg III"
                      className="input-line"
                      autoComplete="street-address"
                    />
                  </Field>
                  <div className="grid gap-8 sm:grid-cols-2">
                    <Field label="City">
                      <input
                        value={form.city}
                        onChange={(e) => set({ city: e.target.value })}
                        placeholder="Lahore"
                        className="input-line"
                        autoComplete="address-level2"
                      />
                    </Field>
                    <Field label="Postal code (optional)">
                      <input
                        value={form.postal}
                        onChange={(e) => set({ postal: e.target.value })}
                        placeholder="54000"
                        className="input-line"
                        autoComplete="postal-code"
                      />
                    </Field>
                  </div>
                  <p className="text-xs leading-relaxed text-muted-foreground">
                    We deliver nationwide via tracked courier in 3–5 working days.
                    {shipping === 0
                      ? " Your order ships free."
                      : ` Orders over ${formatPKR(FREE_SHIP_AT)} ship free.`}
                  </p>
                </div>
              )}

              {step === 2 && (
                <div className="flex flex-col gap-8">
                  <ReviewBlock title="Payment" onEdit={() => setStep(0)}>
                    {paymentLabel(
                      form.payment,
                      form.payment === "wallet" && form.walletNumber.trim()
                        ? ` · ${form.walletNumber}`
                        : form.payment === "bank" && form.bankReference.trim()
                          ? ` · ${form.bankReference}`
                          : "",
                    )}
                  </ReviewBlock>
                  <ReviewBlock title="Contact" onEdit={() => setStep(1)}>
                    {form.name} · {form.email} · {form.phone}
                  </ReviewBlock>
                  <ReviewBlock title="Deliver to" onEdit={() => setStep(1)}>
                    {form.line1}, {form.city}
                    {form.postal ? ` ${form.postal}` : ""}
                  </ReviewBlock>
                  <p className="text-xs leading-relaxed text-muted-foreground">
                    By placing this order you agree to our exchange policy: unused pieces can be
                    exchanged within 14 days.
                  </p>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          <div className="mt-12 flex items-center justify-between gap-4">
            {step > 0 ? (
              <button
                type="button"
                onClick={() => setStep((s) => s - 1)}
                className="label-xs flex min-h-11 items-center gap-2 text-muted-foreground transition-colors hover:text-foreground"
              >
                <ArrowLeft className="h-3.5 w-3.5" strokeWidth={1.2} />
                Back
              </button>
            ) : (
              <span />
            )}
            {step < STEPS.length - 1 ? (
              <button
                type="button"
                disabled={!canContinue}
                onClick={() => setStep((s) => s + 1)}
                className="label-xs min-h-11 bg-charcoal px-10 py-4 text-ivory transition-colors hover:bg-espresso disabled:cursor-not-allowed disabled:opacity-40"
              >
                Continue
              </button>
            ) : (
              <button
                type="button"
                disabled={placing}
                onClick={() => void confirm()}
                className="label-xs min-h-11 bg-burgundy px-10 py-4 text-ivory transition-opacity hover:opacity-90 disabled:opacity-50"
              >
                {placing
                  ? form.payment === "card"
                    ? "Opening Stripe…"
                    : "Placing…"
                  : form.payment === "card"
                    ? `Pay with card — ${formatPKR(total)}`
                    : `Place order — ${formatPKR(total)}`}
              </button>
            )}
          </div>
          {step < STEPS.length - 1 && !canContinue && (
            <p className="mt-3 text-right text-xs text-muted-foreground">
              {step === 0
                ? "Select a payment method to continue."
                : "Add your name, email, phone, address and city to continue."}
            </p>
          )}
        </div>

        {/* Summary */}
        <aside className="lg:col-span-4 lg:col-start-9">
          <div className="border bg-cream p-6 lg:sticky lg:top-28">
            <span className="label-xs text-muted-foreground">Order summary</span>
            <ul className="mt-6 flex flex-col gap-5">
              {lines.map(({ line, product }) => (
                <li key={line.key} className="flex gap-4">
                  <img
                    src={product!.images[0]}
                    alt={product!.name}
                    width={1200}
                    height={1500}
                    loading="lazy"
                    className="h-24 w-[4.5rem] flex-none object-cover"
                  />
                  <div className="flex flex-1 flex-col text-sm">
                    <span>{product!.name}</span>
                    <span className="label-xs mt-1 text-muted-foreground">
                      {line.color} · {line.size} · Qty {line.qty}
                    </span>
                    <span className="mt-auto">{formatPKR(priceOf(product!) * line.qty)}</span>
                  </div>
                </li>
              ))}
            </ul>
            <dl className="mt-6 flex flex-col gap-2 border-t pt-5 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Subtotal</dt>
                <dd>{formatPKR(subtotal)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Shipping</dt>
                <dd>{shipping === 0 ? "Free" : formatPKR(shipping)}</dd>
              </div>
              <div className="mt-2 flex justify-between border-t pt-4 text-base">
                <dt>Total</dt>
                <dd>{formatPKR(total)}</dd>
              </div>
            </dl>
          </div>
        </aside>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="block">
      <span className="label-xs text-muted-foreground">{label}</span>
      <div className="mt-2">{children}</div>
    </div>
  );
}

function PaymentOption({
  name,
  value,
  checked,
  onChange,
  title,
  note,
  children,
}: {
  name: string;
  value: Payment;
  checked: boolean;
  onChange: () => void;
  title: string;
  note: string;
  children?: React.ReactNode;
}) {
  return (
    <div
      className={`border transition-colors ${
        checked ? "border-charcoal bg-cream ring-1 ring-charcoal" : "border-border"
      }`}
    >
      <label className="flex cursor-pointer items-start gap-4 p-5 text-left md:p-6">
        <input
          type="radio"
          name={name}
          value={value}
          checked={checked}
          onChange={onChange}
          className="mt-0.5 h-5 w-5 flex-none accent-[var(--espresso)]"
        />
        <span className="min-w-0 flex-1">
          <span className="flex items-center justify-between gap-3">
            <span className="block text-sm">{title}</span>
            {checked && <span className="label-xs text-espresso">Selected</span>}
          </span>
          <span className="mt-1 block text-xs leading-relaxed text-muted-foreground">{note}</span>
        </span>
      </label>
      {children}
    </div>
  );
}

function ReviewBlock({
  title,
  onEdit,
  children,
}: {
  title: string;
  onEdit: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-6 border-b pb-6">
      <div>
        <span className="label-xs text-muted-foreground">{title}</span>
        <p className="mt-2 text-sm leading-relaxed">{children}</p>
      </div>
      <button type="button" onClick={onEdit} className="label-xs rule-link flex-none text-muted-foreground">
        Edit
      </button>
    </div>
  );
}

function Confirmation({ order }: { order: Order }) {
  const statusIndex = ORDER_FLOW.indexOf(order.status);
  return (
    <div className="px-5 pt-32 md:px-10 md:pt-40">
      <Seo title={`Order ${order.orderNumber} | MEHR`} robots="noindex" />
      <div className="mx-auto max-w-2xl text-center">
        <motion.div
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-espresso"
        >
          <Check className="h-6 w-6 text-espresso" strokeWidth={1.2} />
        </motion.div>
        <span className="label-xs mt-8 block text-muted-foreground">Order {order.orderNumber}</span>
        <h1 className="font-display mt-4 text-4xl md:text-6xl">Shukriya, {order.customerName.split(" ")[0]}.</h1>
        <p className="mt-5 text-sm leading-relaxed text-muted-foreground">
          Your order is confirmed. We've sent the details to {order.customerEmail}
          {order.paymentMethod === "cod"
            ? " — keep cash ready for the courier."
            : order.paymentMethod === "card" && order.paymentStatus === "paid"
              ? " — your card payment went through."
              : " — we'll confirm your payment shortly."}
        </p>
      </div>

      <div className="mx-auto mt-16 max-w-2xl border bg-cream p-6 md:p-8">
        <span className="label-xs text-muted-foreground">What's next</span>
        <ol className="mt-6 flex flex-col gap-0">
          {ORDER_FLOW.map((s, i) => (
            <li key={s} className="flex items-center gap-4 py-3">
              <span
                className={`flex h-6 w-6 flex-none items-center justify-center rounded-full border text-[0.6rem] ${
                  i <= statusIndex
                    ? "border-espresso bg-espresso text-ivory"
                    : "border-border text-muted-foreground"
                }`}
              >
                {i < statusIndex ? <Check className="h-3 w-3" strokeWidth={1.5} /> : i + 1}
              </span>
              <span className={`text-sm ${i <= statusIndex ? "" : "text-muted-foreground"}`}>
                {s}
              </span>
              {i === 0 && (
                <span className="label-xs ml-auto text-muted-foreground">
                  {new Date(order.createdAt).toLocaleDateString("en-PK", {
                    day: "numeric",
                    month: "short",
                  })}
                </span>
              )}
            </li>
          ))}
        </ol>
        <div className="mt-6 flex justify-between border-t pt-5 text-sm">
          <span className="text-muted-foreground">
            Total ({order.paymentMethod === "cod" ? "pay on delivery" : order.paymentStatus})
          </span>
          <span>{formatPKR(order.total)}</span>
        </div>
      </div>

      <div className="mt-12 flex flex-wrap justify-center gap-4">
        <Link to="/account" className="label-xs border border-border px-8 py-4 transition-colors hover:border-espresso">
          Track in your account
        </Link>
        <Link to="/new-arrivals" className="label-xs bg-charcoal px-8 py-4 text-ivory transition-colors hover:bg-espresso">
          Continue shopping
        </Link>
      </div>
    </div>
  );
}
