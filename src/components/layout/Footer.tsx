import { useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { api } from "@/services/api";
import { Logo } from "@/components/layout/Logo";

export function Footer() {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);

  const subscribe = async () => {
    if (!email.includes("@") || busy) return;
    setBusy(true);
    try {
      await api("/newsletter", { method: "POST", body: JSON.stringify({ email: email.trim() }) });
      toast("You're on the list.");
      setEmail("");
    } catch (error) {
      toast(error instanceof Error ? error.message : "Couldn't subscribe just now.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <footer className="mt-24 border-t bg-cream px-5 py-16 pb-[max(5.5rem,env(safe-area-inset-bottom))] md:mt-32 md:px-10 md:pb-16">
      <div className="mx-auto max-w-[1600px] md:grid md:grid-cols-12 md:gap-10">
        <div className="md:col-span-5">
          <Link to="/" aria-label="MEHR home" className="inline-block text-3xl md:text-4xl">
            <Logo caption />
          </Link>
          <p className="font-display mt-8 text-4xl leading-[1.05] md:text-5xl">
            Tradition,
            <br />
            reimagined.
          </p>
          <p className="mt-6 max-w-sm text-sm leading-relaxed text-muted-foreground">
            MEHR is a Pakistani fashion house working with pit-loom weavers and hand-embroiderers in
            Lahore, Multan and Kashmir.
          </p>
          <form
            className="mt-8 max-w-sm"
            onSubmit={(e) => {
              e.preventDefault();
              void subscribe();
            }}
          >
            <span className="label-xs text-muted-foreground">New runs, once in a while</span>
            <div className="mt-3 flex gap-2 border-b">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="input-line flex-1 border-0 py-3"
                autoComplete="email"
              />
              <button
                type="submit"
                disabled={busy || !email.includes("@")}
                className="label-xs flex-none py-3 text-foreground disabled:opacity-40"
              >
                {busy ? "…" : "Join"}
              </button>
            </div>
          </form>
        </div>
        <div className="label-xs mt-12 grid grid-cols-2 gap-8 sm:grid-cols-3 md:col-span-6 md:col-start-7 md:mt-0">
          <div className="flex flex-col gap-3">
            <span className="text-muted-foreground">Shop</span>
            <Link to="/women" className="rule-link w-fit">
              Women
            </Link>
            <Link to="/shawls" className="rule-link w-fit">
              Shawls
            </Link>
            <Link to="/kids" className="rule-link w-fit">
              Kids
            </Link>
            <Link to="/new-arrivals" className="rule-link w-fit">
              New Arrivals
            </Link>
            <Link to="/collections" className="rule-link w-fit">
              Collections
            </Link>
          </div>
          <div className="flex flex-col gap-3">
            <span className="text-muted-foreground">House</span>
            <Link to="/about" className="rule-link w-fit">
              About
            </Link>
            <Link to="/contact" className="rule-link w-fit">
              Contact
            </Link>
            <Link to="/shipping" className="rule-link w-fit">
              Shipping
            </Link>
            <Link to="/returns" className="rule-link w-fit">
              Exchanges
            </Link>
            <Link to="/track" className="rule-link w-fit">
              Track order
            </Link>
          </div>
          <div className="flex flex-col gap-3">
            <span className="text-muted-foreground">You</span>
            <Link to="/account" className="rule-link w-fit">
              Account
            </Link>
            <Link to="/wishlist" className="rule-link w-fit">
              Wishlist
            </Link>
            <Link to="/privacy" className="rule-link w-fit">
              Privacy
            </Link>
            <Link to="/admin" className="rule-link w-fit">
              Studio
            </Link>
          </div>
        </div>
      </div>
      <div className="label-xs mx-auto mt-16 flex max-w-[1600px] flex-col gap-2 border-t pt-6 text-muted-foreground md:flex-row md:justify-between">
        <span>© {new Date().getFullYear()} MEHR — Lahore, Pakistan</span>
        <span>Cash on delivery · Nationwide shipping</span>
      </div>
    </footer>
  );
}
