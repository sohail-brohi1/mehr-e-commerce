import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "motion/react";
import { Minus, Plus, X } from "lucide-react";
import { formatPKR, priceOf } from "@/services/catalog";
import { useProducts, useShop } from "@/store/shop";
import { useLockBody } from "@/hooks/use-lock-body";

export function CartDrawer() {
  const { cart, cartOpen, setCartOpen, setQty, removeLine, subtotal } = useShop();
  const all = useProducts();
  const products = all;
  useLockBody(cartOpen);

  const recommendations = all
    .filter((p) => p.featured && !cart.some((l) => l.productId === p.id))
    .slice(0, 3);

  return (
    <AnimatePresence>
      {cartOpen && (
        <motion.div
          className="fixed inset-0 z-[70]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="absolute inset-0 bg-charcoal/40" onClick={() => setCartOpen(false)} />
          <motion.aside
            className="absolute inset-y-0 right-0 flex w-full max-w-md flex-col bg-background"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="flex items-center justify-between border-b px-6 py-5">
              <span className="label-xs">Your bag ({cart.length})</span>
              <button
                type="button"
                aria-label="Close bag"
                className="flex h-11 w-11 items-center justify-center"
                onClick={() => setCartOpen(false)}
              >
                <X className="h-5 w-5" strokeWidth={1.2} />
              </button>
            </div>

            <div className="no-scrollbar flex-1 overflow-y-auto px-6">
              {cart.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center text-center">
                  <p className="font-display text-3xl">Your bag is empty</p>
                  <p className="mt-3 text-sm text-muted-foreground">
                    Everything begins with one piece.
                  </p>
                  <Link
                    to="/new-arrivals"
                    onClick={() => setCartOpen(false)}
                    className="label-xs mt-8 border-b border-foreground pb-1"
                  >
                    Explore new arrivals
                  </Link>
                </div>
              ) : (
                <ul className="divide-y">
                  <AnimatePresence initial={false}>
                    {cart.map((line) => {
                      const p = products.find((x) => x.id === line.productId);
                      if (!p) return null;
                      return (
                        <motion.li
                          key={line.key}
                          layout
                          initial={{ opacity: 0, y: 12 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                          className="flex gap-4 py-5"
                        >
                          <img
                            src={p.images[0]}
                            alt={p.name}
                            width={1200}
                            height={1500}
                            loading="lazy"
                            className="h-32 w-24 flex-none object-cover"
                          />
                          <div className="flex flex-1 flex-col">
                            <div className="flex justify-between gap-3">
                              <span className="text-sm">{p.name}</span>
                              <button
                                aria-label="Remove"
                                onClick={() => removeLine(line.key)}
                                className="text-muted-foreground hover:text-foreground"
                              >
                                <X className="h-3.5 w-3.5" strokeWidth={1.2} />
                              </button>
                            </div>
                            <span className="label-xs mt-1 text-muted-foreground">
                              {line.color} · {line.size}
                            </span>
                            <div className="mt-auto flex items-center justify-between">
                              <div className="flex items-center border">
                                <button
                                  aria-label="Decrease"
                                  className="flex h-11 w-11 items-center justify-center"
                                  onClick={() => setQty(line.key, line.qty - 1)}
                                >
                                  <Minus className="h-3 w-3" strokeWidth={1.2} />
                                </button>
                                <span className="w-7 text-center text-xs">{line.qty}</span>
                                <button
                                  aria-label="Increase"
                                  className="flex h-11 w-11 items-center justify-center"
                                  onClick={() => setQty(line.key, line.qty + 1)}
                                >
                                  <Plus className="h-3 w-3" strokeWidth={1.2} />
                                </button>
                              </div>
                              <span className="text-sm">{formatPKR(priceOf(p) * line.qty)}</span>
                            </div>
                          </div>
                        </motion.li>
                      );
                    })}
                  </AnimatePresence>
                </ul>
              )}

              {cart.length > 0 && (
                <div className="border-t py-6">
                  <span className="label-xs text-muted-foreground">You may also like</span>
                  <div className="mt-4 grid grid-cols-3 gap-3">
                    {recommendations.map((p) => (
                      <Link
                        key={p.id}
                        to={`/products/${p.slug}`}
                        onClick={() => setCartOpen(false)}
                        className="group"
                      >
                        <img
                          src={p.images[0]}
                          alt={p.name}
                          width={1200}
                          height={1500}
                          loading="lazy"
                          className="aspect-[4/5] w-full object-cover"
                        />
                        <span className="mt-2 block text-[0.7rem] leading-tight text-muted-foreground group-hover:text-foreground">
                          {p.name}
                        </span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {cart.length > 0 && (
              <div className="border-t px-6 py-6 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
                <div className="flex items-center justify-between text-sm">
                  <span className="label-xs">Subtotal</span>
                  <span>{formatPKR(subtotal)}</span>
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  Shipping and taxes calculated at checkout.
                </p>
                <Link
                  to="/checkout"
                  onClick={() => setCartOpen(false)}
                  className="label-xs mt-5 block bg-charcoal py-4 text-center text-ivory transition-colors hover:bg-espresso"
                >
                  Checkout
                </Link>
              </div>
            )}
          </motion.aside>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
