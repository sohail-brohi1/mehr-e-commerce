import { useState } from "react";
import { Seo } from "@/components/shared/Seo";
import { Reveal } from "@/components/shared/Reveal";
import { toast } from "sonner";
import { api } from "@/services/api";

export function Contact() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const valid = name.trim().length > 1 && email.includes("@") && message.trim().length > 8;

  const send = async () => {
    if (!valid || busy) return;
    setBusy(true);
    try {
      await api("/contact", {
        method: "POST",
        body: JSON.stringify({ name: name.trim(), email: email.trim(), message: message.trim() }),
      });
      toast("Message sent — we'll write back.");
      setName("");
      setEmail("");
      setMessage("");
    } catch (error) {
      toast(error instanceof Error ? error.message : "Couldn't send that. Try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="px-5 pb-20 pt-32 md:px-10 md:pt-40">
      <Seo
        title="Contact | MEHR"
        description="Write to the MEHR atelier in Lahore — orders, studio access, press."
      />
      <div className="grid gap-14 lg:grid-cols-12">
        <Reveal className="lg:col-span-5">
          <span className="label-xs text-muted-foreground">Atelier</span>
          <h1 className="font-display mt-5 text-[clamp(2.5rem,7vw,5rem)] leading-[0.95]">
            Write to us.
          </h1>
          <p className="mt-6 max-w-md text-sm leading-relaxed text-muted-foreground">
            Orders, exchanges, press and studio access. We reply on working days, usually within a
            few hours.
          </p>
          <div className="label-xs mt-10 flex flex-col gap-3 text-muted-foreground">
            <span>Lahore, Pakistan</span>
            <a href="mailto:hello@mehr.pk" className="rule-link w-fit text-foreground">
              hello@mehr.pk
            </a>
            <a href="tel:+923001234567" className="rule-link w-fit text-foreground">
              +92 300 1234567
            </a>
            <span>Sun–Thu, 11:00–18:00 PKT</span>
          </div>
        </Reveal>
        <form
          className="flex flex-col gap-7 lg:col-span-6 lg:col-start-7"
          onSubmit={(e) => {
            e.preventDefault();
            void send();
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
            <span className="label-xs text-muted-foreground">Email</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-line mt-2"
              autoComplete="email"
            />
          </label>
          <label className="block">
            <span className="label-xs text-muted-foreground">Message</span>
            <textarea
              rows={5}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="input-line mt-2 resize-none"
            />
          </label>
          <button
            type="submit"
            disabled={!valid || busy}
            className="label-xs bg-charcoal py-4 text-ivory transition-colors hover:bg-espresso disabled:opacity-40"
          >
            {busy ? "Sending…" : "Send"}
          </button>
        </form>
      </div>
    </div>
  );
}
