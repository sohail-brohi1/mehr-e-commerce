import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Seo } from "@/components/shared/Seo";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2, Plus, Trash2, Upload, X } from "lucide-react";
import { toast } from "sonner";
import {
  BRAND_COLORS,
  SIZE_PRESETS,
  formatPKR,
  type CategorySlug,
  type ColorOption,
  type Product,
} from "@/services/catalog";
import {
  deleteCollection,
  deleteProduct,
  patchProduct,
  saveCollection,
  saveProduct,
  slugify,
  type Collection,
  type ProductInput,
} from "@/services/db";
import { uploadMedia } from "@/services/media";
import { Logo } from "@/components/layout/Logo";
import { useStudioOverview } from "@/services/studio";
import { CustomersPanel } from "@/pages/studio/CustomersPanel";
import { InboxPanel } from "@/pages/studio/InboxPanel";
import { OverviewPanel } from "@/pages/studio/OverviewPanel";
import { SettingsPanel } from "@/pages/studio/SettingsPanel";
import { ADMIN_TABS, type AdminTab } from "@/pages/studio/types";
import { adminProductsQueryKey, collectionsQueryKey, productsQueryKey, useAdminProducts, useCollections } from "@/store/catalog";
import {
  ORDER_FLOW,
  updateOrderNotes,
  updateOrderStatus,
  updatePaymentStatus,
  useAllOrders,
  useShop,
  type Order,
  type OrderStatus,
} from "@/store/shop";

export function Admin() {
  const { authReady, user, isAdmin } = useShop();
  const [tab, setTab] = useState<AdminTab>("Overview");
  const { data: overview } = useStudioOverview(isAdmin);

  if (!authReady) return <div className="min-h-[70vh] pt-24" aria-label="Loading studio" />;

  if (!user)
    return (
      <Gate
        title="Studio access"
        line="Sign in with your studio account to manage the catalogue and orders."
        cta={{ to: "/account/login", label: "Sign in" }}
      />
    );

  if (!isAdmin)
    return (
      <Gate
        title="Not a studio account"
        line={`${user.email} doesn't have studio access yet. Ask an existing admin to grant it.`}
        cta={{ to: "/", label: "Back to the store" }}
      />
    );

  return (
    <div className="overflow-x-hidden px-5 pb-24 pt-32 md:px-10 md:pt-40">
      <Seo title="Studio Dashboard | MEHR" robots="noindex" />
      <span className="label-xs text-muted-foreground">Studio</span>
      <h1 className="font-display mt-4 text-4xl md:text-6xl">The atelier desk.</h1>
      <p className="mt-4 max-w-xl text-sm leading-relaxed text-muted-foreground">
        Orders, stock, customers, inbox and the numbers customers pay to — all in one place.
      </p>

      <nav className="-mx-5 mt-12 flex gap-8 overflow-x-auto border-b px-5 md:mx-0 md:px-0">
        {ADMIN_TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`label-xs -mb-px flex-none border-b-2 pb-4 transition-colors ${
              tab === t ? "border-charcoal text-foreground" : "border-transparent text-muted-foreground"
            }`}
          >
            {t}
            {t === "Inbox" && overview && overview.unreadMessages > 0 ? (
              <span className="ml-2 text-espresso">{overview.unreadMessages}</span>
            ) : null}
          </button>
        ))}
      </nav>

      <div className="mt-12">
        {tab === "Overview" && <OverviewPanel overview={overview} onOpenTab={setTab} />}
        {tab === "Orders" && <OrdersPanel />}
        {tab === "Catalogue" && <CataloguePanel />}
        {tab === "Collections" && <CollectionsPanel />}
        {tab === "Customers" && <CustomersPanel />}
        {tab === "Inbox" && <InboxPanel />}
        {tab === "Settings" && <SettingsPanel />}
      </div>
    </div>
  );
}

function Gate({
  title,
  line,
  cta,
}: {
  title: string;
  line: string;
  cta: { to: string; label: string };
}) {
  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center px-5 text-center">
      <Logo className="text-2xl" />
      <span className="label-xs mt-8 text-muted-foreground">MEHR studio</span>
      <h1 className="font-display mt-5 text-4xl md:text-5xl">{title}</h1>
      <p className="mt-4 max-w-md text-sm leading-relaxed text-muted-foreground">{line}</p>
      <Link to={cta.to} className="label-xs mt-8 border-b border-foreground pb-1">
        {cta.label}
      </Link>
    </div>
  );
}

/* ---------------------------------- Orders --------------------------------- */

function OrdersPanel() {
  const { isAdmin } = useShop();
  const queryClient = useQueryClient();
  const { data: orders = [], isPending, refetch } = useAllOrders(isAdmin);
  const [open, setOpen] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<"all" | OrderStatus>("all");
  const [pay, setPay] = useState<"all" | "unpaid" | "paid" | "pending">("all");

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return orders.filter((o) => {
      if (status !== "all" && o.status !== status) return false;
      if (pay !== "all" && o.paymentStatus !== pay) return false;
      if (!needle) return true;
      return (
        o.orderNumber.toLowerCase().includes(needle) ||
        o.customerName.toLowerCase().includes(needle) ||
        o.customerEmail.toLowerCase().includes(needle) ||
        o.customerPhone.includes(needle) ||
        o.city.toLowerCase().includes(needle)
      );
    });
  }, [orders, q, status, pay]);

  const revenue = orders
    .filter((o) => o.status !== "Cancelled")
    .reduce((s, o) => s + o.total, 0);

  if (isPending) return <Spinner />;

  return (
    <div>
      <div className="grid gap-4 border-y py-6 sm:grid-cols-3">
        <Stat label="Orders" value={String(orders.length)} />
        <Stat
          label="Awaiting dispatch"
          value={String(orders.filter((o) => o.status === "Pending" || o.status === "Confirmed").length)}
        />
        <Stat label="Revenue" value={formatPKR(revenue)} />
      </div>

      <div className="mt-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="flex flex-1 flex-wrap gap-3">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search number, name, email, phone, city"
            className="input-line min-w-[12rem] flex-1"
          />
          <select value={status} onChange={(e) => setStatus(e.target.value as typeof status)} className="input-line w-auto">
            <option value="all">All statuses</option>
            {[...ORDER_FLOW, "Cancelled" as OrderStatus].map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <select value={pay} onChange={(e) => setPay(e.target.value as typeof pay)} className="input-line w-auto">
            <option value="all">All payments</option>
            <option value="unpaid">Unpaid</option>
            <option value="pending">Pending</option>
            <option value="paid">Paid</option>
          </select>
        </div>
        {orders.length > 0 && (
          <button type="button" onClick={() => downloadOrdersCsv(filtered)} className="label-xs rule-link flex-none">
            Export CSV
          </button>
        )}
      </div>

      {orders.length === 0 ? (
        <Empty line="No orders yet. They'll appear here the moment someone checks out." />
      ) : filtered.length === 0 ? (
        <Empty line="No orders match that search." />
      ) : (
        <ul className="mt-10 flex flex-col divide-y border-y">
          {filtered.map((o) => (
            <OrderRow
              key={o.id}
              order={o}
              open={open === o.id}
              onToggle={() => setOpen((v) => (v === o.id ? null : o.id))}
              onChanged={() => {
                void refetch();
                void queryClient.invalidateQueries({ queryKey: ["studio", "overview"] });
              }}
            />
          ))}
        </ul>
      )}
    </div>
  );
}

function downloadOrdersCsv(orders: Order[]) {
  const header = [
    "Number",
    "Date",
    "Customer",
    "Email",
    "Phone",
    "City",
    "Status",
    "Payment",
    "Pay status",
    "Total",
    "Guest",
  ];
  const rows = orders.map((o) => [
    o.orderNumber,
    o.createdAt,
    o.customerName,
    o.customerEmail,
    o.customerPhone,
    o.city,
    o.status,
    o.paymentMethod,
    o.paymentStatus,
    String(o.total),
    o.isGuest ? "yes" : "no",
  ]);
  const csv = [header, ...rows]
    .map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(","))
    .join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "mehr-orders.csv";
  a.click();
  URL.revokeObjectURL(url);
}

function printPackingSlip(order: Order) {
  const w = window.open("", "_blank", "noopener,noreferrer,width=720,height=900");
  if (!w) {
    toast("Allow pop-ups to print a packing slip.");
    return;
  }
  const esc = (s: string) =>
    s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c] ?? c);
  const items = order.items
    .map((i) => `<li>${i.qty} × ${esc(i.productName)} — ${esc(i.color)} / ${esc(i.size)}</li>`)
    .join("");
  w.document.write(`<!DOCTYPE html><html><head><title>${esc(order.orderNumber)}</title>
    <style>body{font-family:Georgia,serif;padding:40px;color:#1a1612}h1{font-size:28px}ul{padding-left:1.2em}</style>
    </head><body>
    <p>MEHR atelier</p>
    <h1>Packing slip ${esc(order.orderNumber)}</h1>
    <p>${esc(order.customerName)}<br>${esc(order.addressLine1)}<br>${esc(order.city)} ${esc(order.postalCode)}<br>${esc(order.customerPhone)}</p>
    <ul>${items}</ul>
    <p>Total ${esc(formatPKR(order.total))} · ${esc(order.paymentMethod)} · ${esc(order.paymentStatus)}</p>
    </body></html>`);
  w.document.close();
  w.focus();
  w.print();
}

function OrderRow({
  order,
  open,
  onToggle,
  onChanged,
}: {
  order: Order;
  open: boolean;
  onToggle: () => void;
  onChanged: () => void;
}) {
  const [busy, setBusy] = useState(false);
  const [notes, setNotes] = useState(order.notes ?? "");

  const setStatus = async (status: OrderStatus) => {
    setBusy(true);
    try {
      await updateOrderStatus(order.id, status);
      toast(`Order ${order.orderNumber} → ${status}`);
      onChanged();
    } catch {
      toast("Couldn't update that order.");
    } finally {
      setBusy(false);
    }
  };

  const markPaid = async () => {
    setBusy(true);
    try {
      await updatePaymentStatus(order.id, "paid");
      toast("Marked as paid");
      onChanged();
    } catch {
      toast("Couldn't update the payment.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <li className="py-6">
      <button onClick={onToggle} className="grid w-full gap-3 text-left md:grid-cols-12 md:items-center">
        <div className="md:col-span-3">
          <span className="text-sm">{order.orderNumber}</span>
          <span className="label-xs mt-1 block text-muted-foreground">
            {new Date(order.createdAt).toLocaleDateString("en-PK", {
              day: "numeric",
              month: "long",
            })}
            {order.isGuest ? " · Guest" : ""}
          </span>
        </div>
        <div className="label-xs md:col-span-3">{order.customerName}</div>
        <div className="label-xs text-muted-foreground md:col-span-2">
          {order.paymentMethod === "cod" ? "COD" : order.paymentMethod} · {order.paymentStatus}
        </div>
        <div className="label-xs md:col-span-2">{order.status}</div>
        <div className="text-sm md:col-span-2 md:text-right">{formatPKR(order.total)}</div>
      </button>

      {open && (
        <div className="mt-6 grid gap-8 border bg-cream p-6 md:grid-cols-2">
          <div>
            <span className="label-xs text-muted-foreground">Deliver to</span>
            <p className="mt-2 text-sm leading-relaxed">
              {order.customerName}
              <br />
              {order.addressLine1}, {order.city} {order.postalCode}
              <br />
              {order.customerPhone} · {order.customerEmail}
            </p>
            {order.paymentReference && (
              <p className="label-xs mt-4 text-muted-foreground">
                Payment reference: {order.paymentReference}
              </p>
            )}
            <div className="mt-4 flex flex-wrap gap-4">
              <a href={`tel:${order.customerPhone}`} className="label-xs rule-link">
                Call
              </a>
              <a href={`mailto:${order.customerEmail}`} className="label-xs rule-link">
                Email
              </a>
              <button
                type="button"
                className="label-xs rule-link"
                onClick={() => {
                  void navigator.clipboard.writeText(
                    `${order.customerName}\n${order.addressLine1}\n${order.city} ${order.postalCode}\n${order.customerPhone}`,
                  );
                  toast("Address copied");
                }}
              >
                Copy address
              </button>
              <button type="button" className="label-xs rule-link" onClick={() => printPackingSlip(order)}>
                Print slip
              </button>
            </div>
            <label className="mt-6 block">
              <span className="label-xs text-muted-foreground">Studio notes</span>
              <textarea
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                onBlur={() => {
                  if (notes === (order.notes ?? "")) return;
                  void updateOrderNotes(order.id, notes)
                    .then(() => {
                      toast("Note saved");
                      onChanged();
                    })
                    .catch(() => toast("Couldn't save that note."));
                }}
                placeholder="Courier, colour, follow-up…"
                className="input-line mt-2 resize-none"
              />
            </label>
            <div className="mt-6 flex flex-wrap gap-2">
              {[...ORDER_FLOW, "Cancelled" as OrderStatus].map((s) => (
                <button
                  key={s}
                  disabled={busy || s === order.status}
                  onClick={() => void setStatus(s)}
                  className={`label-xs border px-4 py-2.5 transition-colors disabled:opacity-40 ${
                    s === order.status ? "border-charcoal bg-charcoal text-ivory" : "border-border"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
            {order.paymentStatus !== "paid" && (
              <button
                disabled={busy}
                onClick={() => void markPaid()}
                className="label-xs mt-4 border border-espresso px-4 py-2.5 text-espresso disabled:opacity-40"
              >
                Mark payment received
              </button>
            )}
          </div>
          <ul className="flex flex-col gap-4">
            {order.items.map((i) => (
              <li key={i.id} className="flex justify-between gap-4 text-sm">
                <span>
                  {i.productName}
                  <span className="label-xs mt-1 block text-muted-foreground">
                    {i.color} · {i.size} · Qty {i.qty}
                  </span>
                </span>
                <span className="flex-none">{formatPKR(i.unitPrice * i.qty)}</span>
              </li>
            ))}
            <li className="flex justify-between border-t pt-4 text-sm">
              <span className="text-muted-foreground">Shipping</span>
              <span>{order.shipping === 0 ? "Free" : formatPKR(order.shipping)}</span>
            </li>
          </ul>
        </div>
      )}
    </li>
  );
}

/* --------------------------------- Catalogue -------------------------------- */

const EMPTY_DRAFT = (): ProductDraft => ({
  slug: "",
  name: "",
  sku: "",
  description: "",
  story: "",
  price: 0,
  sale_price: null,
  category: "women",
  collection_slug: null,
  sizes: SIZE_PRESETS.adult,
  colors: [],
  images: [],
  frames_360: [],
  model_url: null,
  size_guide_url: null,
  fabric: "",
  fit: "",
  care: "",
  origin: "Made in Pakistan",
  stock: 0,
  featured: false,
  new_arrival: true,
  published: false,
  sort_order: 0,
});

type ProductDraft = ProductInput;

const toDraft = (p: Product): ProductDraft => ({
  slug: p.slug,
  name: p.name,
  sku: p.sku,
  description: p.description,
  story: p.story,
  price: p.price,
  sale_price: p.salePrice ?? null,
  category: p.category,
  collection_slug: p.collection || null,
  sizes: p.sizes,
  colors: p.colors,
  images: p.imagePaths,
  frames_360: p.frames360Paths ?? [],
  model_url: p.modelPath ?? null,
  size_guide_url: p.sizeGuidePath ?? null,
  fabric: p.fabric,
  fit: p.fit,
  care: p.care,
  origin: p.origin,
  stock: p.stock,
  featured: p.featured,
  new_arrival: p.newArrival,
  published: p.published,
  sort_order: p.sortOrder,
});

function CataloguePanel() {
  const { isAdmin } = useShop();
  const { data: products = [], isPending } = useAdminProducts(isAdmin);
  const collections = useCollections();
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState<{ id?: string; draft: ProductDraft } | null>(null);
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<"all" | CategorySlug | "draft" | "low">("all");

  const refresh = () => {
    void queryClient.invalidateQueries({ queryKey: adminProductsQueryKey });
    void queryClient.invalidateQueries({ queryKey: productsQueryKey });
    void queryClient.invalidateQueries({ queryKey: ["studio", "overview"] });
  };

  const visible = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return products.filter((p) => {
      if (filter === "draft" && p.published) return false;
      if (filter === "low" && p.stock > 3) return false;
      if (filter === "women" || filter === "kids" || filter === "shawls") {
        if (p.category !== filter) return false;
      }
      if (!needle) return true;
      return (
        p.name.toLowerCase().includes(needle) ||
        p.sku.toLowerCase().includes(needle) ||
        p.slug.toLowerCase().includes(needle)
      );
    });
  }, [products, q, filter]);

  if (isPending) return <Spinner />;

  if (editing)
    return (
      <ProductEditor
        key={editing.id ?? "new"}
        id={editing.id}
        draft={editing.draft}
        collections={collections}
        onClose={() => setEditing(null)}
        onSaved={() => {
          refresh();
          setEditing(null);
        }}
      />
    );

  const low = products.filter((p) => p.published && p.stock <= 3).length;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <p className="text-sm text-muted-foreground">
          {products.length} pieces · {products.filter((p) => p.published).length} live
          {low > 0 ? ` · ${low} low stock` : ""}
        </p>
        <button
          onClick={() => setEditing({ draft: EMPTY_DRAFT() })}
          className="label-xs flex items-center gap-2 bg-charcoal px-6 py-3.5 text-ivory transition-colors hover:bg-espresso"
        >
          <Plus className="h-3.5 w-3.5" strokeWidth={1.4} />
          Add a piece
        </button>
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search name, SKU, slug"
          className="input-line min-w-[12rem] flex-1"
        />
        {(["all", "women", "kids", "shawls", "draft", "low"] as const).map((f) => (
          <Toggle key={f} label={f === "all" ? "All" : f === "low" ? "Low stock" : f === "draft" ? "Drafts" : f} active={filter === f} onClick={() => setFilter(f)} />
        ))}
      </div>

      {products.length === 0 ? (
        <Empty line="Your catalogue is empty. Add your first piece — photos, story, sizes and stock." />
      ) : visible.length === 0 ? (
        <Empty line="No pieces match that search." />
      ) : (
        <ul className="mt-8 flex flex-col divide-y overflow-x-auto border-y">
          {visible.map((p) => (
            <li key={p.id} className="grid gap-4 py-5 md:grid-cols-12 md:items-center">
              <div className="flex items-center gap-4 md:col-span-4">
                {p.images[0] ? (
                  <img src={p.images[0]} alt="" className="h-16 w-12 flex-none object-cover" />
                ) : (
                  <span className="h-16 w-12 flex-none bg-cream" />
                )}
                <span className="text-sm">
                  {p.name}
                  <span className="label-xs mt-1 block text-muted-foreground">
                    {p.category} · {p.collection || "no collection"}
                    {p.stock <= 3 ? " · low stock" : ""}
                  </span>
                </span>
              </div>
              <div className="text-sm md:col-span-2">{formatPKR(p.salePrice ?? p.price)}</div>
              <div className="md:col-span-2">
                <label className="label-xs flex items-center gap-2 text-muted-foreground">
                  Stock
                  <input
                    type="number"
                    defaultValue={p.stock}
                    min={0}
                    onBlur={(e) => {
                      const stock = Number(e.target.value);
                      if (stock === p.stock) return;
                      void patchProduct(p.id, { stock })
                        .then(refresh)
                        .catch(() => toast("Couldn't update stock."));
                    }}
                    className="w-16 border-b bg-transparent py-1 text-sm text-foreground outline-none"
                  />
                </label>
              </div>
              <div className="flex flex-wrap gap-2 md:col-span-2">
                <Toggle
                  label="Live"
                  active={p.published}
                  onClick={() => void patchProduct(p.id, { published: !p.published }).then(refresh)}
                />
                <Toggle
                  label="Featured"
                  active={p.featured}
                  onClick={() => void patchProduct(p.id, { featured: !p.featured }).then(refresh)}
                />
                <Toggle
                  label="New"
                  active={p.newArrival}
                  onClick={() => void patchProduct(p.id, { new_arrival: !p.newArrival }).then(refresh)}
                />
              </div>
              <div className="flex gap-3 md:col-span-2 md:justify-end">
                <button
                  onClick={() =>
                    setEditing({
                      draft: {
                        ...toDraft(p),
                        slug: "",
                        sku: "",
                        name: `${p.name} (copy)`,
                        published: false,
                      },
                    })
                  }
                  className="label-xs text-muted-foreground"
                >
                  Duplicate
                </button>
                <button
                  onClick={() => setEditing({ id: p.id, draft: toDraft(p) })}
                  className="label-xs rule-link"
                >
                  Edit
                </button>
                <button
                  aria-label={`Delete ${p.name}`}
                  onClick={() => {
                    if (!confirm(`Delete ${p.name}? This can't be undone.`)) return;
                    void deleteProduct(p.id)
                      .then(() => {
                        toast("Piece removed");
                        refresh();
                      })
                      .catch(() => toast("Couldn't delete that piece."));
                  }}
                  className="text-burgundy"
                >
                  <Trash2 className="h-4 w-4" strokeWidth={1.3} />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function ProductEditor({
  id,
  draft: initial,
  collections,
  onClose,
  onSaved,
}: {
  id?: string | undefined;
  draft: ProductDraft;
  collections: Collection[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const [draft, setDraft] = useState<ProductDraft>(initial);
  const [saving, setSaving] = useState(false);
  const set = (patch: Partial<ProductDraft>) => setDraft((d) => ({ ...d, ...patch }));

  useEffect(() => {
    if (!id && draft.name && !draft.slug) set({ slug: slugify(draft.name) });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draft.name]);

  const valid = draft.name.trim().length > 1 && draft.slug.trim().length > 1 && draft.price > 0;

  const save = async () => {
    if (!valid || saving) return;
    setSaving(true);
    try {
      await saveProduct({ ...draft, slug: slugify(draft.slug) }, id);
      toast(id ? "Piece updated" : "Piece added");
      onSaved();
    } catch (error) {
      toast(error instanceof Error ? error.message : "Couldn't save that piece.");
    } finally {
      setSaving(false);
    }
  };

  const toggleSize = (s: string) =>
    set({ sizes: draft.sizes.includes(s) ? draft.sizes.filter((x) => x !== s) : [...draft.sizes, s] });

  const toggleColor = (c: ColorOption) =>
    set({
      colors: draft.colors.some((x) => x.name === c.name)
        ? draft.colors.filter((x) => x.name !== c.name)
        : [...draft.colors, c],
    });

  const sizeOptions = useMemo(
    () => Array.from(new Set([...SIZE_PRESETS.adult, ...SIZE_PRESETS.kids, ...SIZE_PRESETS.one, ...draft.sizes])),
    [draft.sizes],
  );

  return (
    <div>
      <div className="flex items-center justify-between border-b pb-5">
        <h2 className="font-display text-3xl">{id ? draft.name || "Edit piece" : "New piece"}</h2>
        <button onClick={onClose} aria-label="Close editor">
          <X className="h-5 w-5" strokeWidth={1.3} />
        </button>
      </div>

      <div className="mt-10 grid gap-12 lg:grid-cols-12">
        <div className="flex flex-col gap-8 lg:col-span-7">
          <div className="grid gap-8 sm:grid-cols-2">
            <Field label="Name">
              <input value={draft.name} onChange={(e) => set({ name: e.target.value })} className="input-line" />
            </Field>
            <Field label="Web address (slug)">
              <input value={draft.slug} onChange={(e) => set({ slug: e.target.value })} className="input-line" />
            </Field>
            <Field label="SKU">
              <input value={draft.sku} onChange={(e) => set({ sku: e.target.value })} className="input-line" />
            </Field>
            <Field label="Category">
              <select
                value={draft.category}
                onChange={(e) => set({ category: e.target.value as CategorySlug })}
                className="input-line"
              >
                <option value="women">Women</option>
                <option value="kids">Kids</option>
                <option value="shawls">Shawls</option>
              </select>
            </Field>
            <Field label="Collection">
              <select
                value={draft.collection_slug ?? ""}
                onChange={(e) => set({ collection_slug: e.target.value || null })}
                className="input-line"
              >
                <option value="">None</option>
                {collections.map((c) => (
                  <option key={c.slug} value={c.slug}>
                    {c.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Stock">
              <input
                type="number"
                min={0}
                value={draft.stock}
                onChange={(e) => set({ stock: Number(e.target.value) })}
                className="input-line"
              />
            </Field>
            <Field label="Price (PKR)">
              <input
                type="number"
                min={0}
                value={draft.price}
                onChange={(e) => set({ price: Number(e.target.value) })}
                className="input-line"
              />
            </Field>
            <Field label="Sale price (optional)">
              <input
                type="number"
                min={0}
                value={draft.sale_price ?? ""}
                onChange={(e) => set({ sale_price: e.target.value ? Number(e.target.value) : null })}
                className="input-line"
              />
            </Field>
          </div>

          <Field label="Short description">
            <textarea
              rows={3}
              value={draft.description}
              onChange={(e) => set({ description: e.target.value })}
              className="input-line resize-none"
            />
          </Field>
          <Field label="The story">
            <textarea
              rows={5}
              value={draft.story}
              onChange={(e) => set({ story: e.target.value })}
              className="input-line resize-none"
            />
          </Field>
          <div className="grid gap-8 sm:grid-cols-2">
            <Field label="Fabric">
              <input value={draft.fabric} onChange={(e) => set({ fabric: e.target.value })} className="input-line" />
            </Field>
            <Field label="Fit">
              <input value={draft.fit} onChange={(e) => set({ fit: e.target.value })} className="input-line" />
            </Field>
            <Field label="Care">
              <input value={draft.care} onChange={(e) => set({ care: e.target.value })} className="input-line" />
            </Field>
            <Field label="Origin">
              <input value={draft.origin} onChange={(e) => set({ origin: e.target.value })} className="input-line" />
            </Field>
          </div>

          <div>
            <span className="label-xs text-muted-foreground">Sizes</span>
            <div className="mt-3 flex flex-wrap gap-2">
              {sizeOptions.map((s) => (
                <Toggle key={s} label={s} active={draft.sizes.includes(s)} onClick={() => toggleSize(s)} />
              ))}
            </div>
          </div>

          <div>
            <span className="label-xs text-muted-foreground">Colours</span>
            <div className="mt-3 flex flex-wrap gap-2">
              {BRAND_COLORS.map((c) => (
                <button
                  key={c.name}
                  onClick={() => toggleColor(c)}
                  className={`label-xs flex items-center gap-2 border px-3 py-2 ${
                    draft.colors.some((x) => x.name === c.name) ? "border-charcoal" : "border-border"
                  }`}
                >
                  <span className="h-4 w-4 rounded-full border" style={{ backgroundColor: c.hex }} />
                  {c.name}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Toggle label="Live on store" active={draft.published} onClick={() => set({ published: !draft.published })} />
            <Toggle label="Featured" active={draft.featured} onClick={() => set({ featured: !draft.featured })} />
            <Toggle
              label="New arrival"
              active={draft.new_arrival}
              onClick={() => set({ new_arrival: !draft.new_arrival })}
            />
          </div>
        </div>

        <div className="flex flex-col gap-10 lg:col-span-5">
          <MediaList
            title="Photos"
            note="First photo is the cover. JPG or PNG."
            accept="image/*"
            paths={draft.images}
            onChange={(images) => set({ images })}
          />
          <MediaList
            title="360° frames"
            note="Upload frames in order for the drag-to-rotate viewer."
            accept="image/*"
            paths={draft.frames_360}
            onChange={(frames_360) => set({ frames_360 })}
          />
          <MediaSingle
            title="3D model"
            note="GLB or GLTF file."
            accept=".glb,.gltf,model/gltf-binary"
            path={draft.model_url}
            onChange={(model_url) => set({ model_url })}
          />
          <MediaSingle
            title="Size guide"
            note="PDF or image."
            accept="application/pdf,image/*"
            path={draft.size_guide_url}
            onChange={(size_guide_url) => set({ size_guide_url })}
          />
        </div>
      </div>

      <div className="mt-14 flex items-center justify-between border-t pt-8">
        <button onClick={onClose} className="label-xs text-muted-foreground">
          Cancel
        </button>
        <button
          disabled={!valid || saving}
          onClick={() => void save()}
          className="label-xs bg-charcoal px-10 py-4 text-ivory transition-colors hover:bg-espresso disabled:opacity-40"
        >
          {saving ? "Saving…" : id ? "Save changes" : "Add to catalogue"}
        </button>
      </div>
    </div>
  );
}

function MediaList({
  title,
  note,
  accept,
  paths,
  onChange,
}: {
  title: string;
  note: string;
  accept: string;
  paths: string[];
  onChange: (v: string[]) => void;
}) {
  const [busy, setBusy] = useState(false);

  const add = async (files: FileList | null) => {
    if (!files?.length) return;
    setBusy(true);
    try {
      const uploaded: string[] = [];
      for (const file of Array.from(files)) uploaded.push(await uploadMedia(file));
      onChange([...paths, ...uploaded]);
    } catch {
      toast("Upload failed. Try a smaller file.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <span className="label-xs text-muted-foreground">{title}</span>
      <p className="mt-1 text-xs text-muted-foreground">{note}</p>
      <ul className="mt-4 flex flex-col gap-2">
        {paths.map((p, i) => (
          <li key={`${p}-${i}`} className="flex items-center gap-3 border px-3 py-2">
            <span className="label-xs flex-1 truncate text-muted-foreground">{p.split("/").pop()}</span>
            <button
              aria-label="Remove"
              onClick={() => onChange(paths.filter((_, idx) => idx !== i))}
              className="text-burgundy"
            >
              <X className="h-3.5 w-3.5" strokeWidth={1.4} />
            </button>
          </li>
        ))}
      </ul>
      <label className="label-xs mt-4 flex w-fit cursor-pointer items-center gap-2 border border-border px-5 py-3 transition-colors hover:border-espresso">
        {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" strokeWidth={1.4} />}
        {busy ? "Uploading…" : "Upload"}
        <input
          type="file"
          multiple
          accept={accept}
          className="hidden"
          onChange={(e) => void add(e.target.files)}
        />
      </label>
    </div>
  );
}

function MediaSingle({
  title,
  note,
  accept,
  path,
  onChange,
}: {
  title: string;
  note: string;
  accept: string;
  path: string | null;
  onChange: (v: string | null) => void;
}) {
  const [busy, setBusy] = useState(false);

  const add = async (file: File | undefined) => {
    if (!file) return;
    setBusy(true);
    try {
      onChange(await uploadMedia(file, title === "3D model" ? "models" : "guides"));
    } catch {
      toast("Upload failed. Try a smaller file.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <span className="label-xs text-muted-foreground">{title}</span>
      <p className="mt-1 text-xs text-muted-foreground">{note}</p>
      {path && (
        <div className="mt-4 flex items-center gap-3 border px-3 py-2">
          <span className="label-xs flex-1 truncate text-muted-foreground">{path.split("/").pop()}</span>
          <button aria-label="Remove" onClick={() => onChange(null)} className="text-burgundy">
            <X className="h-3.5 w-3.5" strokeWidth={1.4} />
          </button>
        </div>
      )}
      <label className="label-xs mt-4 flex w-fit cursor-pointer items-center gap-2 border border-border px-5 py-3 transition-colors hover:border-espresso">
        {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" strokeWidth={1.4} />}
        {busy ? "Uploading…" : path ? "Replace" : "Upload"}
        <input
          type="file"
          accept={accept}
          className="hidden"
          onChange={(e) => void add(e.target.files?.[0])}
        />
      </label>
    </div>
  );
}

/* -------------------------------- Collections ------------------------------- */

type CollectionDraft = {
  slug: string;
  name: string;
  tagline: string;
  description: string;
  image_url: string | null;
  sort_order: number;
};

function CollectionsPanel() {
  const collections = useCollections();
  const queryClient = useQueryClient();
  const [draft, setDraft] = useState<{ id?: string; value: CollectionDraft } | null>(null);
  const [saving, setSaving] = useState(false);

  const refresh = () => void queryClient.invalidateQueries({ queryKey: collectionsQueryKey });

  const save = async () => {
    if (!draft || saving) return;
    setSaving(true);
    try {
      await saveCollection({ ...draft.value, slug: slugify(draft.value.slug || draft.value.name) }, draft.id);
      toast("Collection saved");
      refresh();
      setDraft(null);
    } catch (error) {
      toast(error instanceof Error ? error.message : "Couldn't save that collection.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <p className="text-sm text-muted-foreground">{collections.length} collections</p>
        <button
          onClick={() =>
            setDraft({
              value: {
                slug: "",
                name: "",
                tagline: "",
                description: "",
                image_url: null,
                sort_order: collections.length,
              },
            })
          }
          className="label-xs flex items-center gap-2 bg-charcoal px-6 py-3.5 text-ivory transition-colors hover:bg-espresso"
        >
          <Plus className="h-3.5 w-3.5" strokeWidth={1.4} />
          New collection
        </button>
      </div>

      {draft && (
        <div className="mt-8 grid gap-8 border bg-cream p-6 md:grid-cols-2">
          <Field label="Name">
            <input
              value={draft.value.name}
              onChange={(e) => setDraft({ ...draft, value: { ...draft.value, name: e.target.value } })}
              className="input-line"
            />
          </Field>
          <Field label="Tagline">
            <input
              value={draft.value.tagline}
              onChange={(e) => setDraft({ ...draft, value: { ...draft.value, tagline: e.target.value } })}
              className="input-line"
            />
          </Field>
          <Field label="Description">
            <textarea
              rows={3}
              value={draft.value.description}
              onChange={(e) => setDraft({ ...draft, value: { ...draft.value, description: e.target.value } })}
              className="input-line resize-none"
            />
          </Field>
          <MediaSingle
            title="Cover image"
            note="Portrait works best."
            accept="image/*"
            path={draft.value.image_url}
            onChange={(image_url) => setDraft({ ...draft, value: { ...draft.value, image_url } })}
          />
          <div className="flex items-center gap-6 md:col-span-2">
            <button
              disabled={saving || draft.value.name.trim().length < 2}
              onClick={() => void save()}
              className="label-xs bg-charcoal px-8 py-3.5 text-ivory disabled:opacity-40"
            >
              {saving ? "Saving…" : "Save collection"}
            </button>
            <button onClick={() => setDraft(null)} className="label-xs text-muted-foreground">
              Cancel
            </button>
          </div>
        </div>
      )}

      {collections.length === 0 ? (
        <Empty line="No collections yet. Group your pieces into chapters like Noor, Sang or Virsa." />
      ) : (
        <ul className="mt-8 flex flex-col divide-y overflow-x-auto border-y">
          {collections.map((c) => (
            <li key={c.id} className="flex items-center gap-4 py-5">
              {c.image ? (
                <img src={c.image} alt="" className="h-16 w-12 flex-none object-cover" />
              ) : (
                <span className="h-16 w-12 flex-none bg-cream" />
              )}
              <span className="flex-1 text-sm">
                {c.name}
                <span className="label-xs mt-1 block text-muted-foreground">{c.tagline}</span>
              </span>
              <button
                onClick={() =>
                  setDraft({
                    id: c.id,
                    value: {
                      slug: c.slug,
                      name: c.name,
                      tagline: c.tagline,
                      description: c.description,
                      image_url: c.imagePath || null,
                      sort_order: c.sortOrder,
                    },
                  })
                }
                className="label-xs rule-link"
              >
                Edit
              </button>
              <button
                aria-label={`Delete ${c.name}`}
                onClick={() => {
                  if (!confirm(`Delete the ${c.name} collection?`)) return;
                  void deleteCollection(c.id)
                    .then(() => {
                      toast("Collection removed");
                      refresh();
                    })
                    .catch(() => toast("Couldn't delete that collection."));
                }}
                className="text-burgundy"
              >
                <Trash2 className="h-4 w-4" strokeWidth={1.3} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/* ---------------------------------- Bits ----------------------------------- */

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="label-xs text-muted-foreground">{label}</span>
      <div className="mt-2">{children}</div>
    </label>
  );
}

function Toggle({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      className={`label-xs border px-3.5 py-2 transition-colors ${
        active ? "border-charcoal bg-charcoal text-ivory" : "border-border text-muted-foreground"
      }`}
    >
      {label}
    </button>
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

function Empty({ line }: { line: string }) {
  return (
    <div className="mt-10 border-y py-20 text-center">
      <p className="mx-auto max-w-sm text-sm leading-relaxed text-muted-foreground">{line}</p>
    </div>
  );
}

function Spinner() {
  return (
    <div className="flex justify-center py-24" aria-label="Loading">
      <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
    </div>
  );
}
