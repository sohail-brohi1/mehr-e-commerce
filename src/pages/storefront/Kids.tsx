import { Seo } from "@/components/shared/Seo";
import { CollectionView } from "@/components/shop/CollectionView";
import { categoryMeta } from "@/services/catalog";
import { useProductsQuery } from "@/store/catalog";

const meta = categoryMeta.kids;

export function Kids() {
  const { data: all = [], isPending } = useProductsQuery();
  return (
    <>
      <Seo title="Kids — Little Looks, Big Personality | MEHR" description={meta.blurb} />
      <CollectionView {...meta} items={all.filter((p) => p.category === "kids")} loading={isPending} />
    </>
  );
}
