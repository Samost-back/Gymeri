import { GymMap } from "@/modules/gyms";
import { RouteModal } from "@/shared/ui";

// Opening /map from the site shows the map over the current page.
export default function MapModal() {
  return (
    <RouteModal label="Карта залів" size="wide">
      <GymMap />
    </RouteModal>
  );
}
