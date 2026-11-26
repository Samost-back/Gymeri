import type { Metadata } from "next";
import { JetBrains_Mono, Onest } from "next/font/google";
import { AccountButton, SignOutDialog } from "@/modules/accounts";
import { SiteFooter, SiteHeader } from "@/shared/layout";
import { iconFontUrl } from "@/shared/ui";
import "./globals.css";

// Onest instead of the mockup's Hanken Grotesk: Hanken has no basic Cyrillic glyphs.
const onest = Onest({
  variable: "--font-onest",
  subsets: ["latin", "cyrillic"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin", "cyrillic"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Gymeri · Луцьк — каталог спортзалів",
  description: "Пошук спортзалів і відстеження абонементів у Луцьку.",
};

export default function RootLayout({ children, modal }: LayoutProps<"/">) {
  return (
    <html lang="uk" className={`${onest.variable} ${jetbrainsMono.variable}`}>
      <head>
        <link rel="stylesheet" href={iconFontUrl} />
      </head>
      <body>
        <SiteHeader account={<AccountButton />} />
        {children}
        {modal}
        <SiteFooter />
        <SignOutDialog />
      </body>
    </html>
  );
}
