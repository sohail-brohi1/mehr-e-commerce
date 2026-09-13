import hero from "@/assets/hero.jpg";
import editorialWomen from "@/assets/editorial-women.jpg";
import editorialShawls from "@/assets/editorial-shawls.jpg";
import editorialKids from "@/assets/editorial-kids.jpg";

export const editorial = {
  hero,
  women: editorialWomen,
  shawls: editorialShawls,
  kids: editorialKids,
};

/** Category slugs map 1:1 to storefront routes. */
export type CategorySlug = "women" | "kids" | "shawls";

export type ColorOption = { name: string; hex: string };

/** Shape used across the storefront; rows come from the products table. */
export type Product = {
  id: string;
  name: string;
  slug: string;
  sku: string;
  description: string;
  story: string;
  price: number;
  salePrice?: number;
  category: CategorySlug;
  /** collection slug */
  collection: string;
  sizes: string[];
  colors: ColorOption[];
  /** display URLs */
  images: string[];
  /** stored object paths, used by the studio editor */
  imagePaths: string[];
  /** frames for the drag-to-rotate 360 viewer; falls back to images when empty */
  frames360?: string[];
  frames360Paths?: string[];
  modelUrl?: string;
  modelPath?: string;
  sizeGuideUrl?: string;
  sizeGuidePath?: string;
  fabric: string;
  fit: string;
  care: string;
  origin: string;
  stock: number;
  featured: boolean;
  newArrival: boolean;
  published: boolean;
  sortOrder: number;
};

export const SIZE_PRESETS = {
  adult: ["XS", "S", "M", "L", "XL"],
  kids: ["2–3Y", "4–5Y", "6–7Y", "8–9Y", "10–11Y"],
  one: ["One size"],
};

export const BRAND_COLORS: ColorOption[] = [
  { name: "Ivory", hex: "#F3EFE6" },
  { name: "Cream", hex: "#E8DFCC" },
  { name: "Warm Beige", hex: "#CBB99C" },
  { name: "Charcoal", hex: "#3B3A38" },
  { name: "Espresso", hex: "#4A3728" },
  { name: "Burgundy", hex: "#6E2B3A" },
];

export const categoryMeta: Record<
  CategorySlug | "new-arrivals",
  { label: string; headline: string; line: string; image: string; blurb: string }
> = {
  women: {
    label: "Women",
    headline: "Modern silhouettes.\nPakistani soul.",
    line: "Silk, linen and organza cut for a generation that moves fast.",
    image: editorialWomen,
    blurb: "Women's kurtas, co-ords and formal sets in ivory, espresso and muted burgundy.",
  },
  kids: {
    label: "Kids",
    headline: "Little looks.\nBig personality.",
    line: "Handloom cotton built for courtyards, weddings and everything in between.",
    image: editorialKids,
    blurb: "Children's kurtas, frocks and sets in the same palette as our women's line.",
  },
  shawls: {
    label: "Shawls",
    headline: "Heritage woven\ninto every layer.",
    line: "Pit-loom pashmina, merino and jamawar from Kashmir and Multan.",
    image: editorialShawls,
    blurb: "Handwoven Pakistani shawls and dupattas, made on wooden pit looms.",
  },
  "new-arrivals": {
    label: "New Arrivals",
    headline: "Just landed.\nStill warm.",
    line: "The newest pieces from the atelier, added weekly.",
    image: hero,
    blurb: "The latest arrivals across women's clothing, shawls and childrenswear.",
  },
};

export const fabricsOf = (items: Product[]) =>
  Array.from(
    new Set(items.map((p) => (p.fabric.split(",")[0] ?? p.fabric).trim()).filter(Boolean)),
  );
export const colorsOf = (items: Product[]) =>
  Array.from(new Map(items.flatMap((p) => p.colors).map((c) => [c.name, c])).values());
export const sizesOf = (items: Product[]) => Array.from(new Set(items.flatMap((p) => p.sizes)));

export const priceOf = (p: Product) => p.salePrice ?? p.price;
export const formatPKR = (n: number) =>
  `PKR ${n.toLocaleString("en-PK", { maximumFractionDigits: 0 })}`;
