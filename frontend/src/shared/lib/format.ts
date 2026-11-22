const pluralRules = new Intl.PluralRules("uk");

type PluralForms = { one: string; few: string; many: string };

// Ukrainian has three plural forms: 1 локація, 2 локації, 5 локацій.
function pluralWord(count: number, forms: PluralForms): string {
  const category = pluralRules.select(count);
  return category === "one" ? forms.one : category === "few" ? forms.few : forms.many;
}

export function pluralize(count: number, forms: PluralForms): string {
  return `${count} ${pluralWord(count, forms)}`;
}

export function formatArea(squareMeters: number): string {
  return `${new Intl.NumberFormat("uk-UA").format(squareMeters)} м²`;
}

export function formatPrice(hryvnias: number): string {
  return `${new Intl.NumberFormat("uk-UA").format(hryvnias)} грн`;
}

const longDate = new Intl.DateTimeFormat("uk-UA", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

// Split for layouts with a big day number; the full date gives the genitive month ("18 квітня").
export function formatDateParts(isoDate: string): { day: string; monthYear: string } {
  const parts = longDate.formatToParts(new Date(isoDate));
  const part = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((item) => item.type === type)?.value ?? "";
  return { day: part("day"), monthYear: `${part("month")} ${part("year")}` };
}
