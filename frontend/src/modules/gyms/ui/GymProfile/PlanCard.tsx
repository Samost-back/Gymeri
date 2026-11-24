import { formatDateParts, formatPrice } from "@/shared/lib/format";
import { Icon, Tag } from "@/shared/ui";
import type { PlanOffer } from "../../model/types";
import { discountAmount } from "../GymCard/discountLabels";
import styles from "./GymProfile.module.css";
import { planTerm, planVisits } from "./planLabels";

export function PlanCard({ plan }: { plan: PlanOffer }) {
  const { discount } = plan;
  const endsOn = discount && formatDateParts(discount.endsOn);

  return (
    <article className={styles.plan}>
      <div className={styles.planMeta}>
        <span className={styles.planTerm}>{planTerm(plan.durationDays)}</span>
        {discount && (
          <Tag variant="solid">
            <Icon name="percent" size={14} />
            {discountAmount(discount)}
          </Tag>
        )}
      </div>

      <h3 className={styles.planName}>{plan.name}</h3>

      <div className={styles.planDetails}>
        <p className={styles.detail}>
          <Icon name="fitness_center" size={16} className={styles.detailIcon} />
          {planVisits(plan.visitsLimit)}
        </p>
        {plan.audiences.length > 0 && (
          <p className={styles.detail}>
            <Icon name="school" size={16} className={styles.detailIcon} />
            Лише для: {plan.audiences.map((audience) => audience.name.toLowerCase()).join(", ")}
          </p>
        )}
        {endsOn && (
          <p className={styles.detail}>
            <Icon name="event" size={16} className={styles.detailIcon} />
            Акція до {endsOn.day} {endsOn.monthYear}
          </p>
        )}
      </div>

      <p className={styles.planPrice}>
        {discount && <s className={styles.fullPrice}>{formatPrice(discount.fullPrice)}</s>}
        {formatPrice(plan.price)}
      </p>
    </article>
  );
}
