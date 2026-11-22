import { type ReactNode, Suspense } from "react";
import { pluralize } from "@/shared/lib/format";
import { Icon } from "@/shared/ui";
import { getMapPoints } from "../../api/gyms";
import styles from "./GymMap.module.css";
import { MapCanvas } from "./MapCanvas";

// Header plus a map that fills the rest of its container, the map modal.
export function GymMap() {
  return (
    <section className={styles.root} aria-labelledby="gym-map-title">
      <Suspense fallback={<MapLayout />}>
        <LoadedGymMap />
      </Suspense>
    </section>
  );
}

async function LoadedGymMap() {
  const points = await getMapPoints();
  if (points.length === 0) {
    return (
      <MapLayout count="Поки що жодного залу">
        <p className={styles.empty}>Зали з’являться на карті, щойно їх додадуть у каталог.</p>
      </MapLayout>
    );
  }
  return (
    <MapLayout
      count={pluralize(points.length, { one: "зал", few: "зали", many: "залів" })}
    >
      <MapCanvas points={points} />
    </MapLayout>
  );
}

type MapLayoutProps = {
  count?: string;
  children?: ReactNode;
};

function MapLayout({ count, children }: MapLayoutProps) {
  return (
    <>
      <header className={styles.header}>
        <span className={styles.iconBox}>
          <Icon name="location_on" size={22} />
        </span>
        <div className={styles.headerText}>
          <h2 id="gym-map-title" className={styles.title}>
            Карта залів
          </h2>
          <p className={styles.count}>{count ?? "Завантаження…"}</p>
        </div>
      </header>
      <div className={styles.canvas}>{children}</div>
    </>
  );
}
