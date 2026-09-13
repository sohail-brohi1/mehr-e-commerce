import { useState } from "react";
import { Link } from "react-router-dom";
import { Seo } from "@/components/shared/Seo";
import { toast } from "sonner";
import { api } from "@/services/api";
import { formatPKR } from "@/services/catalog";
import { ORDER_FLOW, type Order } from "@/store/shop";
import { Reveal } from "@/components/shared/Reveal";

export function Track() {
  const [orderNumber, setOrderNumber] = useState("");
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [order, setOrder] = useState<Order | null>(null);

  const lookup = async () => {
    if (busy) return;
    setBusy(true);
    try {
      const found = await api<Order>(
        `/orders/track/${encodeURIComponent(orderNumber.trim())}?email=${encodeURIComponent(email.trim())}`,
      );
      setOrder(found);
    } catch (error) {
      setOrder(null);
      toast(error instanceof Error ? error.message : "We couldn't find that order.");
    } finally {
      setBusy(false);
    }
  };

  const idx = order ? ORDER_FLOW.indexOf(order.status) : -1;

  return (
    <div className="mx-auto max-w-xl px-5 pb-24 pt-32 md:pt-40">
      <Seo title="Track an order | MEHR" description="Follow a MEHR order with your order number and email." />
      <Reveal>
        <span className="label-xs text-muted-foreground">Orders</span>
        <h1 className="font-display mt-4 text-4xl md:text-5xl">Track a piece.</h1>
        <p className="mt-4 text-sm text-muted-foreground">
          Use the order number from your confirmation email.
        </p>
        <form
          className="mt-10 flex flex-col gap-7"
          onSubmit={(e) => {
            e.preventDefault();
            void lookup();
          }}
        >
          <label className="block">
            <span className="label-xs text-muted-foreground">Order number</span>
            <input
              value={orderNumber}
              onChange={(e) => setOrderNumber(e.target.value)}
              className="input-line mt-2"
              placeholder="MHR-123456"
            />
          </label>
          <label className="block">
            <span className="label-xs text-muted-foreground">Email on the order</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-line mt-2"
            />
          </label>
          <button
            type="submit"
            disabled={!orderNumber.trim() || !email.includes("@") || busy}
            className="label-xs bg-charcoal py-4 text-ivory disabled:opacity-40"
          >
            {busy ? "Looking…" : "Track"}
          </button>
        </form>
      </Reveal>

      {order && (
        <div className="mt-12 border bg-cream p-6">
          <span className="label-xs text-muted-foreground">{order.orderNumber}</span>
          <p className="mt-2 text-sm">
            {order.status} · {formatPKR(order.total)}
          </p>
          <ol className="mt-6 flex flex-col">
            {ORDER_FLOW.map((step, i) => (
              <li key={step} className="flex items-center gap-3 py-2 text-sm">
                <span
                  className={`h-2 w-2 rounded-full ${i <= idx && order.status !== "Cancelled" ? "bg-espresso" : "bg-border"}`}
                />
                {step}
              </li>
            ))}
          </ol>
          <ul className="mt-4 border-t pt-4 text-sm">
            {order.items.map((item) => (
              <li key={item.id} className="flex justify-between py-1">
                <span>
                  {item.productName} · {item.size}
                </span>
                <span>×{item.qty}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <Link to="/account" className="label-xs mt-10 block text-muted-foreground">
        Or sign in to see every order
      </Link>
    </div>
  );
}
