import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Seo } from "@/components/shared/Seo";
import { AnimatePresence, motion } from "motion/react";
import { Heart, Minus, Plus, RotateCw } from "lucide-react";
import { toast } from "sonner";
import { Viewer360 } from "@/components/media/Viewer360";
import { ProductCard } from "@/components/shop/ProductCard";
import { Reveal, RevealImage } from "@/components/shared/Reveal";
import { categoryMeta, formatPKR, priceOf } from "@/services/catalog";
import { useCollections, useProductsQuery } from "@/store/catalog";
import { useProducts, useShop } from "@/store/shop";

export function Product() {
  const { slug } = useParams<{ slug: string }>();
  const { data: all = [], isPending } = useProductsQuery();
  const product = all.find((p) => p.slug === slug);
  if (isPending) return <div className="min-h-[80vh] pt-24" aria-label="Loading piece" />;
  if (!product || !slug) return <ProductMissing />;
  return <ProductDetail key={product.id} slug={slug} />;
}

function ProductMissing() {
  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center px-5 pt-24 text-center">
      <Seo title="Sold out | MEHR" />
      <p className="label-xs text-muted-foreground">Sold out everywhere</p>
      <h1 className="font-display mt-5 text-4xl md:text-5xl">This piece has moved on</h1>
      <Link to="/new-arrivals" className="label-xs mt-8 border-b border-foreground pb-1">
        See what's new
      </Link>
    </div>
  );
}

function ProductDetail({ slug }: { slug: string }) {
  const all = useProducts();
  const product = all.find((p) => p.slug === slug)!;
  const { addToCart, toggleWishlist, isWishlisted } = useShop();
  const collections = useCollections();

  const [size, setSize] = useState(product.sizes[0] ?? "One size");
  const [color, setColor] = useState(product.colors[0]?.name ?? "Natural");
  const [qty, setQty] = useState(1);
  const [openSection, setOpenSection] = useState<string | null>("fabric");

  const wished = isWishlisted(product.id);
  const frames = product.frames360?.length ? product.frames360 : product.images;
  const gallery = product.images;
  const meta = categoryMeta[product.category];
  const collection = collections.find((c) => c.slug === product.collection);
  const related = all
    .filter((p) => p.id !== product.id && p.collection === product.collection)
    .slice(0, 4);
  const soldOut = product.stock <= 0;
  const maxQty = Math.max(1, Math.min(10, product.stock || 10));

  const sections = [
    { id: "fabric", title: "Fabric & care", body: `${product.fabric}. ${product.care}` },
    { id: "fit", title: "Fit & sizing", body: product.fit },
    ...(product.sizeGuideUrl
      ? [{ id: "guide", title: "Size guide", body: "Open the size guide for this piece." }]
      : []),
    {
      id: "delivery",
      title: "Origin & delivery",
      body: `${product.origin}. Ships nationwide in 3–5 working days; free over PKR 15,000. Cash on delivery available.`,
    },
  ];

  return (
    <div className="pb-24 pt-24 md:pt-32 lg:pb-0">
      <Seo title={`${product.name} | MEHR`} description={`${product.name} — handcrafted in Pakistan. Shop MEHR.`} />
      {/* Breadcrumb */}
      <nav className="label-xs flex items-center gap-2 px-5 text-muted-foreground md:px-10">
        <Link to="/" className="rule-link">
          Home
        </Link>
        <span>/</span>
        <Link to={`/${product.category}`} className="rule-link">
          {meta.label}
        </Link>
        <span>/</span>
        <span className="text-foreground">{product.name}</span>
      </nav>

      <div className="mt-8 grid gap-10 px-5 md:px-10 lg:grid-cols-12 lg:gap-14">
        {/* Gallery */}
        <div className="lg:col-span-7">
          <Viewer360 frames={frames} alt={product.name} />
          <div className="mt-4 grid grid-cols-2 gap-4">
            {gallery.map((img, i) => (
              <RevealImage
                key={i}
                src={img}
                alt={`${product.name} — view ${i + 1}`}
                width={1200}
                height={1500}
                className="bg-cream"
                imgClassName="aspect-[4/5]"
              />
            ))}
          </div>
          <p className="label-xs mt-6 flex items-center gap-2 text-muted-foreground">
            <RotateCw className="h-3.5 w-3.5" strokeWidth={1.2} />
            360° view — drag the main image to rotate
          </p>
        </div>

        {/* Buy panel */}
        <div className="lg:col-span-5">
          <div className="lg:sticky lg:top-28">
            <Reveal y={16}>
              <span className="label-xs text-muted-foreground">
                {collection ? `${collection.name} collection` : meta.label}
              </span>
              <h1 className="font-display mt-4 text-4xl leading-[1.02] md:text-5xl">
                {product.name}
              </h1>
              <div className="mt-5 flex items-baseline gap-3 text-lg">
                {product.salePrice ? (
                  <>
                    <span className="text-burgundy">{formatPKR(product.salePrice)}</span>
                    <span className="text-sm text-muted-foreground line-through">
                      {formatPKR(product.price)}
                    </span>
                  </>
                ) : (
                  <span>{formatPKR(priceOf(product))}</span>
                )}
              </div>
              <p className="mt-6 text-sm leading-relaxed text-muted-foreground">
                {product.description}
              </p>
            </Reveal>

            <Reveal y={16} delay={0.1} className="mt-9">
              {/* Colour */}
              <div>
                <span className="label-xs text-muted-foreground">Colour — {color}</span>
                <div className="mt-3 flex gap-3">
                  {product.colors.map((c) => (
                    <button
                      key={c.name}
                      title={c.name}
                      aria-label={`Colour ${c.name}`}
                      onClick={() => setColor(c.name)}
                      className={`h-8 w-8 rounded-full border transition-all ${
                        color === c.name
                          ? "ring-1 ring-espresso ring-offset-2 ring-offset-background"
                          : "border-border"
                      }`}
                      style={{ backgroundColor: c.hex }}
                    />
                  ))}
                </div>
              </div>

              {/* Size */}
              <div className="mt-8">
                <div className="flex items-center justify-between">
                  <span className="label-xs text-muted-foreground">Size — {size}</span>
                  <span className="label-xs text-muted-foreground">
                    {soldOut ? "Sold out" : product.stock < 8 ? `Only ${product.stock} left` : "In stock"}
                  </span>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {product.sizes.map((s) => (
                    <button
                      key={s}
                      onClick={() => setSize(s)}
                      className={`label-xs min-h-11 border px-4 py-3 transition-colors ${
                        size === s
                          ? "border-charcoal bg-charcoal text-ivory"
                          : "border-border text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {/* Qty + add */}
              <div className="mt-9 flex gap-3">
                <div className="flex items-center border">
                  <button
                    aria-label="Decrease quantity"
                    className="flex h-11 w-11 items-center justify-center"
                    onClick={() => setQty((q) => Math.max(1, q - 1))}
                  >
                    <Minus className="h-3.5 w-3.5" strokeWidth={1.2} />
                  </button>
                  <span className="w-8 text-center text-sm">{qty}</span>
                  <button
                    aria-label="Increase quantity"
                    className="flex h-11 w-11 items-center justify-center"
                    onClick={() => setQty((q) => Math.min(maxQty, q + 1))}
                  >
                    <Plus className="h-3.5 w-3.5" strokeWidth={1.2} />
                  </button>
                </div>
                <button
                  disabled={soldOut}
                  onClick={() => {
                    addToCart(product, size, color, qty);
                    toast("Added to your bag");
                  }}
                  className="label-xs flex-1 bg-charcoal py-4 text-ivory transition-colors hover:bg-espresso disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {soldOut ? "Sold out" : "Add to bag"}
                </button>
                <button
                  aria-label={wished ? "Remove from wishlist" : "Save to wishlist"}
                  onClick={() => {
                    toggleWishlist(product.id);
                    toast(wished ? "Removed from wishlist" : "Saved to wishlist");
                  }}
                  className="border px-4 text-espresso transition-colors hover:border-espresso"
                >
                  <Heart
                    className="h-4 w-4"
                    strokeWidth={1.2}
                    fill={wished ? "currentColor" : "none"}
                  />
                </button>
              </div>

              <p className="mt-4 text-xs text-muted-foreground">
                Free nationwide shipping over PKR 15,000 · Cash on delivery available
              </p>
            </Reveal>

            {/* Accordions */}
            <div className="mt-10 border-t">
              {sections.map((s) => (
                <div key={s.id} className="border-b">
                  <button
                    className="flex w-full items-center justify-between py-5"
                    onClick={() => setOpenSection((o) => (o === s.id ? null : s.id))}
                    aria-expanded={openSection === s.id}
                  >
                    <span className="label-xs">{s.title}</span>
                    <Plus
                      className={`h-3.5 w-3.5 transition-transform duration-500 ${
                        openSection === s.id ? "rotate-45" : ""
                      }`}
                      strokeWidth={1.2}
                    />
                  </button>
                  <AnimatePresence initial={false}>
                    {openSection === s.id && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                        className="overflow-hidden"
                      >
                        <p className="pb-6 text-sm leading-relaxed text-muted-foreground">
                          {s.body}
                          {s.id === "guide" && product.sizeGuideUrl && (
                            <>
                              {" "}
                              <a
                                href={product.sizeGuideUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="underline"
                              >
                                View size guide
                              </a>
                            </>
                          )}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* The Story */}
      <section className="mt-28 grid gap-10 border-t bg-cream px-5 py-20 md:mt-36 md:grid-cols-12 md:px-10 md:py-28">
        <div className="md:col-span-4">
          <Reveal>
            <span className="label-xs text-muted-foreground">The story</span>
            <p className="label-xs mt-4 text-muted-foreground">SKU {product.sku}</p>
          </Reveal>
        </div>
        <div className="md:col-span-7">
          <Reveal delay={0.1}>
            <p className="font-display text-[clamp(1.5rem,3vw,2.5rem)] leading-[1.25]">
              {product.story}
            </p>
            <p className="label-xs mt-8 text-muted-foreground">{product.origin}</p>
          </Reveal>
        </div>
      </section>

      {/* Related */}
      {related.length > 0 && (
        <section className="px-5 pt-28 md:px-10 md:pt-36">
          <div className="flex items-end justify-between border-b pb-5">
            <h2 className="font-display text-3xl md:text-5xl">Complete the look</h2>
            <Link to={`/${product.category}`} className="label-xs rule-link">
              View {meta.label.toLowerCase()}
            </Link>
          </div>
          <div className="mt-12 grid grid-cols-2 gap-x-4 gap-y-14 md:grid-cols-3 md:gap-x-6 xl:grid-cols-4">
            {related.map((p, i) => (
              <ProductCard key={p.id} product={p} index={i} />
            ))}
          </div>
        </section>
      )}

      <div className="fixed inset-x-0 bottom-0 z-40 border-t bg-background/95 px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur lg:hidden">
        <button
          disabled={soldOut}
          onClick={() => {
            addToCart(product, size, color, qty);
            toast("Added to your bag");
          }}
          className="label-xs w-full bg-charcoal py-4 text-ivory disabled:opacity-40"
        >
          {soldOut ? "Sold out" : `Add to bag — ${formatPKR(priceOf(product))}`}
        </button>
      </div>
    </div>
  );
}
