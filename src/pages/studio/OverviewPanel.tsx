import { formatPKR } from "@/services/catalog";
import type { StudioOverview } from "@/services/studio";
import type { AdminTab } from "@/pages/studio/types";

export function OverviewPanel({
  overview,
  onOpenTab,
}: {
  overview: StudioOverview | undefined;
  onOpenTab: (tab: AdminTab) => void;
}) {
  if (!overview) {
    return (
      <div className="flex justify-center py-24" aria-label="Loading overview">
        <span className="label-xs text-muted-foreground">Gathering the desk…</span>
      </div>
    );
  }

  const cards: { label: string; value: string; tab?: AdminTab; hint?: string }[] = [
    { label: "Today", value: String(overview.todayOrders), tab: "Orders", hint: formatPKR(overview.todayRevenue) },
    { label: "Awaiting", value: String(overview.awaiting), tab: "Orders" },
    { label: "Unpaid", value: String(overview.unpaid), tab: "Orders" },
    { label: "Revenue", value: formatPKR(overview.revenue), tab: "Orders" },
    { label: "Live pieces", value: String(overview.livePieces), tab: "Catalogue" },
    { label: "Low stock", value: String(overview.lowStock), tab: "Catalogue" },
    { label: "Inbox", value: String(overview.unreadMessages), tab: "Inbox" },
    { label: "Customers", value: String(overview.customers), tab: "Customers" },
  ];

  return (
    <div>
      <p className="max-w-xl text-sm leading-relaxed text-muted-foreground">
        Everything that keeps MEHR moving — today's orders, stock that needs a restock, and messages
        waiting for a reply.
      </p>

      <div className="mt-10 grid gap-px border bg-border sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <button
            key={c.label}
            type="button"
            onClick={() => c.tab && onOpenTab(c.tab)}
            className="bg-background px-5 py-6 text-left transition-colors hover:bg-cream"
          >
            <span className="label-xs text-muted-foreground">{c.label}</span>
            <p className="font-display mt-2 text-2xl md:text-3xl">{c.value}</p>
            {c.hint && <span className="label-xs mt-2 block text-espresso">{c.hint}</span>}
          </button>
        ))}
      </div>

      <div className="mt-14 grid gap-12 lg:grid-cols-2">
        <section>
          <div className="flex items-end justify-between gap-4">
            <h2 className="font-display text-2xl">Latest orders</h2>
            <button type="button" onClick={() => onOpenTab("Orders")} className="label-xs rule-link">
              All orders
            </button>
          </div>
          {overview.recent.length === 0 ? (
            <p className="mt-6 text-sm text-muted-foreground">No orders yet.</p>
          ) : (
            <ul className="mt-6 divide-y border-y">
              {overview.recent.map((o) => (
                <li key={o.id} className="flex items-center justify-between gap-4 py-4 text-sm">
                  <span>
                    {o.orderNumber}
                    <span className="label-xs mt-1 block text-muted-foreground">
                      {o.customerName} · {o.status}
                    </span>
                  </span>
                  <span className="flex-none">{formatPKR(o.total)}</span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section>
          <div className="flex items-end justify-between gap-4">
            <h2 className="font-display text-2xl">Low stock</h2>
            <button type="button" onClick={() => onOpenTab("Catalogue")} className="label-xs rule-link">
              Catalogue
            </button>
          </div>
          {overview.lowStockPieces.length === 0 ? (
            <p className="mt-6 text-sm text-muted-foreground">Every live piece has more than three in stock.</p>
          ) : (
            <ul className="mt-6 divide-y border-y">
              {overview.lowStockPieces.map((p) => (
                <li key={p.id} className="flex items-center justify-between gap-4 py-4 text-sm">
                  <span>{p.name}</span>
                  <span className="label-xs text-burgundy">{p.stock} left</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
