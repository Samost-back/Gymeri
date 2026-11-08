import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Gymeri",
  description: "Пошук спортзалів і відстеження абонементів у Луцьку.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="uk">
      <body>{children}</body>
    </html>
  );
}
