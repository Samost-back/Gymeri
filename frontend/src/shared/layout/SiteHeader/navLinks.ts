export interface NavLink {
  href: string;
  label: string;
}

export const NAV_LINKS: NavLink[] = [
  { href: "/", label: "Головна" },
  { href: "/account", label: "Мій кабінет" },
  { href: "/news", label: "Новини" },
  { href: "/about", label: "Про сервіс" },
];

// "/" is a prefix of every path, so it only matches exactly; other links also cover their subpages.
export function isNavLinkActive(pathname: string, href: string): boolean {
  if (href === "/") {
    return pathname === "/";
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}
