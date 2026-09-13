import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Seo } from "@/components/shared/Seo";
import { toast } from "sonner";
import { api } from "@/services/api";
import { Reveal } from "@/components/shared/Reveal";

export function Reset() {
  const [params] = useSearchParams();
  const token = params.get("token") ?? "";
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (password.length < 6 || !token || busy) return;
    setBusy(true);
    try {
      await api("/auth/reset", { method: "POST", body: JSON.stringify({ token, password }) });
      toast("Password updated. Sign in.");
      navigate("/account/login");
    } catch (error) {
      toast(error instanceof Error ? error.message : "That link has expired.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto max-w-md px-5 pb-24 pt-32 md:pt-40">
      <Seo title="New password | MEHR" robots="noindex" />
      <Reveal>
        <span className="label-xs text-muted-foreground">Account</span>
        <h1 className="font-display mt-4 text-4xl">Choose a new password.</h1>
        {!token ? (
          <p className="mt-5 text-sm text-muted-foreground">
            This link is missing a token. Request a new one from{" "}
            <Link to="/account/forgot" className="underline">
              forgot password
            </Link>
            .
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
              <span className="label-xs text-muted-foreground">New password</span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-line mt-2"
                autoComplete="new-password"
                placeholder="At least 6 characters"
              />
            </label>
            <button
              type="submit"
              disabled={password.length < 6 || busy}
              className="label-xs bg-charcoal py-4 text-ivory disabled:opacity-40"
            >
              {busy ? "Saving…" : "Update password"}
            </button>
          </form>
        )}
      </Reveal>
    </div>
  );
}
