import type { ReactNode } from "react";
import { Container, Icon } from "@/shared/ui";
import styles from "./SiteFooter.module.css";

// Placeholders until the real contacts are agreed; everything the footer shows comes from here.
const CONTACTS = {
  email: "hello@gymeri.example",
  phone: "+380 00 000 00 00",
  instagram: "gymeri.lutsk",
};

// The icon font has no brand logos, so Instagram's glyph is inline.
function InstagramIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="5" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="17.5" cy="6.5" r="1.2" fill="currentColor" />
    </svg>
  );
}

const CONTACT_LINKS: { href: string; label: string; icon: ReactNode; external?: boolean }[] = [
  { href: `mailto:${CONTACTS.email}`, label: CONTACTS.email, icon: <Icon name="mail" size={18} /> },
  {
    href: `tel:${CONTACTS.phone.replaceAll(" ", "")}`,
    label: CONTACTS.phone,
    icon: <Icon name="call" size={18} />,
  },
  {
    href: `https://instagram.com/${CONTACTS.instagram}`,
    label: `@${CONTACTS.instagram}`,
    icon: <InstagramIcon />,
    external: true,
  },
];

export function SiteFooter() {
  return (
    <footer className={styles.footer}>
      <Container>
        <div className={styles.top}>
          <div className={styles.brand}>
            <span className={styles.name}>GYMERI · LUTSK</span>
            <span className={styles.city}>
              <Icon name="location_on" size={16} />
              Луцьк, Україна
            </span>
          </div>

          <address className={styles.contacts}>
            <ul className={styles.contactList}>
              {CONTACT_LINKS.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className={styles.contact}
                    {...(link.external && { target: "_blank", rel: "noopener noreferrer" })}
                  >
                    <span className={styles.contactIcon}>{link.icon}</span>
                    <span className={styles.contactLabel}>{link.label}</span>
                  </a>
                </li>
              ))}
            </ul>
          </address>
        </div>

        <div className={styles.bottom}>
          <span>© 2026 Gymeri. Усі права захищені.</span>
          {/* "#" scrolls to the top of the page without leaving it. */}
          <a href="#" className={styles.toTop}>
            Нагору
            <span className={styles.toTopIcon}>
              <Icon name="arrow_upward" size={16} />
            </span>
          </a>
        </div>
      </Container>
    </footer>
  );
}
