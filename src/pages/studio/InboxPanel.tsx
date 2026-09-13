import { useState } from "react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { api } from "@/services/api";
import { useStudioInbox, useStudioSubscribers } from "@/services/studio";
import { useShop } from "@/store/shop";

export function InboxPanel() {
  const { isAdmin } = useShop();
  const queryClient = useQueryClient();
  const { data: messages = [], isPending, refetch } = useStudioInbox(isAdmin);
  const { data: subscribers = [] } = useStudioSubscribers(isAdmin);
  const [open, setOpen] = useState<string | null>(null);
  const unread = messages.filter((m) => !m.read).length;

  const openMessage = async (id: string, read: boolean) => {
    setOpen((v) => (v === id ? null : id));
    if (!read) {
      await api(`/studio/inbox/${id}/read`, { method: "PATCH" }).catch(() => undefined);
      void refetch();
      void queryClient.invalidateQueries({ queryKey: ["studio", "overview"] });
    }
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this message?")) return;
    try {
      await api(`/studio/inbox/${id}`, { method: "DELETE" });
      toast("Message removed");
      void refetch();
      void queryClient.invalidateQueries({ queryKey: ["studio", "overview"] });
    } catch {
      toast("Couldn't delete that message.");
    }
  };

  const exportSubscribers = () => {
    const csv = ["email,joined", ...subscribers.map((s) => `${s.email},${s.createdAt}`)].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "mehr-subscribers.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  if (isPending) {
    return (
      <div className="py-24 text-center">
        <span className="label-xs text-muted-foreground">Loading inbox…</span>
      </div>
    );
  }

  return (
    <div>
      <div className="grid gap-4 border-y py-6 sm:grid-cols-2">
        <div>
          <span className="label-xs text-muted-foreground">Unread</span>
          <p className="font-display mt-2 text-2xl">{unread}</p>
        </div>
        <div className="flex items-end justify-between gap-4">
          <div>
            <span className="label-xs text-muted-foreground">Newsletter</span>
            <p className="font-display mt-2 text-2xl">{subscribers.length}</p>
          </div>
          {subscribers.length > 0 && (
            <button type="button" onClick={exportSubscribers} className="label-xs rule-link">
              Export CSV
            </button>
          )}
        </div>
      </div>

      {messages.length === 0 ? (
        <div className="mt-10 border-y py-20 text-center">
          <p className="mx-auto max-w-sm text-sm leading-relaxed text-muted-foreground">
            Contact form messages land here — even when SMTP isn't configured.
          </p>
        </div>
      ) : (
        <ul className="mt-10 divide-y border-y">
          {messages.map((m) => (
            <li key={m.id} className="py-6">
              <button
                type="button"
                onClick={() => void openMessage(m.id, m.read)}
                className="grid w-full gap-2 text-left md:grid-cols-12 md:items-center"
              >
                <span className={`text-sm md:col-span-3 ${m.read ? "" : "font-medium"}`}>{m.name}</span>
                <span className="label-xs text-muted-foreground md:col-span-4">{m.email}</span>
                <span className="label-xs truncate md:col-span-3">{m.message}</span>
                <span className="label-xs text-muted-foreground md:col-span-2 md:text-right">
                  {m.read ? "Read" : "New"}
                </span>
              </button>
              {open === m.id && (
                <div className="mt-6 border bg-cream p-6">
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{m.message}</p>
                  <div className="mt-6 flex flex-wrap gap-4">
                    <a href={`mailto:${m.email}`} className="label-xs rule-link">
                      Reply by email
                    </a>
                    <button type="button" onClick={() => void remove(m.id)} className="label-xs text-burgundy">
                      Delete
                    </button>
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
