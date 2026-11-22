import type { ReactNode } from "react";
import { cx } from "../../lib/classNames";
import { Container } from "../Container/Container";
import { PhotoBackdrop } from "../PhotoBackdrop/PhotoBackdrop";
import styles from "./PageHero.module.css";

type PageHeroProps = {
  title: string;
  // Second, lighter line of the title.
  accent?: string;
  lead: string;
  // Button under the lead, e.g. the page's main action.
  action?: ReactNode;
  // Part of the backdrop photo to show, so neighbouring pages don't look identical.
  photoFocus?: string;
  // Right column on wide screens (e.g. a list); below the text on phones.
  aside?: ReactNode;
  // Lower banner for pages whose main content (e.g. a search) should start on the first screen.
  compact?: boolean;
};

// Opening banner of inner pages: one height and shade everywhere, lower than the home hero,
// so the page content starts on the first screen.
export function PageHero({
  title,
  accent,
  lead,
  action,
  photoFocus,
  aside,
  compact = false,
}: PageHeroProps) {
  return (
    <section className={cx(styles.hero, compact && styles.compact)}>
      <PhotoBackdrop focus={photoFocus} />
      <Container className={cx(styles.content, aside != null && styles.withAside)}>
        <div>
          <h1 className={styles.title}>
            {title}
            {accent && (
              <>
                <br />
                <span className={styles.titleAccent}>{accent}</span>
              </>
            )}
          </h1>
          <p className={styles.lead}>{lead}</p>
          {action && <div className={styles.action}>{action}</div>}
        </div>
        {aside}
      </Container>
    </section>
  );
}
