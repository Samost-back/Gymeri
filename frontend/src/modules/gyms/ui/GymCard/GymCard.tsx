import Image from "next/image";
import { formatArea, formatPrice } from "@/shared/lib/format";
import { Icon, Tag } from "@/shared/ui";
import type { GymListing } from "../../model/types";
import styles from "./GymCard.module.css";

type GymCardProps = {
  gym: GymListing;
  // Gym types the user filtered by; the card shows which of them this gym has.
  selectedTypes?: string[];
};

export function GymCard({ gym, selectedTypes = [] }: GymCardProps) {
  return (
    <article className={styles.card}>
      {gym.photoUrl && (
        <div className={styles.media}>
          <Image src={gym.photoUrl} alt={gym.name} fill sizes="(min-width: 1024px) 320px, 100vw" />
        </div>
      )}

      <div className={styles.body}>
        <div className={styles.meta}>
          <span className={styles.chain}>{gym.chainName}</span>
          {gym.isOpenNow && <Tag variant="solid">Відкрито зараз</Tag>}
          {gym.hasDiscount && (
            <Tag variant="solid">
              <Icon name="percent" size={14} />
              Знижка
            </Tag>
          )}
        </div>

        <h3 className={styles.name}>{gym.name}</h3>
        {gym.highlight && <p className={styles.highlight}>{gym.highlight}</p>}

        <div className={styles.details}>
          <p className={styles.detail}>
            <Icon name="pin_drop" size={16} className={styles.detailIcon} />
            {gym.address}
          </p>
          {gym.hoursSummary && (
            <p className={styles.detail}>
              <Icon name="schedule" size={16} className={styles.detailIcon} />
              {gym.hoursSummary}
            </p>
          )}
          {gym.audiences.length > 0 && (
            <p className={styles.detail}>
              <Icon name="school" size={16} className={styles.detailIcon} />
              Абонементи для: {gym.audiences.map((audience) => audience.name).join(", ")}
            </p>
          )}
        </div>

        <div className={styles.footer}>
          <div className={styles.tags}>
            {gym.amenities.map((amenity) => (
              <Tag
                key={amenity.slug}
                variant={selectedTypes.includes(amenity.slug) ? "default" : "muted"}
              >
                {selectedTypes.includes(amenity.slug) && <Icon name="check" size={14} />}
                {amenity.name}
              </Tag>
            ))}
            {gym.areaM2 !== null && <Tag variant="muted">{formatArea(gym.areaM2)}</Tag>}
          </div>
          {gym.priceFrom !== null && (
            <span className={styles.price}>від {formatPrice(gym.priceFrom)}/міс</span>
          )}
        </div>
      </div>
    </article>
  );
}
