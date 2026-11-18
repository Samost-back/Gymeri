import type { ReactNode } from "react";
import { Tag } from "@/shared/ui";
import styles from "./AboutSection.module.css";

type AboutSectionProps = {
  tag: string;
  title: string;
  children: ReactNode;
};

// Every section reads top to bottom: heading, then content, on phones and desktops alike.
export function AboutSection({ tag, title, children }: AboutSectionProps) {
  return (
    <section className={styles.section}>
      <div className={styles.heading}>
        <Tag variant="muted">{tag}</Tag>
        <h2 className={styles.title}>{title}</h2>
      </div>
      <div>{children}</div>
    </section>
  );
}
