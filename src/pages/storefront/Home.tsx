import { Link } from "react-router-dom";
import { Seo } from "@/components/shared/Seo";
import { motion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import { Reveal, RevealImage } from "@/components/shared/Reveal";
import { ProductCard } from "@/components/shop/ProductCard";
import { editorial } from "@/services/catalog";
import { useCollections } from "@/store/catalog";
import { useProducts } from "@/store/shop";
import storyCraft from "@/assets/story-craft.jpg";

export function Home() {
  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "18%"]);
  const overlay = useTransform(scrollYProgress, [0, 1], [0.32, 0.62]);
  const all = useProducts();
  const collections = useCollections();
  const featured = all.filter((p) => p.featured).slice(0, 4);
  const arrivals = all.filter((p) => p.newArrival).slice(0, 4);

  return (
    <>
      <Seo
        title="MEHR — Tradition, Reimagined | Pakistani Fashion"
        description="Hand-embroidered Pakistani womenswear, pit-loom shawls and childrenswear. Crafted in Lahore, Multan and Kashmir for a new generation."
      />
      {/* Hero */}
      <section ref={heroRef} className="relative h-[100svh] overflow-hidden">
        <motion.img
          src={editorial.hero}
          alt="Model wearing an ivory embroidered kurta and cream dupatta"
          width={1600}
          height={1920}
          style={{ y }}
          className="absolute inset-0 h-[118%] w-full object-cover object-[50%_25%]"
        />
        <motion.div className="absolute inset-0 bg-charcoal" style={{ opacity: overlay }} />
        <div className="relative flex h-full flex-col justify-end px-5 pb-16 text-ivory md:px-10 md:pb-20">
          <motion.span
            className="label-xs"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.8 }}
            transition={{ duration: 1.4, delay: 0.3 }}
          >
            Spring / Summer 2026 — Noor
          </motion.span>
          <motion.h1
            className="font-display mt-5 max-w-4xl text-[clamp(3rem,10vw,8rem)] leading-[0.9]"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.6, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
          >
            Tradition,
            <br />
            <em className="italic">Reimagined.</em>
          </motion.h1>
          <motion.div
            className="mt-8 flex flex-col gap-8 md:flex-row md:items-end md:justify-between"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.4, delay: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            <p className="max-w-sm text-sm leading-relaxed text-ivory/80">
              Pakistani fashion, crafted for a new generation. Hand-worked zari, pit-loom pashmina
              and unbleached linen — made in small runs.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                to="/women"
                className="label-xs bg-ivory px-8 py-4 text-charcoal transition-colors hover:bg-cream"
              >
                Explore Women
              </Link>
              <Link
                to="/collections"
                className="label-xs border border-ivory/60 px-8 py-4 transition-colors hover:bg-ivory hover:text-charcoal"
              >
                Explore Collection
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Statement — asymmetric */}
      <section className="grid gap-10 px-5 py-28 md:grid-cols-12 md:px-10 md:py-40">
        <div className="md:col-span-4">
          <Reveal>
            <span className="label-xs text-muted-foreground">The house</span>
          </Reveal>
        </div>
        <div className="md:col-span-7">
          <Reveal delay={0.1}>
            <p className="font-display text-[clamp(1.75rem,3.6vw,3.25rem)] leading-[1.15]">
              We work with eleven families of embroiderers and four weaving villages. Everything is
              cut in Lahore, in runs of forty or fewer — so the hand stays visible.
            </p>
          </Reveal>
        </div>
      </section>

      {/* Category triptych — deliberately uneven */}
      <section className="px-5 md:px-10">
        <div className="grid gap-6 md:grid-cols-12">
          <CategoryTile
            to="/women"
            label="Women"
            line="Modern silhouettes. Pakistani soul."
            image={editorial.women}
            className="md:col-span-7"
            ratio="aspect-[4/5]"
          />
          <div className="flex flex-col gap-6 md:col-span-5 md:pt-24">
            <CategoryTile
              to="/shawls"
              label="Shawls"
              line="Heritage woven into every layer."
              image={editorial.shawls}
              ratio="aspect-[4/3]"
            />
            <CategoryTile
              to="/kids"
              label="Kids"
              line="Little looks. Big personality."
              image={editorial.kids}
              ratio="aspect-[4/3]"
            />
          </div>
        </div>
      </section>

      {featured.length > 0 && (
      <section className="px-5 pt-32 md:px-10 md:pt-44">
        <div className="flex items-end justify-between border-b pb-5">
          <h2 className="font-display text-3xl md:text-5xl">Selected pieces</h2>
          <Link to="/new-arrivals" className="label-xs rule-link">
            View all
          </Link>
        </div>
        <div className="mt-12 grid grid-cols-2 gap-x-4 gap-y-14 md:grid-cols-3 md:gap-x-6 xl:grid-cols-4">
          {featured.map((p, i) => (
            <ProductCard key={p.id} product={p} index={i} />
          ))}
        </div>
      </section>
      )}

      {/* Craft story */}
      <section className="mt-36 grid gap-10 md:grid-cols-12 md:items-center">
        <RevealImage
          src={storyCraft}
          alt="Artisan hands laying gold zari thread onto ivory silk"
          width={1600}
          height={1104}
          className="md:col-span-7"
          imgClassName="aspect-[4/3]"
        />
        <div className="px-5 md:col-span-4 md:px-0">
          <Reveal>
            <span className="label-xs text-muted-foreground">The craft</span>
            <p className="font-display mt-6 text-4xl leading-tight md:text-5xl">
              Eleven days for
              <br />
              one front panel.
            </p>
            <p className="mt-6 text-sm leading-relaxed text-muted-foreground">
              Zari is laid by hand, thread over thread, in the same sitting posture used a century
              ago in Shahdara. We pay by the panel, not the hour — so nobody rushes the work.
            </p>
            <Link
              to="/collections"
              className="label-xs mt-8 inline-block border-b border-foreground pb-1"
            >
              Read the collections
            </Link>
          </Reveal>
        </div>
      </section>

      {/* Collections strip */}
      {collections.length > 0 && (
      <section className="px-5 pt-36 md:px-10">
        <h2 className="font-display border-b pb-5 text-3xl md:text-5xl">Collections</h2>
        <div className="mt-12 grid gap-8 md:grid-cols-3">
          {collections.map((c, i) => (
            <Reveal key={c.slug} delay={i * 0.08}>
              <Link to={`/collections#${c.slug}`} className="group block">
                <div className="overflow-hidden">
                  <img
                    src={c.image || editorial.hero}
                    alt={c.name}
                    width={1200}
                    height={1500}
                    loading="lazy"
                    className="aspect-[3/4] w-full object-cover transition-transform duration-[1400ms] ease-out group-hover:scale-[1.04]"
                  />
                </div>
                <div className="mt-5 flex items-baseline justify-between">
                  <span className="font-display text-2xl">{c.name}</span>
                  <span className="label-xs text-muted-foreground">{c.tagline}</span>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>
      )}

      {arrivals.length > 0 && (
      <section className="px-5 pt-36 md:px-10">
        <div className="flex items-end justify-between border-b pb-5">
          <h2 className="font-display text-3xl md:text-5xl">Just landed</h2>
          <Link to="/new-arrivals" className="label-xs rule-link">
            New arrivals
          </Link>
        </div>
        <div className="mt-12 grid grid-cols-2 gap-x-4 gap-y-14 md:grid-cols-3 md:gap-x-6 xl:grid-cols-4">
          {arrivals.map((p, i) => (
            <ProductCard key={p.id} product={p} index={i} />
          ))}
        </div>
      </section>
      )}
    </>
  );
}

function CategoryTile({
  to,
  label,
  line,
  image,
  className,
  ratio,
}: {
  to: string;
  label: string;
  line: string;
  image: string;
  className?: string;
  ratio: string;
}) {
  return (
    <Reveal className={className ?? ""}>
      <Link to={to} className="group block">
        <div className="overflow-hidden">
          <img
            src={image}
            alt={label}
            width={1408}
            height={1760}
            loading="lazy"
            className={`w-full object-cover transition-transform duration-[1600ms] ease-out group-hover:scale-[1.04] ${ratio}`}
          />
        </div>
        <div className="mt-5 flex items-baseline justify-between gap-6">
          <span className="font-display text-3xl md:text-4xl">{label}</span>
          <span className="label-xs max-w-[14rem] text-right text-muted-foreground">{line}</span>
        </div>
      </Link>
    </Reveal>
  );
}
