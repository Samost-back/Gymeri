// Joins CSS module classes, skipping the falsy ones from conditions like `active && styles.active`.
export function cx(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}
