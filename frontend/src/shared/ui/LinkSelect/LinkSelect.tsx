"use client";

import { useRouter } from "next/navigation";
import { cx } from "../../lib/classNames";
import { Icon } from "../Icon/Icon";
import styles from "./LinkSelect.module.css";

export type LinkSelectOption = {
  value: string;
  label: string;
  // Built on the server, so this component only navigates and knows nothing about filters.
  href: string;
};

type LinkSelectProps = {
  id: string;
  // For screen readers; the options themselves ("Усі вулиці") say what the select is about.
  label: string;
  value: string;
  options: LinkSelectOption[];
  // Highlights the field when the choice narrows something, e.g. a filter that is set.
  active?: boolean;
};

// A native select stays compact however many options there are, and phones open their own
// picker for it.
export function LinkSelect({ id, label, value, options, active = false }: LinkSelectProps) {
  const router = useRouter();

  return (
    <div className={cx(styles.field, active && styles.active)}>
      <select
        id={id}
        aria-label={label}
        className={styles.select}
        value={value}
        onChange={(event) => {
          const option = options.find((item) => item.value === event.target.value);
          if (option) {
            router.push(option.href, { scroll: false });
          }
        }}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <Icon name="expand_more" size={18} className={styles.arrow} />
    </div>
  );
}
