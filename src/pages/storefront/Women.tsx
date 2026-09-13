import { Seo } from "@/components/shared/Seo";
import { CollectionView } from "@/components/shop/CollectionView";
import { categoryMeta } from "@/services/catalog";
import { useProductsQuery } from "@/store/catalog";

const meta = categoryMeta.women;

export function Women() {
  const { data: all = [], isPending } = useProductsQuery();
  return (
    <>
      <Seo title="Women — Modern Silhouettes, Pakistani Soul | MEHR" description={meta.blurb} />
      <CollectionView {...meta} items={all.filter((p) => p.category === "women")} loading={isPending} />
    </>
  );
}
