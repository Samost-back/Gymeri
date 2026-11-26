import Image from "next/image";
import Link from "next/link";
import { Icon, Tag } from "@/shared/ui";
import type { MyGym } from "../../model/types";
import styles from "./MyAccount.module.css";

// One compact row with a thumbnail: the chosen gym is a fact to glance at, not another
// catalog card to compare.
export function MyGymCard({ gym }: { gym: MyGym }) {
  return (
    <article className={styles.gym}>
      {gym.photoUrl && (
        <div className={styles.gymThumb}>
          <Image src={gym.photoUrl} alt="" fill sizes="88px" />
        </div>
      )}
      <div className={styles.gymBody}>
        <div className={styles.meta}>
          <span className={styles.chain}>{gym.chainName}</span>
          {gym.isOpenNow && <Tag variant="solid">Відкрито зараз</Tag>}
        </div>
        <h3 className={styles.gymName}>
          <Link href={`/gyms/${gym.slug}`}>{gym.name}</Link>
        </h3>
        <p className={styles.detail}>
          <Icon name="pin_drop" size={16} />
          {gym.address}
        </p>
        {gym.hoursSummary && (
          <p className={styles.detail}>
            <Icon name="schedule" size={16} />
            {gym.hoursSummary}
          </p>
        )}
      </div>
    </article>
  );
}
