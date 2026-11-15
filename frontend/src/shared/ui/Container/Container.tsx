import type { ComponentProps } from "react";
import { cx } from "../../lib/classNames";
import styles from "./Container.module.css";

export function Container({ className, ...props }: ComponentProps<"div">) {
  return <div className={cx(styles.container, className)} {...props} />;
}
