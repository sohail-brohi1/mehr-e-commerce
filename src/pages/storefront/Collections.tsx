import { Link } from "react-router-dom";
import { Seo } from "@/components/shared/Seo";
import { Reveal } from "@/components/shared/Reveal";
import { ProductCard } from "@/components/shop/ProductCard";
import { editorial } from "@/services/catalog";
import { useCollections, useProductsQuery } from "@/store/catalog";

export function Collections() {
  const collections = useCollections();
  const { data: products = [], isPending } = useProductsQuery();
  return (
    <div className="px-5 pb-10 pt-32 md:px-10 md:pt-40">
      <Seo
        title="Collections — Noor, Sang, Virsa | MEHR"
        description="Three chapters from the MEHR atelier: Noor in ivory silk, Sang in earth tones, Virsa in handwoven shawls."
      />
      <Reveal>
        <span className="label-xs text-muted-foreground">Collections</span>
        <h1 className="font-display mt-6 max-w-3xl text-[clamp(2.75rem,7vw,5.5rem)] leading-[0.95]">
          Three chapters,
          <br />
          one hand.
        </h1>
      </Reveal>

      <div className="mt-24 flex flex-col gap-32">
        {isPending && collections.length === 0 && (
          <div className="grid grid-cols-2 gap-4" aria-label="Loading collections">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="aspect-[3/4] animate-pulse bg-cream" />
            ))}
          </div>
        )}
        {collections.map((c, i) => {
          const items = products.filter((p) => p.collection === c.slug);
          const flip = i % 2 === 1;
          return (
            <section key={c.slug} id={c.slug} className="scroll-mt-28">
              <div className="grid gap-8 md:grid-cols-12 md:items-end">
                <Reveal className={flip ? "md:col-span-5 md:col-start-8 md:order-2" : "md:col-span-5"}>
                  <img
                    src={c.image || editorial.hero}
                    alt={c.name}
                    width={1200}
                    height={1500}
                    loading="lazy"
                    className="aspect-[3/4] w-full object-cover"
                  />
                </Reveal>
                <Reveal
                  delay={0.1}
                  className={flip ? "md:col-span-5 md:col-start-2 md:order-1" : "md:col-span-6 md:col-start-7"}
                >
                  <span className="label-xs text-muted-foreground">{c.tagline}</span>
                  <h2 className="font-display mt-5 text-5xl md:text-7xl">{c.name}</h2>
                  <p className="mt-6 max-w-md text-sm leading-relaxed text-muted-foreground">
                    {c.description}
                  </p>
                  <span className="label-xs mt-6 block text-muted-foreground">
                    {isPending ? "…" : `${items.length} pieces`}
                  </span>
                </Reveal>
              </div>
              <div className="mt-14 grid grid-cols-2 gap-x-4 gap-y-14 md:grid-cols-3 md:gap-x-6 xl:grid-cols-4">
                {items.map((p, idx) => (
                  <ProductCard key={p.id} product={p} index={idx} />
                ))}
              </div>
            </section>
          );
        })}
      </div>

      <div className="mt-32 border-t pt-10">
        <Link to="/new-arrivals" className="label-xs rule-link">
          Shop everything new
        </Link>
      </div>
    </div>
  );
}
