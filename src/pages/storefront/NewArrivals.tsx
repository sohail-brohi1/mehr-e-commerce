import { Seo } from "@/components/shared/Seo";
import { CollectionView } from "@/components/shop/CollectionView";
import { categoryMeta } from "@/services/catalog";
import { useProductsQuery } from "@/store/catalog";

const meta = categoryMeta["new-arrivals"];

export function NewArrivals() {
  const { data: all = [], isPending } = useProductsQuery();
  return (
    <>
      <Seo title="New Arrivals — Just Landed | MEHR" description={meta.blurb} />
      <CollectionView {...meta} items={all.filter((p) => p.newArrival)} loading={isPending} />
    </>
  );
}
