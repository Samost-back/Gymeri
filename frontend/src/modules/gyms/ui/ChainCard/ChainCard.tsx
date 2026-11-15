import Image from "next/image";
import { formatPrice, pluralize } from "@/shared/lib/format";
import { ButtonLink, Icon, Tag } from "@/shared/ui";
import { EMPTY_SEARCH, gymsHref } from "../../model/search-params";
import type { ChainCard as ChainCardData } from "../../model/types";
import styles from "./ChainCard.module.css";

type ChainCardProps = {
  chain: ChainCardData;
  position: number;
};

export function ChainCard({ chain, position }: ChainCardProps) {
  const locations = pluralize(chain.locationsCount, {
    one: "локація",
    few: "локації",
    many: "локацій",
  });

  return (
    <article className={styles.card}>
      <div className={styles.media}>
        {chain.logoUrl ? (
          <Image
            src={chain.logoUrl}
            alt={`Логотип ${chain.name}`}
            fill
            sizes="(min-width: 1024px) 512px, 100vw"
            className={styles.image}
          />
        ) : (
          <span className={styles.monogram} aria-hidden="true">
            {chain.shortName || chain.name}
          </span>
        )}
        {chain.priceFrom !== null && (
          <div className={styles.badges}>
            <Tag variant="solid">від {formatPrice(chain.priceFrom)}/міс</Tag>
          </div>
        )}
      </div>

      <div className={styles.body}>
        <div>
          <div className={styles.meta}>
            {chain.shortName && <span className={styles.brandTag}>{chain.shortName}</span>}
            <span className={styles.position}>Мережа №{String(position).padStart(2, "0")}</span>
          </div>
          <h3 className={styles.name}>{chain.name}</h3>
          {chain.description && <p className={styles.description}>{chain.description}</p>}
        </div>

        <div className={styles.footer}>
          <div>
            <span className={styles.footerLabel}>Присутність бренду</span>
            <div className={styles.presence}>
              <Icon name="domain" />
              <span className={styles.locations}>{locations} в Луцьку</span>
              <span className={styles.districts}>{chain.districts.join(" · ")}</span>
            </div>
          </div>

          <ButtonLink href={gymsHref({ ...EMPTY_SEARCH, chain: chain.slug })}>
            Зали мережі
          </ButtonLink>
        </div>
      </div>
    </article>
  );
}
