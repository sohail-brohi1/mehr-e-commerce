import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "motion/react";
import { Search, X } from "lucide-react";
import { formatPKR, priceOf } from "@/services/catalog";
import { useProducts, useShop } from "@/store/shop";
import { useLockBody } from "@/hooks/use-lock-body";

const TRENDING = ["Ivory kurta", "Pashmina", "Organza", "Linen co-ord", "Kids frock"];

export function SearchOverlay() {
  const { searchOpen, setSearchOpen, recentSearches, rememberSearch } = useShop();
  const [q, setQ] = useState("");
  const products = useProducts();
  useLockBody(searchOpen);

  useEffect(() => {
    if (!searchOpen) setQ("");
  }, [searchOpen]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setSearchOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [setSearchOpen]);

  const results = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return products.filter((p) => p.featured).slice(0, 4);
    return products.filter((p) =>
      [p.name, p.category, p.collection, p.fabric, p.description]
        .join(" ")
        .toLowerCase()
        .includes(term),
    );
  }, [q, products]);

  return (
    <AnimatePresence>
      {searchOpen && (
        <motion.div
          className="fixed inset-0 z-[80] overflow-y-auto bg-background"
          initial={{ opacity: 0, y: -24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -24 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="mx-auto max-w-[1400px] px-5 py-8 md:px-10">
            <div className="flex items-center justify-between">
              <span className="label-xs text-muted-foreground">Search</span>
              <button
                type="button"
                aria-label="Close search"
                className="flex h-11 w-11 items-center justify-center"
                onClick={() => setSearchOpen(false)}
              >
                <X className="h-5 w-5" strokeWidth={1.2} />
              </button>
            </div>

            <div className="mt-10 flex items-center gap-4 border-b pb-4">
              <Search className="h-6 w-6 flex-none text-muted-foreground" strokeWidth={1.2} />
              <input
                autoFocus
                value={q}
                onChange={(e) => setQ(e.target.value)}
                onBlur={() => rememberSearch(q)}
                placeholder="Kurta, pashmina, organza…"
                className="font-display w-full bg-transparent text-3xl outline-none placeholder:text-muted-foreground md:text-5xl"
              />
            </div>

            <div className="mt-10 grid gap-10 md:grid-cols-12">
              <div className="label-xs flex flex-col gap-8 md:col-span-3">
                <div>
                  <span className="text-muted-foreground">Trending</span>
                  <div className="mt-4 flex flex-col gap-2.5">
                    {TRENDING.map((t) => (
                      <button key={t} className="w-fit text-left" onClick={() => setQ(t)}>
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
                {recentSearches.length > 0 && (
                  <div>
                    <span className="text-muted-foreground">Recent</span>
                    <div className="mt-4 flex flex-col gap-2.5">
                      {recentSearches.map((t) => (
                        <button key={t} className="w-fit text-left" onClick={() => setQ(t)}>
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                <div>
                  <span className="text-muted-foreground">Categories</span>
                  <div className="mt-4 flex flex-col gap-2.5">
                    {[
                      { to: "/women", label: "Women" },
                      { to: "/shawls", label: "Shawls" },
                      { to: "/kids", label: "Kids" },
                    ].map((c) => (
                      <Link key={c.to} to={c.to} onClick={() => setSearchOpen(false)}>
                        {c.label}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>

              <div className="md:col-span-9">
                <span className="label-xs text-muted-foreground">
                  {q ? `${results.length} result${results.length === 1 ? "" : "s"}` : "Popular now"}
                </span>
                {results.length === 0 ? (
                  <p className="font-display mt-8 text-2xl">
                    Nothing here yet. Try “shawl” or “linen”.
                  </p>
                ) : (
                  <div className="mt-5 grid grid-cols-2 gap-6 md:grid-cols-4">
                    {results.map((p) => (
                      <Link
                        key={p.id}
                        to={`/products/${p.slug}`}
                        onClick={() => {
                          rememberSearch(q);
                          setSearchOpen(false);
                        }}
                        className="group"
                      >
                        <img
                          src={p.images[0]}
                          alt={p.name}
                          width={1200}
                          height={1500}
                          loading="lazy"
                          className="aspect-[4/5] w-full object-cover transition-transform duration-[1200ms] group-hover:scale-[1.03]"
                        />
                        <span className="mt-3 block text-sm">{p.name}</span>
                        <span className="text-sm text-muted-foreground">
                          {formatPKR(priceOf(p))}
                        </span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
