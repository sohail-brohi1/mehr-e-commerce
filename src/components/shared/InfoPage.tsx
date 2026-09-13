import { Link } from "react-router-dom";
import { Seo } from "@/components/shared/Seo";
import { Reveal } from "@/components/shared/Reveal";

export function InfoPage({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="px-5 pb-20 pt-32 md:px-10 md:pt-40">
      <Seo title={`${title} | MEHR`} description={description} />
      <Reveal>
        <span className="label-xs text-muted-foreground">{eyebrow}</span>
        <h1 className="font-display mt-5 max-w-3xl text-[clamp(2.5rem,7vw,5rem)] leading-[0.95]">
          {title}
        </h1>
        <p className="mt-6 max-w-xl text-sm leading-relaxed text-muted-foreground">{description}</p>
      </Reveal>
      <div className="prose-mehr mx-auto mt-16 max-w-2xl space-y-6 text-sm leading-relaxed text-muted-foreground">
        {children}
      </div>
      <Link to="/" className="label-xs mt-16 inline-block border-b border-foreground pb-1">
        Back to the store
      </Link>
    </div>
  );
}
