export interface FormattedDates {
  hijriUr: string;
  hijriEn: string;
  gregorianUr: string;
  gregorianEn: string;
}

export function getFormattedDates(
  date: Date = new Date(),
  hijriOffsetDays: -1 | 0 | 1 = 0
): FormattedDates {
  const hijriDate = new Date(date.getTime() + hijriOffsetDays * 86_400_000);
  let hijriUr = "";
  let hijriEn = "";

  try {
    hijriUr = new Intl.DateTimeFormat("ur-PK-u-ca-islamic-umalqura", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(hijriDate);
    hijriEn = new Intl.DateTimeFormat("en-US-u-ca-islamic-umalqura", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(hijriDate);
  } catch {
    hijriUr = new Intl.DateTimeFormat("ur-PK-u-ca-islamic", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(hijriDate);
    hijriEn = new Intl.DateTimeFormat("en-US-u-ca-islamic", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(hijriDate);
  }

  const gregorianUr = new Intl.DateTimeFormat("ur-PK", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);

  const gregorianEn = new Intl.DateTimeFormat("en-US", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);

  return {
    hijriUr: `${hijriUr} (تقریباً)`,
    hijriEn: `${hijriEn} (approx.)`,
    gregorianUr,
    gregorianEn,
  };
}
