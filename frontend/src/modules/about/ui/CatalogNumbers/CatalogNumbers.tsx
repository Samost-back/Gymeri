import { Suspense } from "react";
import { type CatalogStats, getCatalogStats } from "@/modules/gyms";
import { pluralWord } from "@/shared/lib/format";
import styles from "./CatalogNumbers.module.css";

export function CatalogNumbers() {
  return (
    <Suspense fallback={<CatalogNumbersList />}>
      <LoadedCatalogNumbers />
    </Suspense>
  );
}

async function LoadedCatalogNumbers() {
  const stats = await getCatalogStats();
  return <CatalogNumbersList stats={stats} />;
}

// Live numbers from the catalog; dashes keep the layout steady while they load.
function CatalogNumbersList({ stats }: { stats?: CatalogStats }) {
  const items = [
    { count: stats?.gyms, forms: { one: "зал", few: "зали", many: "залів" }, note: "у каталозі" },
    {
      count: stats?.chains,
      forms: { one: "мережа", few: "мережі", many: "мереж" },
      note: "спортзалів",
    },
    {
      count: stats?.districts,
      forms: { one: "район", few: "райони", many: "районів" },
      note: "Луцька",
    },
  ];

  return (
    <dl className={styles.numbers}>
      {items.map((item) => (
        <div key={item.note} className={styles.number}>
          <dt className={styles.numberLabel}>
            {item.count === undefined ? "" : pluralWord(item.count, item.forms)} {item.note}
          </dt>
          <dd className={styles.numberValue}>{item.count ?? "—"}</dd>
        </div>
      ))}
    </dl>
  );
}
