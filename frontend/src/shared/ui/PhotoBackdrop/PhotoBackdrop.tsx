import Image from "next/image";
import gymPhoto from "@/shared/assets/gym-photo.webp";
import { cx } from "../../lib/classNames";
import styles from "./PhotoBackdrop.module.css";

type PhotoBackdropProps = {
  // CSS object-position, so each page can show a different part of the photo.
  focus?: string;
  // "side" keeps text on the left readable; "even" suits content centred over the photo.
  shade?: "side" | "even";
};

// Shaded gym photo behind a block; the parent must be positioned and clip overflow.
export function PhotoBackdrop({ focus = "center", shade = "side" }: PhotoBackdropProps) {
  return (
    <div className={styles.backdrop} aria-hidden="true">
      <Image
        src={gymPhoto}
        alt=""
        fill
        placeholder="blur"
        sizes="100vw"
        className={styles.image}
        style={{ objectPosition: focus }}
      />
      <div className={cx(styles.shade, styles[shade])} />
    </div>
  );
}
