"use client";

import { useRouter } from "next/navigation";
import { Icon } from "@/shared/ui";
import { SORT_OPTIONS, type SortCode } from "../../model/types";
import styles from "./GymFilters.module.css";

type SortSelectProps = {
  value: SortCode;
  // Built on the server so this component only navigates and knows nothing about filters.
  hrefs: Record<string, string>;
};

export function SortSelect({ value, hrefs }: SortSelectProps) {
  const router = useRouter();

  return (
    <div className={styles.sort}>
      <label htmlFor="gym-sort" className={styles.sortLabel}>
        Сортування:
      </label>
      <div className={styles.selectWrap}>
        <select
          id="gym-sort"
          className={styles.select}
          value={value}
          onChange={(event) => {
            const href = hrefs[event.target.value];
            if (href) {
              router.push(href, { scroll: false });
            }
          }}
        >
          {SORT_OPTIONS.map((option) => (
            <option key={option.code} value={option.code}>
              {option.label}
            </option>
          ))}
        </select>
        <Icon name="expand_more" size={16} className={styles.selectIcon} />
      </div>
    </div>
  );
}
