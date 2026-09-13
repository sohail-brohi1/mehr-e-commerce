import type { CategorySlug, Product } from "@/services/catalog";
import { editorial } from "@/services/catalog";

export type GarmentFit = {
  x: number;
  y: number;
  scale: number;
  rotate: number;
  opacity: number;
};

export type HouseBody = {
  id: string;
  label: string;
  line: string;
  src: string;
  for: CategorySlug[];
};

export const HOUSE_BODIES: HouseBody[] = [
  {
    id: "women",
    label: "Women",
    line: "Atelier model",
    src: editorial.women,
    for: ["women", "shawls"],
  },
  {
    id: "drape",
    label: "Drape",
    line: "Shoulders & wrap",
    src: editorial.shawls,
    for: ["shawls", "women"],
  },
  {
    id: "kids",
    label: "Kids",
    line: "Little frame",
    src: editorial.kids,
    for: ["kids"],
  },
  {
    id: "atelier",
    label: "Atelier",
    line: "Full length",
    src: editorial.hero,
    for: ["women", "shawls"],
  },
];

const MASKS: Record<CategorySlug, string> = {
  women: "/try-on/kurta-mask.svg",
  shawls: "/try-on/shawl-mask.svg",
  kids: "/try-on/kids-mask.svg",
};

export const FIT_PRESETS: Record<CategorySlug, GarmentFit> = {
  women: { x: 50, y: 22, scale: 72, rotate: 0, opacity: 86 },
  shawls: { x: 50, y: 12, scale: 92, rotate: 0, opacity: 84 },
  kids: { x: 50, y: 26, scale: 58, rotate: 0, opacity: 88 },
};

export function maskFor(category: CategorySlug) {
  return MASKS[category];
}

export function defaultBody(category: CategorySlug) {
  return HOUSE_BODIES.find((b) => b.for.includes(category)) ?? HOUSE_BODIES[0]!;
}

/** Same-origin proxy so the look can be saved without a tainted canvas. */
export function proxiedSrc(url: string) {
  if (!url) return "";
  if (
    url.startsWith("blob:") ||
    url.startsWith("data:") ||
    url.startsWith("/") ||
    url.startsWith(window.location.origin)
  ) {
    return url;
  }
  return `/api/media/fetch?url=${encodeURIComponent(url)}`;
}

export function garmentImage(product: Product, colorIndex = 0) {
  const images = product.images.filter(Boolean);
  if (images.length === 0) return "";
  const pick = images[Math.min(colorIndex, images.length - 1)] ?? images[0]!;
  return proxiedSrc(pick);
}

let rememberedUpload: string | null = null;

export function getRememberedUpload() {
  return rememberedUpload;
}

export function setRememberedUpload(url: string | null) {
  if (rememberedUpload && rememberedUpload.startsWith("blob:")) {
    URL.revokeObjectURL(rememberedUpload);
  }
  rememberedUpload = url;
}
