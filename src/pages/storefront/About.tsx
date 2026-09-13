import { Link } from "react-router-dom";
import { Seo } from "@/components/shared/Seo";
import { Reveal, RevealImage } from "@/components/shared/Reveal";
import storyCraft from "@/assets/story-craft.jpg";
import { editorial } from "@/services/catalog";

export function About() {
  return (
    <div className="px-5 pb-20 pt-32 md:px-10 md:pt-40">
      <Seo
        title="The House | MEHR"
        description="MEHR is a Pakistani fashion house working with pit-loom weavers and hand-embroiderers in Lahore, Multan and Kashmir."
      />
      <Reveal>
        <span className="label-xs text-muted-foreground">The house</span>
        <h1 className="font-display mt-5 max-w-3xl text-[clamp(2.5rem,7vw,5.5rem)] leading-[0.95]">
          Eleven families.
          <br />
          Four villages.
        </h1>
        <p className="mt-7 max-w-xl text-sm leading-relaxed text-muted-foreground">
          We work with embroiderers in Shahdara and weavers in Kashmir and Multan. Everything is
          cut in Lahore, in runs of forty or fewer — so the hand stays visible.
        </p>
      </Reveal>

      <div className="mt-16 grid gap-10 md:grid-cols-12 md:items-center">
        <RevealImage
          src={storyCraft}
          alt="Artisan hands laying gold zari thread"
          className="md:col-span-7"
          imgClassName="aspect-[4/3]"
        />
        <div className="md:col-span-4">
          <p className="font-display text-3xl leading-tight md:text-4xl">
            Paid by the panel, not the hour.
          </p>
          <p className="mt-5 text-sm leading-relaxed text-muted-foreground">
            Zari is laid sitting on the floor, the same posture used a century ago. Nobody is
            rushed. If a piece takes eleven days, it takes eleven days.
          </p>
        </div>
      </div>

      <div className="mt-24 grid gap-8 md:grid-cols-3">
        {[
          { img: editorial.women, label: "Women", line: "Silk, linen, organza." },
          { img: editorial.shawls, label: "Shawls", line: "Pit-loom pashmina and jamawar." },
          { img: editorial.kids, label: "Kids", line: "The same palette, scaled down." },
        ].map((item) => (
          <div key={item.label}>
            <img src={item.img} alt={item.label} className="aspect-[4/5] w-full object-cover" />
            <p className="font-display mt-4 text-2xl">{item.label}</p>
            <p className="mt-1 text-sm text-muted-foreground">{item.line}</p>
          </div>
        ))}
      </div>

      <Link to="/collections" className="label-xs mt-16 inline-block border-b border-foreground pb-1">
        Read the collections
      </Link>
    </div>
  );
}
