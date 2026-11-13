import { type CatalogStats, getCatalogStats } from "@/modules/gyms";
import { pluralize } from "@/shared/lib/format";
import styles from "./Hero.module.css";

export async function HeroStats() {
  const stats = await getCatalogStats();
  return <HeroStatsList stats={stats} />;
}

// Without stats it renders the same layout with dashes, so the hero doesn't jump while loading.
export function HeroStatsList({ stats }: { stats?: CatalogStats }) {
  const value = (count: number | undefined, forms: Parameters<typeof pluralize>[1]) =>
    count === undefined ? "—" : pluralize(count, forms);

  const items = [
    {
      label: "Актуальний каталог",
      value: value(stats?.gyms, { one: "зал", few: "зали", many: "залів" }),
    },
    {
      label: "Локаційна мережа",
      value: value(stats?.chains, { one: "бренд", few: "бренди", many: "брендів" }),
    },
    {
      label: "Охоплення",
      value: value(stats?.districts, { one: "район", few: "райони", many: "районів" }),
    },
  ];

  return (
    <dl className={styles.stats}>
      {items.map((item) => (
        <div key={item.label} className={styles.stat}>
          <dt className={styles.statLabel}>{item.label}</dt>
          <dd className={styles.statValue}>{item.value}</dd>
        </div>
      ))}
    </dl>
  );
}
