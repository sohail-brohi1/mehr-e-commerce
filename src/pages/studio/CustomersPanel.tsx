import { useMemo, useState } from "react";
import { toast } from "sonner";
import { formatPKR } from "@/services/catalog";
import { api } from "@/services/api";
import { useStudioCustomers } from "@/services/studio";
import { useShop } from "@/store/shop";

export function CustomersPanel() {
  const { isAdmin } = useShop();
  const { data: customers = [], isPending, refetch } = useStudioCustomers(isAdmin);
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return customers;
    return customers.filter(
      (c) =>
        c.name.toLowerCase().includes(needle) ||
        c.email.toLowerCase().includes(needle) ||
        c.phone.includes(needle),
    );
  }, [customers, q]);

  const setRole = async (id: string, role: "admin" | "customer") => {
    try {
      await api(`/studio/customers/${id}/role`, { method: "PATCH", body: JSON.stringify({ role }) });
      toast(role === "admin" ? "Studio access granted" : "Studio access removed");
      void refetch();
    } catch (error) {
      toast(error instanceof Error ? error.message : "Couldn't update that account.");
    }
  };

  if (isPending) {
    return (
      <div className="py-24 text-center">
        <span className="label-xs text-muted-foreground">Loading customers…</span>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <p className="text-sm text-muted-foreground">
          {customers.length} accounts · {customers.filter((c) => c.isAdmin).length} with studio access
        </p>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search name, email, phone"
          className="input-line max-w-xs"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="mt-10 border-y py-20 text-center">
          <p className="text-sm text-muted-foreground">No matching customers.</p>
        </div>
      ) : (
        <ul className="mt-8 divide-y overflow-x-auto border-y">
          {filtered.map((c) => (
            <li key={c.id} className="grid gap-3 py-5 md:grid-cols-12 md:items-center">
              <div className="md:col-span-4">
                <span className="text-sm">{c.name}</span>
                <span className="label-xs mt-1 block text-muted-foreground">{c.email}</span>
              </div>
              <div className="label-xs text-muted-foreground md:col-span-2">{c.phone || "—"}</div>
              <div className="label-xs md:col-span-2">
                {c.orders} orders · {formatPKR(c.spend)}
              </div>
              <div className="label-xs md:col-span-2">{c.isAdmin ? "Studio" : "Customer"}</div>
              <div className="md:col-span-2 md:text-right">
                <button
                  type="button"
                  onClick={() => void setRole(c.id, c.isAdmin ? "customer" : "admin")}
                  className="label-xs rule-link"
                >
                  {c.isAdmin ? "Revoke studio" : "Grant studio"}
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
