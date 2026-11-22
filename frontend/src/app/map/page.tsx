import type { Metadata } from "next";
import { GymMap } from "@/modules/gyms";
import { HomeContent } from "@/modules/home";
import { RouteModal } from "@/shared/ui";

export const metadata: Metadata = {
  title: "Карта спортзалів · Gymeri",
  description: "Усі спортзали Луцька з каталогу Gymeri на одній карті.",
};

// Direct visits and reloads of /map land here; site links open the modal instead.
// The home page content sits underneath, so a reload looks the same as opening the map from the site.
export default function MapPage() {
  return (
    <>
      <HomeContent />
      <RouteModal label="Карта залів" size="wide" closeHref="/">
        <GymMap />
      </RouteModal>
    </>
  );
}
