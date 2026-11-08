import Image from "next/image";
import { formatArea, pluralize } from "@/shared/lib/format";
import { Button, ButtonLink, Icon, Tag } from "@/shared/ui";
import type { GymSummary } from "../../model/types";
import styles from "./GymCard.module.css";

type GymCardProps = {
  gym: GymSummary;
  position: number;
};

export function GymCard({ gym, position }: GymCardProps) {
  const locations = pluralize(gym.locationsCount, {
    one: "локація",
    few: "локації",
    many: "локацій",
  });

  return (
    <article className={styles.card}>
      <div className={styles.media}>
        <Image
          src={gym.imageUrl}
          alt={gym.imageAlt}
          fill
          sizes="(min-width: 1024px) 512px, 100vw"
          className={styles.image}
        />
        <div className={styles.badges}>
          <Tag>{gym.highlight}</Tag>
          {gym.tag && <Tag variant="solid">{gym.tag}</Tag>}
        </div>
      </div>

      <div className={styles.body}>
        <div>
          <div className={styles.titleRow}>
            <div>
              <div className={styles.meta}>
                <span className={styles.brandTag}>{gym.brandTag}</span>
                <span className={styles.position}>
                  Фітнес-комплекс №{String(position).padStart(2, "0")}
                </span>
              </div>
              <h3 className={styles.name}>{gym.name}</h3>
            </div>
            <span className={styles.area}>{formatArea(gym.areaM2)}</span>
          </div>

          <div className={styles.details}>
            <p className={styles.detail}>
              <Icon name="pin_drop" size={16} className={styles.detailIcon} />
              {gym.address}
            </p>
            <p className={styles.detail}>
              <Icon name="schedule" size={16} className={styles.detailIcon} />
              {gym.hoursSummary}
            </p>
          </div>
        </div>

        <div className={styles.footer}>
          <div>
            <span className={styles.footerLabel}>Присутність бренду</span>
            <div className={styles.presence}>
              <Icon name="domain" />
              <span className={styles.locations}>{locations} в Луцьку</span>
              <span className={styles.districts}>{gym.districts.join(" · ")}</span>
            </div>
          </div>

          <div className={styles.actions}>
            <Button variant="outline" className={styles.mapButton} aria-label="Показати на карті">
              <Icon name="map" />
            </Button>
            <ButtonLink href={`/gyms/${gym.slug}`}>Детальніше</ButtonLink>
          </div>
        </div>
      </div>
    </article>
  );
}
