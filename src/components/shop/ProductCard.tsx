import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { Heart } from "lucide-react";
import { toast } from "sonner";
import { formatPKR, priceOf, type Product } from "@/services/catalog";
import { useShop } from "@/store/shop";

export function ProductCard({ product, index = 0 }: { product: Product; index?: number }) {
  const { toggleWishlist, isWishlisted, addToCart } = useShop();
  const wished = isWishlisted(product.id);
  const alt = product.images[1] ?? product.images[0];

  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.9, delay: (index % 4) * 0.06, ease: [0.16, 1, 0.3, 1] }}
      className="group"
    >
      <div className="relative overflow-hidden bg-cream">
        <Link
          to={`/products/${product.slug}`}
          aria-label={product.name}
          className="block"
        >
          <div className="relative aspect-[4/5]">
            <img
              src={product.images[0]}
              alt={product.name}
              width={1200}
              height={1500}
              loading="lazy"
              className="absolute inset-0 h-full w-full object-cover transition-opacity duration-[900ms] ease-out group-hover:opacity-0"
            />
            <img
              src={alt}
              alt=""
              aria-hidden
              width={1200}
              height={1500}
              loading="lazy"
              className="absolute inset-0 h-full w-full scale-[1.03] object-cover opacity-0 transition-all duration-[1200ms] ease-out group-hover:scale-100 group-hover:opacity-100"
            />
          </div>
        </Link>

        <button
          type="button"
          onClick={() => {
            toggleWishlist(product.id);
            toast(wished ? "Removed from wishlist" : "Saved to wishlist");
          }}
          aria-label={wished ? "Remove from wishlist" : "Save to wishlist"}
          className="absolute right-2 top-2 flex h-11 w-11 items-center justify-center text-espresso transition-opacity duration-500 hover:opacity-60"
        >
          <Heart className="h-4 w-4" strokeWidth={1.2} fill={wished ? "currentColor" : "none"} />
        </button>

        <div className="pointer-events-none absolute inset-x-0 bottom-0 opacity-100 transition-all duration-700 ease-out md:translate-y-full md:opacity-0 md:group-hover:pointer-events-auto md:group-hover:translate-y-0 md:group-hover:opacity-100">
          <button
            type="button"
            disabled={product.stock <= 0}
            onClick={() => {
              addToCart(
                product,
                product.sizes[0] ?? "One size",
                product.colors[0]?.name ?? "Natural",
              );
              toast("Added to your bag");
            }}
            className="label-xs pointer-events-auto w-full bg-charcoal py-3.5 text-ivory transition-colors hover:bg-espresso disabled:opacity-40"
          >
            {product.stock <= 0 ? "Sold out" : "Quick add"}
          </button>
        </div>
      </div>

      <div className="mt-4 flex items-start justify-between gap-4">
        <div>
          <Link
            to={`/products/${product.slug}`}
            className="rule-link inline-block text-[0.95rem] leading-snug"
          >
            {product.name}
          </Link>
          <div className="mt-2 flex items-center gap-1.5">
            {product.colors.map((c) => (
              <span
                key={c.name}
                title={c.name}
                className="h-2.5 w-2.5 rounded-full border border-border"
                style={{ backgroundColor: c.hex }}
              />
            ))}
          </div>
        </div>
        <div className="text-right text-sm">
          {product.salePrice ? (
            <>
              <div className="text-burgundy">{formatPKR(product.salePrice)}</div>
              <div className="text-muted-foreground line-through">{formatPKR(product.price)}</div>
            </>
          ) : (
            <div>{formatPKR(priceOf(product))}</div>
          )}
        </div>
      </div>
    </motion.article>
  );
}
