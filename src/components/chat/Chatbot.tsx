import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "motion/react";
import { MessageCircle, Send, X } from "lucide-react";
import { api } from "@/services/api";
import { formatPKR } from "@/services/catalog";
import { useLockBody } from "@/hooks/use-lock-body";
import { useShop } from "@/store/shop";
import { LogoMark } from "@/components/layout/Logo";

type ChatLink = { label: string; href: string };
type ChatProduct = {
  name: string;
  slug: string;
  price: number;
  salePrice?: number;
  image: string | null;
  category: string;
};
type Msg = {
  role: "user" | "assistant";
  content: string;
  links?: ChatLink[];
  products?: ChatProduct[];
};

const GREETING: Msg = {
  role: "assistant",
  content:
    "I'm the atelier desk. Shipping, sizes, try-on, payments, exchanges, the house — ask in English or Roman Urdu.",
  links: [
    { label: "Women", href: "/women" },
    { label: "Try on", href: "/try-on" },
    { label: "Shipping", href: "/shipping" },
  ],
};

const SUGGESTIONS = [
  "Where do you ship?",
  "How do exchanges work?",
  "Can I try a piece on?",
  "Do you take JazzCash?",
  "Tell me about Noor",
];

const STORAGE = "mehr.chat";

export function Chatbot() {
  const pathname = useLocation().pathname;
  const { cartOpen, searchOpen } = useShop();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([GREETING]);
  const scroller = useRef<HTMLDivElement>(null);
  const field = useRef<HTMLInputElement>(null);

  const hidden = pathname.startsWith("/admin") || cartOpen || searchOpen;
  const lift = pathname.startsWith("/products/");
  useLockBody(open && !hidden);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(STORAGE);
      if (!raw) return;
      const saved = JSON.parse(raw) as Msg[];
      if (Array.isArray(saved) && saved.length) setMessages(saved);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    sessionStorage.setItem(STORAGE, JSON.stringify(messages.slice(-20)));
  }, [messages]);

  useEffect(() => {
    scroller.current?.scrollTo({ top: scroller.current.scrollHeight, behavior: "smooth" });
  }, [messages, open, busy]);

  useEffect(() => {
    if (open) field.current?.focus();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const send = async (text: string) => {
    const content = text.trim().slice(0, 500);
    if (!content || busy) return;
    const next = [...messages, { role: "user" as const, content }];
    setMessages(next);
    setInput("");
    setBusy(true);
    try {
      const data = await api<{ reply: string; links: ChatLink[]; products: ChatProduct[] }>("/chat", {
        method: "POST",
        body: JSON.stringify({
          messages: next.map((m) => ({ role: m.role, content: m.content })),
        }),
      });
      setMessages([
        ...next,
        {
          role: "assistant",
          content: data.reply,
          links: data.links,
          products: data.products,
        },
      ]);
    } catch (error) {
      setMessages([
        ...next,
        {
          role: "assistant",
          content:
            error instanceof Error
              ? error.message
              : "The desk is quiet for a moment. Try again, or write hello@mehr.pk.",
          links: [{ label: "Contact", href: "/contact" }],
        },
      ]);
    } finally {
      setBusy(false);
    }
  };

  if (hidden) return null;

  return (
    <div
      className={`pointer-events-none fixed inset-x-0 bottom-0 z-[65] flex justify-end px-4 pt-4 lg:p-6 ${
        lift ? "pb-24 lg:pb-6" : "pb-[max(1rem,env(safe-area-inset-bottom))]"
      }`}
    >
      <div className="pointer-events-auto flex flex-col items-end gap-3">
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 12 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="mb-1 flex h-[min(32rem,calc(100dvh-10.5rem))] w-[min(24rem,calc(100vw-2rem))] flex-col border border-border bg-ivory shadow-editorial lg:h-[min(36rem,calc(100dvh-7rem))]"
              role="dialog"
              aria-label="MEHR atelier desk"
            >
              <div className="flex items-start justify-between gap-4 border-b px-5 py-4">
                <div className="flex items-center gap-3">
                  <LogoMark className="h-8 w-8" />
                  <div>
                    <span className="label-xs text-muted-foreground">Atelier desk</span>
                    <p className="font-display mt-1 text-2xl">Ask MEHR.</p>
                  </div>
                </div>
                <button type="button" onClick={() => setOpen(false)} aria-label="Close chat" className="mt-1">
                  <X className="h-4 w-4" strokeWidth={1.4} />
                </button>
              </div>

              <div ref={scroller} className="flex-1 overflow-y-auto px-5 py-4">
                <ul className="flex flex-col gap-5">
                  {messages.map((m, i) => (
                    <li key={`${m.role}-${i}`} className={m.role === "user" ? "ml-8" : "mr-4"}>
                      {m.role === "assistant" && (
                        <span className="label-xs mb-2 flex items-center gap-1.5 text-muted-foreground">
                          <LogoMark className="h-3.5 w-3.5" />
                          Desk
                        </span>
                      )}
                      <p
                        className={`text-sm leading-relaxed ${
                          m.role === "user" ? "border border-border bg-cream px-4 py-3" : "text-foreground"
                        }`}
                      >
                        {m.content}
                      </p>
                      {m.products && m.products.length > 0 && (
                        <ul className="mt-3 flex flex-col gap-2">
                          {m.products.map((p) => (
                            <li key={p.slug}>
                              <Link
                                to={`/products/${p.slug}`}
                                onClick={() => setOpen(false)}
                                className="flex gap-3 border bg-cream p-2 transition-colors hover:border-espresso"
                              >
                                {p.image ? (
                                  <img src={p.image} alt="" className="h-16 w-12 flex-none object-cover" />
                                ) : (
                                  <span className="h-16 w-12 flex-none bg-beige" />
                                )}
                                <span className="min-w-0 py-1">
                                  <span className="block truncate text-sm">{p.name}</span>
                                  <span className="label-xs mt-1 block text-muted-foreground">
                                    {formatPKR(p.salePrice ?? p.price)}
                                  </span>
                                </span>
                              </Link>
                            </li>
                          ))}
                        </ul>
                      )}
                      {m.links && m.links.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {m.links.map((l) =>
                            l.href.startsWith("mailto:") ? (
                              <a key={l.href} href={l.href} className="label-xs border border-border px-3 py-2">
                                {l.label}
                              </a>
                            ) : (
                              <Link
                                key={l.href}
                                to={l.href}
                                onClick={() => setOpen(false)}
                                className="label-xs border border-border px-3 py-2 transition-colors hover:border-espresso"
                              >
                                {l.label}
                              </Link>
                            ),
                          )}
                        </div>
                      )}
                    </li>
                  ))}
                  {busy && (
                    <li className="label-xs text-muted-foreground">Looking through the house…</li>
                  )}
                </ul>
                {messages.length < 3 && (
                  <div className="mt-6 flex flex-wrap gap-2">
                    {SUGGESTIONS.map((s) => (
                      <button
                        key={s}
                        type="button"
                        disabled={busy}
                        onClick={() => void send(s)}
                        className="label-xs border border-border px-3 py-2 text-left text-muted-foreground transition-colors hover:border-espresso hover:text-foreground"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <form
                className="flex items-end gap-2 border-t px-4 py-3"
                onSubmit={(e) => {
                  e.preventDefault();
                  void send(input);
                }}
              >
                <label className="sr-only" htmlFor="mehr-chat">
                  Ask the atelier
                </label>
                <input
                  id="mehr-chat"
                  ref={field}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask about a piece, shipping, size…"
                  maxLength={500}
                  className="input-line min-h-11 flex-1 border-0 py-2"
                />
                <button
                  type="submit"
                  disabled={busy || !input.trim()}
                  aria-label="Send"
                  className="flex h-11 w-11 flex-none items-center justify-center bg-charcoal text-ivory disabled:opacity-40"
                >
                  <Send className="h-4 w-4" strokeWidth={1.4} />
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls="mehr-chat"
          className="label-xs flex min-h-12 items-center gap-2 bg-charcoal px-5 py-3.5 text-ivory shadow-editorial transition-colors hover:bg-espresso"
        >
          {open ? (
            <>
              <X className="h-4 w-4" strokeWidth={1.4} />
              Close
            </>
          ) : (
            <>
              <MessageCircle className="h-4 w-4" strokeWidth={1.4} />
              Ask MEHR
            </>
          )}
        </button>
      </div>
    </div>
  );
}
