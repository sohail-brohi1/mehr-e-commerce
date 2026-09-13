import { Link } from "react-router-dom";
import { Seo } from "@/components/shared/Seo";
import { ProductCard } from "@/components/shop/ProductCard";
import { Reveal } from "@/components/shared/Reveal";
import { useProductsQuery } from "@/store/catalog";
import { useShop } from "@/store/shop";

export function Wishlist() {
  const { wishlist } = useShop();
  const { data: all = [], isPending } = useProductsQuery();
  const saved = all.filter((p) => wishlist.includes(p.id));

  return (
    <div className="px-5 pt-32 md:px-10 md:pt-40">
      <Seo title="Wishlist — Saved Pieces | MEHR" description="Your saved pieces from MEHR — Pakistani fashion, reimagined." />
      <Reveal>
        <span className="label-xs text-muted-foreground">Wishlist</span>
        <h1 className="font-display mt-6 text-[clamp(2.75rem,7vw,5.5rem)] leading-[0.95]">
          Kept for later.
        </h1>
        <p className="mt-6 max-w-md text-sm leading-relaxed text-muted-foreground">
          {saved.length > 0
            ? `${saved.length} piece${saved.length === 1 ? "" : "s"} you're thinking about. Small runs sell through — don't wait too long.`
            : "Tap the heart on any piece to keep it here."}
        </p>
      </Reveal>

      {isPending && wishlist.length > 0 ? (
        <div className="mt-16 grid grid-cols-2 gap-x-4 gap-y-14 border-t pt-14 md:grid-cols-3" aria-label="Loading wishlist">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="aspect-[4/5] animate-pulse bg-cream" />
          ))}
        </div>
      ) : saved.length === 0 ? (
        <div className="border-t mt-16 py-24 text-center">
          <p className="font-display text-3xl">Nothing saved yet</p>
          <Link
            to="/new-arrivals"
            className="label-xs mt-8 inline-block border-b border-foreground pb-1"
          >
            Explore new arrivals
          </Link>
        </div>
      ) : (
        <div className="mt-16 grid grid-cols-2 gap-x-4 gap-y-14 border-t pt-14 md:grid-cols-3 md:gap-x-6 xl:grid-cols-4">
          {saved.map((p, i) => (
            <ProductCard key={p.id} product={p} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}
