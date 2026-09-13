import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { SlidersHorizontal, X } from "lucide-react";
import { ProductCard } from "@/components/shop/ProductCard";
import { Reveal } from "@/components/shared/Reveal";
import { colorsOf, fabricsOf, sizesOf, priceOf, type Product } from "@/services/catalog";
import { useCollections } from "@/store/catalog";
import { useLockBody } from "@/hooks/use-lock-body";

type Sort = "featured" | "newest" | "price-asc" | "price-desc";

const SORTS: { value: Sort; label: string }[] = [
  { value: "featured", label: "Featured" },
  { value: "newest", label: "Newest" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
];

type Filters = {
  sizes: string[];
  colors: string[];
  fabrics: string[];
  collections: string[];
  maxPrice: number;
};

const EMPTY: Filters = { sizes: [], colors: [], fabrics: [], collections: [], maxPrice: 60000 };

export function CollectionView({
  label,
  headline,
  line,
  image,
  items,
  loading = false,
}: {
  label: string;
  headline: string;
  line: string;
  image: string;
  items: Product[];
  loading?: boolean;
}) {
  const [sort, setSort] = useState<Sort>("featured");
  const [filters, setFilters] = useState<Filters>(EMPTY);
  const [sheetOpen, setSheetOpen] = useState(false);
  useLockBody(sheetOpen);
  const collections = useCollections();
  const allSizes = useMemo(() => sizesOf(items), [items]);
  const allColors = useMemo(() => colorsOf(items), [items]);
  const fabrics = useMemo(() => fabricsOf(items), [items]);

  const filtered = useMemo(() => {
    const list = items.filter((p) => {
      if (filters.sizes.length && !p.sizes.some((s) => filters.sizes.includes(s))) return false;
      if (filters.colors.length && !p.colors.some((c) => filters.colors.includes(c.name)))
        return false;
      if (filters.fabrics.length && !filters.fabrics.some((f) => p.fabric.startsWith(f)))
        return false;
      if (filters.collections.length && !filters.collections.includes(p.collection)) return false;
      if (priceOf(p) > filters.maxPrice) return false;
      return true;
    });
    const sorted = [...list];
    if (sort === "newest") sorted.sort((a, b) => Number(b.newArrival) - Number(a.newArrival));
    if (sort === "price-asc") sorted.sort((a, b) => priceOf(a) - priceOf(b));
    if (sort === "price-desc") sorted.sort((a, b) => priceOf(b) - priceOf(a));
    if (sort === "featured") sorted.sort((a, b) => Number(b.featured) - Number(a.featured));
    return sorted;
  }, [items, filters, sort]);

  const toggle = (group: keyof Omit<Filters, "maxPrice">, value: string) =>
    setFilters((f) => ({
      ...f,
      [group]: f[group].includes(value) ? f[group].filter((v) => v !== value) : [...f[group], value],
    }));

  const activeCount =
    filters.sizes.length +
    filters.colors.length +
    filters.fabrics.length +
    filters.collections.length +
    (filters.maxPrice < EMPTY.maxPrice ? 1 : 0);

  const panel = (
    <div className="flex flex-col gap-9">
      <FilterGroup title="Size">
        <div className="flex flex-wrap gap-2">
          {allSizes.map((s) => (
            <Chip key={s} active={filters.sizes.includes(s)} onClick={() => toggle("sizes", s)}>
              {s}
            </Chip>
          ))}
        </div>
      </FilterGroup>
      <FilterGroup title="Colour">
        <div className="flex flex-col gap-2.5">
          {allColors.map((c) => (
            <button
              key={c.name}
              onClick={() => toggle("colors", c.name)}
              className={`label-xs flex items-center gap-3 ${
                filters.colors.includes(c.name) ? "text-foreground" : "text-muted-foreground"
              }`}
            >
              <span
                className="h-3 w-3 rounded-full border border-border"
                style={{ backgroundColor: c.hex }}
              />
              {c.name}
            </button>
          ))}
        </div>
      </FilterGroup>
      <FilterGroup title="Fabric">
        <div className="flex flex-wrap gap-2">
          {fabrics.map((f) => (
            <Chip key={f} active={filters.fabrics.includes(f)} onClick={() => toggle("fabrics", f)}>
              {f}
            </Chip>
          ))}
        </div>
      </FilterGroup>
      <FilterGroup title="Collection">
        <div className="flex flex-wrap gap-2">
          {collections.map((c) => (
            <Chip
              key={c.slug}
              active={filters.collections.includes(c.slug)}
              onClick={() => toggle("collections", c.slug)}
            >
              {c.name}
            </Chip>
          ))}
        </div>
      </FilterGroup>
      <FilterGroup title={`Price up to PKR ${filters.maxPrice.toLocaleString()}`}>
        <input
          type="range"
          min={5000}
          max={60000}
          step={1000}
          value={filters.maxPrice}
          onChange={(e) => setFilters((f) => ({ ...f, maxPrice: Number(e.target.value) }))}
          className="w-full accent-[var(--burgundy)]"
          aria-label="Maximum price"
        />
      </FilterGroup>
      {activeCount > 0 && (
        <button className="label-xs w-fit border-b border-foreground pb-1" onClick={() => setFilters(EMPTY)}>
          Clear all
        </button>
      )}
    </div>
  );

  return (
    <div>
      {/* Editorial category hero — asymmetric, image right */}
      <section className="grid items-end gap-8 px-5 pt-32 md:grid-cols-12 md:gap-6 md:px-10 md:pt-40">
        <div className="md:col-span-6 md:pb-14">
          <Reveal>
            <span className="label-xs text-muted-foreground">{label}</span>
            <h1 className="font-display mt-6 whitespace-pre-line text-[clamp(2.75rem,7vw,5.5rem)] leading-[0.95]">
              {headline}
            </h1>
            <p className="mt-7 max-w-md text-sm leading-relaxed text-muted-foreground">{line}</p>
          </Reveal>
        </div>
        <div className="md:col-span-5 md:col-start-8">
          <Reveal delay={0.15}>
            <img
              src={image}
              alt={`${label} collection`}
              width={1408}
              height={1760}
              loading="eager"
              className="aspect-[4/5] w-full object-cover"
            />
          </Reveal>
        </div>
      </section>

      <div className="mt-24 flex items-center justify-between gap-6 border-y px-5 py-4 md:px-10">
        <div className="flex items-center gap-5">
          <button
            className="label-xs flex items-center gap-2 lg:hidden"
            onClick={() => setSheetOpen(true)}
          >
            <SlidersHorizontal className="h-3.5 w-3.5" strokeWidth={1.2} />
            Filters {activeCount > 0 && `(${activeCount})`}
          </button>
          <span className="label-xs hidden text-muted-foreground lg:block">
            {filtered.length} pieces
          </span>
        </div>
        <label className="label-xs flex items-center gap-3">
          <span className="text-muted-foreground">Sort</span>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as Sort)}
            className="label-xs bg-transparent outline-none"
          >
            {SORTS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="px-5 py-14 md:px-10 lg:grid lg:grid-cols-12 lg:gap-10">
        <aside className="hidden lg:col-span-2 lg:block">{panel}</aside>
        <div className="lg:col-span-10">
          {loading ? (
            <div className="grid grid-cols-2 gap-x-4 gap-y-14 md:grid-cols-3 md:gap-x-6 xl:grid-cols-4" aria-label="Loading pieces">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="aspect-[4/5] bg-cream" />
                  <div className="mt-4 h-3 w-3/4 bg-cream" />
                  <div className="mt-2 h-3 w-1/3 bg-cream" />
                </div>
              ))}
            </div>
          ) : items.length === 0 ? (
            <div className="py-24 text-center">
              <p className="font-display text-3xl">Nothing in this chapter yet</p>
              <p className="mt-3 text-sm text-muted-foreground">New pieces land in small runs. Check back soon.</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-24 text-center">
              <p className="font-display text-3xl">Nothing matches those filters</p>
              <button
                className="label-xs mt-6 border-b border-foreground pb-1"
                onClick={() => setFilters(EMPTY)}
              >
                Clear filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-x-4 gap-y-14 md:grid-cols-3 md:gap-x-6 xl:grid-cols-4">
              {filtered.map((p, i) => (
                <ProductCard key={p.id} product={p} index={i} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Mobile bottom sheet */}
      <AnimatePresence>
        {sheetOpen && (
          <motion.div
            className="fixed inset-0 z-[75] lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="absolute inset-0 bg-charcoal/40" onClick={() => setSheetOpen(false)} />
            <motion.div
              className="absolute inset-x-0 bottom-0 max-h-[85vh] overflow-y-auto bg-background px-6 pb-[max(2.5rem,env(safe-area-inset-bottom))] pt-5"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="mx-auto mb-6 h-1 w-12 bg-border" />
              <div className="mb-8 flex items-center justify-between">
                <span className="label-xs">Filters</span>
                <button type="button" aria-label="Close filters" className="flex h-11 w-11 items-center justify-center" onClick={() => setSheetOpen(false)}>
                  <X className="h-5 w-5" strokeWidth={1.2} />
                </button>
              </div>
              {panel}
              <button
                className="label-xs mt-10 w-full bg-charcoal py-4 text-ivory"
                onClick={() => setSheetOpen(false)}
              >
                Show {filtered.length} pieces
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function FilterGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <span className="label-xs text-muted-foreground">{title}</span>
      <div className="mt-4">{children}</div>
    </div>
  );
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`label-xs min-h-11 border px-3 py-2 transition-colors ${
        active ? "border-charcoal bg-charcoal text-ivory" : "border-border text-muted-foreground"
      }`}
    >
      {children}
    </button>
  );
}
