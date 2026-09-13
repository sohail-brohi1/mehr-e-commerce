import { Link, useParams } from "react-router-dom";
import { Seo } from "@/components/shared/Seo";
import { TryOnStudio } from "@/components/try-on/TryOnStudio";
import { Reveal } from "@/components/shared/Reveal";
import { editorial } from "@/services/catalog";
import { useProductsQuery } from "@/store/catalog";

export function TryOn() {
  const { slug } = useParams<{ slug?: string }>();
  const { data: products = [], isPending } = useProductsQuery();
  const product = slug ? products.find((p) => p.slug === slug) : undefined;
  const others = products.slice(0, 12);

  if (isPending) return <div className="min-h-[70vh] pt-24" aria-label="Loading try-on" />;

  if (slug && !product) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center px-5 pt-24 text-center">
        <Seo title="Try on | MEHR" />
        <p className="font-display text-4xl">That piece has moved on</p>
        <Link to="/try-on" className="label-xs mt-8 border-b border-foreground pb-1">
          Choose another
        </Link>
      </div>
    );
  }

  if (product) {
    const related = products.filter((p) => p.id !== product.id).slice(0, 10);
    const strip = [product, ...related];
    return (
      <div className="px-5 pb-24 pt-32 md:px-10 md:pt-40">
        <Seo
          title={`Try on ${product.name} | MEHR`}
          description={`See how ${product.name} sits on a real body — an atelier model, or a photo of you.`}
        />
        <TryOnStudio product={product} others={strip} />
      </div>
    );
  }

  return (
    <div className="px-5 pb-24 pt-32 md:px-10 md:pt-40">
      <Seo
        title="Try it on you | MEHR"
        description="Drape a MEHR kurta, shawl or kids piece on a real body — ours, or a photo of you. Nothing is uploaded."
      />
      <Reveal>
        <span className="label-xs text-muted-foreground">Fitting room</span>
        <h1 className="font-display mt-5 max-w-3xl text-[clamp(2.5rem,7vw,5.5rem)] leading-[0.95]">
          See it on a body.
        </h1>
        <p className="mt-6 max-w-lg text-sm leading-relaxed text-muted-foreground">
          Tap a piece. We’ll lay it on an atelier model — or on a photo you take. Drag it onto the
          shoulders. Your picture stays on this phone.
        </p>
      </Reveal>

      <div className="mt-16 grid gap-6 md:grid-cols-3">
        {[
          { img: editorial.women, label: "Women", line: "Kurtas, linen, organza." },
          { img: editorial.shawls, label: "Shawls", line: "Drape across the shoulders." },
          { img: editorial.kids, label: "Kids", line: "The same palette, smaller." },
        ].map((item) => (
          <div key={item.label}>
            <img src={item.img} alt={item.label} className="aspect-[4/5] w-full object-cover" />
            <p className="font-display mt-4 text-2xl">{item.label}</p>
            <p className="mt-1 text-sm text-muted-foreground">{item.line}</p>
          </div>
        ))}
      </div>

      {products.length === 0 ? (
        <p className="mt-16 text-sm text-muted-foreground">The catalogue is still loading.</p>
      ) : (
        <ul className="mt-16 grid grid-cols-2 gap-x-4 gap-y-12 md:grid-cols-3 md:gap-x-6 xl:grid-cols-4">
          {others.map((p) => (
            <li key={p.id}>
              <Link to={`/try-on/${p.slug}`} className="group block">
                <img
                  src={p.images[0]}
                  alt={p.name}
                  className="aspect-[4/5] w-full object-cover transition-transform duration-700 group-hover:scale-[1.02]"
                />
                <span className="mt-3 block text-sm">{p.name}</span>
                <span className="label-xs mt-1 block text-muted-foreground">Try on you</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
