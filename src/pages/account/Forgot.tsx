import { useState } from "react";
import { Link } from "react-router-dom";
import { Seo } from "@/components/shared/Seo";
import { toast } from "sonner";
import { api } from "@/services/api";
import { Reveal } from "@/components/shared/Reveal";

export function Forgot() {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);

  const submit = async () => {
    if (!email.includes("@") || busy) return;
    setBusy(true);
    try {
      await api("/auth/forgot", { method: "POST", body: JSON.stringify({ email: email.trim() }) });
      setSent(true);
    } catch (error) {
      toast(error instanceof Error ? error.message : "Couldn't send that email.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto max-w-md px-5 pb-24 pt-32 md:pt-40">
      <Seo title="Reset password | MEHR" robots="noindex" />
      <Reveal>
        <span className="label-xs text-muted-foreground">Account</span>
        <h1 className="font-display mt-4 text-4xl">Forgot your password?</h1>
        {sent ? (
          <p className="mt-5 text-sm leading-relaxed text-muted-foreground">
            If that email is on file, we've sent a reset link. Check your inbox — and spam, just in
            case.
          </p>
        ) : (
          <form
            className="mt-8 flex flex-col gap-7"
            onSubmit={(e) => {
              e.preventDefault();
              void submit();
            }}
          >
            <label className="block">
              <span className="label-xs text-muted-foreground">Email</span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-line mt-2"
                autoComplete="email"
              />
            </label>
            <button
              type="submit"
              disabled={!email.includes("@") || busy}
              className="label-xs bg-charcoal py-4 text-ivory disabled:opacity-40"
            >
              {busy ? "Sending…" : "Send reset link"}
            </button>
          </form>
        )}
        <Link to="/account/login" className="label-xs mt-10 block text-muted-foreground">
          Back to sign in
        </Link>
      </Reveal>
    </div>
  );
}
