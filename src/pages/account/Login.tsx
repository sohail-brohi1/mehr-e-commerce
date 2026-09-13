import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Seo } from "@/components/shared/Seo";
import { toast } from "sonner";
import { Reveal } from "@/components/shared/Reveal";
import { editorial } from "@/services/catalog";
import { useShop } from "@/store/shop";
import { Logo } from "@/components/layout/Logo";

type Mode = "signin" | "register";

function safeNext(raw: string | null) {
  if (!raw || !raw.startsWith("/") || raw.startsWith("//") || raw.includes("\\")) return "/account";
  return raw;
}

export function Login() {
  const { user, authReady, signIn, signUp } = useShop();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const next = safeNext(params.get("next"));
  const [mode, setMode] = useState<Mode>(params.get("mode") === "register" ? "register" : "signin");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setMode(params.get("mode") === "register" ? "register" : "signin");
  }, [params]);

  useEffect(() => {
    if (authReady && user) navigate(next);
  }, [authReady, user, navigate, next]);

  const valid =
    email.includes("@") && password.length >= 6 && (mode === "signin" || name.trim().length > 1);

  const submit = async () => {
    if (!valid || busy) return;
    setBusy(true);
    try {
      if (mode === "signin") {
        await signIn(email.trim(), password);
        toast("Welcome back");
      } else {
        await signUp({
          name: name.trim(),
          email: email.trim(),
          password,
          ...(phone.trim() ? { phone: phone.trim() } : {}),
        });
        toast("Account created — you're in.");
      }
      navigate(next);
    } catch (error) {
      toast(error instanceof Error ? error.message : "Something went wrong. Try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="grid min-h-[100svh] lg:grid-cols-2">
      <Seo
        title="Sign In | MEHR"
        description="Sign in to track your MEHR orders, save pieces and check out faster."
        robots="noindex"
      />
      <div className="relative hidden lg:block">
        <img
          src={editorial.women}
          alt="Model in an ivory embroidered kurta"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-charcoal/25" />
        <p className="font-display absolute bottom-14 left-10 max-w-sm text-3xl leading-tight text-ivory">
          Made in runs of forty or fewer, so the hand stays visible.
        </p>
      </div>

      <div className="flex items-center px-5 pb-16 pt-32 md:px-16">
        <Reveal className="w-full max-w-md">
          <Link to="/" aria-label="MEHR home" className="text-3xl">
            <Logo />
          </Link>
          <span className="label-xs mt-10 block text-muted-foreground">
            {mode === "signin" ? "Account" : "Join MEHR"}
          </span>
          <h1 className="font-display mt-4 text-4xl md:text-5xl">
            {mode === "signin" ? "Welcome back." : "Create your account."}
          </h1>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
            Track orders, save pieces to your wishlist and check out in a tap.
          </p>

          <form
            className="mt-10 flex flex-col gap-7"
            onSubmit={(e) => {
              e.preventDefault();
              void submit();
            }}
          >
            {mode === "register" && (
              <>
                <label className="block">
                  <span className="label-xs text-muted-foreground">Full name</span>
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="input-line mt-2"
                    autoComplete="name"
                    placeholder="Ayesha Khan"
                  />
                </label>
                <label className="block">
                  <span className="label-xs text-muted-foreground">Phone (optional)</span>
                  <input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="input-line mt-2"
                    autoComplete="tel"
                    placeholder="03XX XXXXXXX"
                  />
                </label>
              </>
            )}
            <label className="block">
              <span className="label-xs text-muted-foreground">Email</span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-line mt-2"
                autoComplete="email"
                placeholder="you@example.com"
              />
            </label>
            <label className="block">
              <span className="label-xs text-muted-foreground">Password</span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-line mt-2"
                autoComplete={mode === "signin" ? "current-password" : "new-password"}
                placeholder="At least 6 characters"
              />
            </label>
            <button
              type="submit"
              disabled={!valid || busy}
              className="label-xs bg-charcoal py-4 text-ivory transition-colors hover:bg-espresso disabled:cursor-not-allowed disabled:opacity-40"
            >
              {busy ? "One moment…" : mode === "signin" ? "Sign in" : "Create account"}
            </button>
          </form>

          {mode === "signin" && (
            <Link to="/account/forgot" className="label-xs mt-6 block text-muted-foreground">
              Forgot password?
            </Link>
          )}

          <button
            onClick={() => setMode((m) => (m === "signin" ? "register" : "signin"))}
            className="label-xs mt-8 text-muted-foreground transition-colors hover:text-foreground"
          >
            {mode === "signin" ? "New here? Create an account" : "Already have an account? Sign in"}
          </button>

          <Link to="/" className="label-xs mt-12 block text-muted-foreground">
            Back to shopping
          </Link>
        </Reveal>
      </div>
    </div>
  );
}
