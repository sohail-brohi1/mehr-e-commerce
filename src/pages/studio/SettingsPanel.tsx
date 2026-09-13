import { useEffect, useState } from "react";
import { toast } from "sonner";
import { api } from "@/services/api";
import { DEFAULT_PAY_TO, type PayToSettings } from "@/services/payments";
import { useStudioSettings } from "@/services/studio";
import { useQueryClient } from "@tanstack/react-query";
import { useShop } from "@/store/shop";

export function SettingsPanel() {
  const { isAdmin, user } = useShop();
  const queryClient = useQueryClient();
  const { data, isPending } = useStudioSettings(isAdmin);
  const [payTo, setPayTo] = useState<PayToSettings>(DEFAULT_PAY_TO);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (data?.payTo) setPayTo(data.payTo);
  }, [data]);

  const save = async () => {
    setSaving(true);
    try {
      await api("/studio/settings", { method: "PUT", body: JSON.stringify({ payTo }) });
      toast("Payment details updated — checkout will show these numbers.");
      void queryClient.invalidateQueries({ queryKey: ["studio", "settings"] });
      void queryClient.invalidateQueries({ queryKey: ["pay-to"] });
    } catch (error) {
      toast(error instanceof Error ? error.message : "Couldn't save settings.");
    } finally {
      setSaving(false);
    }
  };

  if (isPending) {
    return (
      <div className="py-24 text-center">
        <span className="label-xs text-muted-foreground">Loading settings…</span>
      </div>
    );
  }

  return (
    <div className="max-w-xl">
      <p className="text-sm leading-relaxed text-muted-foreground">
        These are the JazzCash, Easypaisa and bank details customers see at checkout. Update them
        here instead of editing code.
      </p>

      <div className="mt-10 flex flex-col gap-8">
        <label className="block">
          <span className="label-xs text-muted-foreground">JazzCash number</span>
          <input
            value={payTo.jazzcash}
            onChange={(e) => setPayTo({ ...payTo, jazzcash: e.target.value })}
            className="input-line mt-2"
          />
        </label>
        <label className="block">
          <span className="label-xs text-muted-foreground">Easypaisa number</span>
          <input
            value={payTo.easypaisa}
            onChange={(e) => setPayTo({ ...payTo, easypaisa: e.target.value })}
            className="input-line mt-2"
          />
        </label>
        <label className="block">
          <span className="label-xs text-muted-foreground">Bank account title</span>
          <input
            value={payTo.bankTitle}
            onChange={(e) => setPayTo({ ...payTo, bankTitle: e.target.value })}
            className="input-line mt-2"
          />
        </label>
        <label className="block">
          <span className="label-xs text-muted-foreground">Bank name</span>
          <input
            value={payTo.bankName}
            onChange={(e) => setPayTo({ ...payTo, bankName: e.target.value })}
            className="input-line mt-2"
          />
        </label>
        <label className="block">
          <span className="label-xs text-muted-foreground">IBAN</span>
          <input
            value={payTo.iban}
            onChange={(e) => setPayTo({ ...payTo, iban: e.target.value })}
            className="input-line mt-2"
          />
        </label>
        <button
          type="button"
          disabled={saving}
          onClick={() => void save()}
          className="label-xs w-fit bg-charcoal px-8 py-3.5 text-ivory disabled:opacity-40"
        >
          {saving ? "Saving…" : "Save payment details"}
        </button>
      </div>

      <p className="mt-12 text-xs leading-relaxed text-muted-foreground">
        Signed in as {user?.email}. SMTP, S3 and the house admin email stay in the server environment
        — they aren't stored in this panel.
      </p>
    </div>
  );
}
