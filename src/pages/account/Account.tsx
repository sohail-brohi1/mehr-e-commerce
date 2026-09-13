import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Seo } from "@/components/shared/Seo";
import { toast } from "sonner";
import { formatPKR } from "@/services/catalog";
import { ORDER_FLOW, useMyOrders, useShop, type Order } from "@/store/shop";
import { Reveal } from "@/components/shared/Reveal";

export function Account() {
  const { user, authReady, wishlist, signOut, updateProfile } = useShop();
  const { data: orders = [] } = useMyOrders();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [saving, setSaving] = useState(false);
  const [openOrder, setOpenOrder] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    setName(user.name);
    setPhone(user.phone || "");
  }, [user]);

  if (!authReady) return <div className="min-h-[70vh] pt-24" aria-label="Loading account" />;

  if (!user) {
    return (
      <div className="px-5 pb-20 pt-32 md:px-10 md:pt-40">
        <Seo title="Your orders | MEHR" robots="noindex" />
        <Reveal>
          <span className="label-xs text-muted-foreground">My orders</span>
          <h1 className="font-display mt-4 text-4xl md:text-6xl">Your pieces.</h1>
          <p className="mt-4 max-w-lg text-sm leading-relaxed text-muted-foreground">
            Orders and saved hearts on this device stay here even without an account. Create one to
            keep them if you change phones.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/account/login?mode=register" className="label-xs bg-charcoal px-8 py-4 text-ivory">
              Create account
            </Link>
            <Link to="/account/login" className="label-xs border border-border px-8 py-4">
              Sign in
            </Link>
          </div>
        </Reveal>
        <div className="mt-14 grid gap-4 border-y py-6 sm:grid-cols-2">
          <Stat label="My orders" value={String(orders.length)} />
          <Stat label="Wishlist" value={String(wishlist.length)} />
        </div>
        <OrderList orders={orders} openOrder={openOrder} setOpenOrder={setOpenOrder} />
      </div>
    );
  }

  const save = async () => {
    if (name.trim().length < 2 || saving) return;
    setSaving(true);
    try {
      await updateProfile({ name: name.trim(), phone: phone.trim() });
      toast("Profile saved");
    } catch (error) {
      toast(error instanceof Error ? error.message : "Couldn't save that.");
    } finally {
      setSaving(false);
    }
  };

  const dirty = name.trim() !== user.name || phone.trim() !== (user.phone || "");

  return (
    <div className="px-5 pb-20 pt-32 md:px-10 md:pt-40">
      <Seo title="Your Account | MEHR" robots="noindex" />
      <Reveal>
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <span className="label-xs text-muted-foreground">Account</span>
            <h1 className="font-display mt-4 text-4xl md:text-6xl">{user.name}</h1>
            <p className="mt-2 text-sm text-muted-foreground">{user.email}</p>
          </div>
          <button
            onClick={() => void signOut()}
            className="label-xs min-h-11 border border-border px-6 py-3 transition-colors hover:border-espresso"
          >
            Sign out
          </button>
        </div>
      </Reveal>

      <div className="mt-14 grid gap-4 border-y py-6 sm:grid-cols-3">
        <Stat label="My orders" value={String(orders.length)} />
        <Stat label="Wishlist" value={String(wishlist.length)} />
        <Stat
          label="Lifetime spend"
          value={formatPKR(orders.reduce((s, o) => s + o.total, 0))}
        />
      </div>

      <section className="mt-16 max-w-xl">
        <h2 className="font-display text-3xl md:text-4xl">Details</h2>
        <form
          className="mt-8 flex flex-col gap-6"
          onSubmit={(e) => {
            e.preventDefault();
            void save();
          }}
        >
          <label className="block">
            <span className="label-xs text-muted-foreground">Name</span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input-line mt-2"
              autoComplete="name"
            />
          </label>
          <label className="block">
            <span className="label-xs text-muted-foreground">Phone</span>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="input-line mt-2"
              autoComplete="tel"
              inputMode="tel"
            />
          </label>
          <p className="text-sm text-muted-foreground">{user.email}</p>
          <button
            type="submit"
            disabled={!dirty || saving || name.trim().length < 2}
            className="label-xs w-fit bg-charcoal px-8 py-4 text-ivory disabled:opacity-40"
          >
            {saving ? "Saving…" : "Save details"}
          </button>
        </form>
      </section>

      <section className="mt-16">
        <OrderList orders={orders} openOrder={openOrder} setOpenOrder={setOpenOrder} />
      </section>
    </div>
  );
}

function OrderList({
  orders,
  openOrder,
  setOpenOrder,
}: {
  orders: Order[];
  openOrder: string | null;
  setOpenOrder: (id: string | null) => void;
}) {
  return (
    <section className="mt-16">
      <h2 className="font-display text-3xl md:text-4xl">My orders</h2>
      {orders.length === 0 ? (
        <div className="mt-8 border-t py-20 text-center">
          <p className="font-display text-2xl">No orders yet</p>
          <Link
            to="/new-arrivals"
            className="label-xs mt-6 inline-block border-b border-foreground pb-1"
          >
            Start with new arrivals
          </Link>
        </div>
      ) : (
        <ul className="mt-8 flex flex-col divide-y border-y">
          {orders.map((o) => {
            const idx = ORDER_FLOW.indexOf(o.status);
            const open = openOrder === o.id;
            return (
              <li key={o.id} className="py-6">
                <button
                  type="button"
                  className="grid w-full gap-4 text-left md:grid-cols-12 md:items-center"
                  onClick={() => setOpenOrder(open ? null : o.id)}
                  aria-expanded={open}
                >
                  <div className="md:col-span-3">
                    <span className="text-sm">{o.orderNumber}</span>
                    <span className="label-xs mt-1 block text-muted-foreground">
                      {new Date(o.createdAt).toLocaleDateString("en-PK", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                  <div className="md:col-span-4">
                    <div className="h-px w-full bg-border">
                      <div
                        className={`h-px transition-all duration-700 ${
                          o.status === "Cancelled" ? "bg-burgundy" : "bg-espresso"
                        }`}
                        style={{
                          width:
                            o.status === "Cancelled"
                              ? "100%"
                              : `${((idx + 1) / ORDER_FLOW.length) * 100}%`,
                        }}
                      />
                    </div>
                    <span className="label-xs mt-2 block text-muted-foreground">
                      {o.status}
                    </span>
                  </div>
                  <div className="label-xs text-muted-foreground md:col-span-3">
                    {o.items.reduce((n, l) => n + l.qty, 0)} pieces ·{" "}
                    {o.paymentMethod === "cod" ? "COD" : o.paymentStatus === "paid" ? "Paid" : "Unpaid"}
                  </div>
                  <div className="flex items-center justify-between text-sm md:col-span-2 md:justify-end">
                    {formatPKR(o.total)}
                    <span className="label-xs ml-4 text-muted-foreground">{open ? "Hide" : "View"}</span>
                  </div>
                </button>
                {open && <OrderDetail order={o} />}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

function OrderDetail({ order }: { order: Order }) {
  return (
    <div className="mt-6 border bg-cream p-5">
      <ul className="flex flex-col gap-4">
        {order.items.map((item) => (
          <li key={item.id} className="flex items-center justify-between gap-4 text-sm">
            <span>
              {item.productName}
              <span className="mt-1 block text-xs text-muted-foreground">
                {item.size}
                {item.color ? ` · ${item.color}` : ""} · ×{item.qty}
              </span>
            </span>
            <span>{formatPKR(item.unitPrice * item.qty)}</span>
          </li>
        ))}
      </ul>
      <p className="mt-4 text-sm text-muted-foreground">
        {order.addressLine1}, {order.city}
        {order.postalCode ? ` ${order.postalCode}` : ""}
      </p>
      <Link to="/track" className="label-xs mt-4 inline-block border-b border-foreground pb-1">
        Track this order
      </Link>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <span className="label-xs text-muted-foreground">{label}</span>
      <p className="font-display mt-2 text-2xl md:text-3xl">{value}</p>
    </div>
  );
}
