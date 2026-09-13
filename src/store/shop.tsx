import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api, clearToken, getToken, setToken } from "@/services/api";
import { priceOf, type Product } from "@/services/catalog";
import { useProducts } from "@/store/catalog";

export { useProducts } from "@/store/catalog";

export type CartLine = {
  key: string;
  productId: string;
  size: string;
  color: string;
  qty: number;
};

export type OrderStatus =
  | "Pending"
  | "Confirmed"
  | "Processing"
  | "Shipped"
  | "Delivered"
  | "Cancelled";

export const ORDER_FLOW: OrderStatus[] = [
  "Pending",
  "Confirmed",
  "Processing",
  "Shipped",
  "Delivered",
];

export type PaymentMethod = "cod" | "card" | "wallet" | "bank";

export type OrderItem = {
  id: string;
  productId: string | null;
  productName: string;
  productSlug: string | null;
  imageUrl: string | null;
  size: string;
  color: string;
  qty: number;
  unitPrice: number;
};

export type Order = {
  id: string;
  orderNumber: string;
  createdAt: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  addressLine1: string;
  city: string;
  postalCode: string;
  subtotal: number;
  shipping: number;
  total: number;
  paymentMethod: PaymentMethod;
  paymentStatus: "unpaid" | "paid" | "pending" | "failed" | "refunded";
  paymentReference: string | null;
  status: OrderStatus;
  notes?: string;
  isGuest?: boolean;
  items: OrderItem[];
};

export type OrderDraft = {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  addressLine1: string;
  city: string;
  postalCode: string;
  shipping: number;
  paymentMethod: PaymentMethod;
  paymentStatus: Order["paymentStatus"];
  paymentReference?: string;
};

export type AuthUser = { id: string; name: string; email: string; phone: string; isAdmin: boolean };

type ShopState = {
  cart: CartLine[];
  wishlist: string[];
  recentSearches: string[];
  user: AuthUser | null;
  isAdmin: boolean;
  hydrated: boolean;
  authReady: boolean;
  cartOpen: boolean;
  searchOpen: boolean;
  addToCart: (p: Product, size: string, color: string, qty?: number) => void;
  setQty: (key: string, qty: number) => void;
  removeLine: (key: string) => void;
  clearCart: () => void;
  toggleWishlist: (id: string) => void;
  isWishlisted: (id: string) => boolean;
  rememberSearch: (q: string) => void;
  placeOrder: (draft: OrderDraft, opts?: { keepCart?: boolean }) => Promise<Order>;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (input: { name: string; email: string; password: string; phone?: string }) => Promise<void>;
  updateProfile: (input: { name: string; phone: string }) => Promise<void>;
  signOut: () => Promise<void>;
  setCartOpen: (v: boolean) => void;
  setSearchOpen: (v: boolean) => void;
  subtotal: number;
  count: number;
};

const ShopContext = createContext<ShopState | null>(null);

const KEY = "mehr.shop.v2";

type Persisted = { cart: CartLine[]; wishlist: string[]; recentSearches: string[] };

export function ShopProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartLine[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const products = useProducts();
  const queryClient = useQueryClient();

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const p = JSON.parse(raw) as Partial<Persisted>;
        setCart(p.cart ?? []);
        setWishlist(p.wishlist ?? []);
        setRecentSearches(p.recentSearches ?? []);
      }
    } catch {
      /* ignore corrupt storage */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(KEY, JSON.stringify({ cart, wishlist, recentSearches }));
  }, [cart, wishlist, recentSearches, hydrated]);

  useEffect(() => {
    let active = true;
    const token = getToken();
    if (!token) {
      setAuthReady(true);
      return;
    }
    api<{ user: AuthUser }>("/auth/me")
      .then(({ user: next }) => {
        if (active) setUser(next);
      })
      .catch(() => {
        clearToken();
        if (active) setUser(null);
      })
      .finally(() => {
        if (active) setAuthReady(true);
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!hydrated || !authReady) return;
    let active = true;
    api<{ productIds: string[] }>("/wishlist")
      .then(({ productIds }) => {
        if (!active) return;
        setWishlist((prev) => {
          const merged = [...new Set([...prev, ...productIds])];
          if (merged.length !== productIds.length || merged.some((id) => !productIds.includes(id))) {
            void api("/wishlist", { method: "PUT", body: JSON.stringify({ productIds: merged }) }).catch(
              () => undefined,
            );
          }
          return merged;
        });
      })
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, [hydrated, authReady, user?.id]);

  const addToCart = useCallback((p: Product, size: string, color: string, qty = 1) => {
    const key = `${p.id}-${size}-${color}`;
    setCart((prev) => {
      const existing = prev.find((l) => l.key === key);
      if (existing)
        return prev.map((l) => (l.key === key ? { ...l, qty: Math.min(l.qty + qty, 10) } : l));
      return [...prev, { key, productId: p.id, size, color, qty }];
    });
    setCartOpen(true);
  }, []);

  const setQty = useCallback((key: string, qty: number) => {
    setCart((prev) =>
      qty <= 0
        ? prev.filter((l) => l.key !== key)
        : prev.map((l) => (l.key === key ? { ...l, qty: Math.min(qty, 10) } : l)),
    );
  }, []);

  const removeLine = useCallback(
    (key: string) => setCart((prev) => prev.filter((l) => l.key !== key)),
    [],
  );

  const toggleWishlist = useCallback((id: string) => {
    setWishlist((prev) => {
      const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id];
      void api("/wishlist", { method: "PUT", body: JSON.stringify({ productIds: next }) }).catch(() => {
        /* keep the heart local even if the server is briefly unreachable */
      });
      return next;
    });
  }, []);

  const rememberSearch = useCallback((q: string) => {
    const term = q.trim();
    if (term.length < 2) return;
    setRecentSearches((prev) => [term, ...prev.filter((x) => x !== term)].slice(0, 6));
  }, []);

  const subtotal = useMemo(
    () =>
      cart.reduce((sum, line) => {
        const p = products.find((x) => x.id === line.productId);
        return p ? sum + priceOf(p) * line.qty : sum;
      }, 0),
    [cart, products],
  );

  const count = useMemo(() => cart.reduce((n, l) => n + l.qty, 0), [cart]);

  const placeOrder = useCallback(
    async (draft: OrderDraft, opts?: { keepCart?: boolean }): Promise<Order> => {
      const order = await api<Order>("/orders", {
        method: "POST",
        body: JSON.stringify({
          ...draft,
          items: cart.map((line) => ({
            productId: line.productId,
            size: line.size,
            color: line.color,
            qty: line.qty,
          })),
        }),
      });
      if (!opts?.keepCart) setCart([]);
      void queryClient.invalidateQueries({ queryKey: ["orders"] });
      void queryClient.invalidateQueries({ queryKey: ["products"] });
      return order;
    },
    [cart, queryClient],
  );

  const signIn = useCallback(async (email: string, password: string) => {
    const data = await api<{ token: string; user: AuthUser }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    setToken(data.token);
    setUser(data.user);
    void queryClient.invalidateQueries({ queryKey: ["orders"] });
  }, [queryClient]);

  const signUp = useCallback(
    async (input: { name: string; email: string; password: string; phone?: string }) => {
      const data = await api<{ token: string; user: AuthUser }>("/auth/register", {
        method: "POST",
        body: JSON.stringify(input),
      });
      setToken(data.token);
      setUser(data.user);
      void queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
    [queryClient],
  );

  const signOut = useCallback(async () => {
    clearToken();
    setUser(null);
    queryClient.removeQueries({ queryKey: ["orders"] });
  }, [queryClient]);

  const updateProfile = useCallback(async (input: { name: string; phone: string }) => {
    const data = await api<{ user: AuthUser }>("/auth/me", {
      method: "PATCH",
      body: JSON.stringify(input),
    });
    setUser(data.user);
  }, []);

  const value: ShopState = {
    cart,
    wishlist,
    recentSearches,
    user,
    isAdmin: Boolean(user?.isAdmin),
    hydrated,
    authReady,
    cartOpen,
    searchOpen,
    addToCart,
    setQty,
    removeLine,
    clearCart: () => setCart([]),
    toggleWishlist,
    isWishlisted: (id) => wishlist.includes(id),
    rememberSearch,
    placeOrder,
    signIn,
    signUp,
    updateProfile,
    signOut,
    setCartOpen,
    setSearchOpen,
    subtotal,
    count,
  };

  return <ShopContext.Provider value={value}>{children}</ShopContext.Provider>;
}

export function useShop() {
  const ctx = useContext(ShopContext);
  if (!ctx) throw new Error("useShop must be used inside ShopProvider");
  return ctx;
}

export function useMyOrders() {
  const { user, authReady } = useShop();
  return useQuery({
    queryKey: ["orders", "mine", user?.id ?? "guest"],
    enabled: authReady,
    queryFn: () => api<Order[]>("/orders/mine"),
  });
}

export function useAllOrders(enabled: boolean) {
  return useQuery({
    queryKey: ["orders", "all"],
    enabled,
    queryFn: () => api<Order[]>("/orders"),
  });
}

export async function updateOrderStatus(orderId: string, status: OrderStatus) {
  await api("/orders/" + orderId + "/status", {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}

export async function updatePaymentStatus(orderId: string, paymentStatus: Order["paymentStatus"]) {
  await api("/orders/" + orderId + "/payment", {
    method: "PATCH",
    body: JSON.stringify({ paymentStatus }),
  });
}

export async function updateOrderNotes(orderId: string, notes: string) {
  await api("/orders/" + orderId + "/notes", {
    method: "PATCH",
    body: JSON.stringify({ notes }),
  });
}
