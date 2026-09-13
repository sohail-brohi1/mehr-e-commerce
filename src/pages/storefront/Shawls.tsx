import { Seo } from "@/components/shared/Seo";
import { CollectionView } from "@/components/shop/CollectionView";
import { categoryMeta } from "@/services/catalog";
import { useProductsQuery } from "@/store/catalog";

const meta = categoryMeta.shawls;

export function Shawls() {
  const { data: all = [], isPending } = useProductsQuery();
  return (
    <>
      <Seo title="Shawls & Dupattas — Heritage Woven In | MEHR" description={meta.blurb} />
      <CollectionView {...meta} items={all.filter((p) => p.category === "shawls")} loading={isPending} />
    </>
  );
}
