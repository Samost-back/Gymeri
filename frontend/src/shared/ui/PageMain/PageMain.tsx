import type { ReactNode } from "react";
import { Container } from "../Container/Container";
import styles from "./PageMain.module.css";

type PageMainProps = {
  children: ReactNode;
  id?: string;
  // Vertical rhythm between children: "blocks" for related sections, "sections" for distinct ones.
  spacing?: "blocks" | "sections";
};

// Main content area under a page hero, so every page shares the same padding and width.
export function PageMain({ children, id, spacing }: PageMainProps) {
  return (
    <main id={id} className={styles.main}>
      <Container className={spacing && styles[spacing]}>{children}</Container>
    </main>
  );
}
