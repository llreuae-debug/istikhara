export interface FormattedDates {
  hijriUr: string;
  hijriEn: string;
  gregorianUr: string;
  gregorianEn: string;
}

export function getFormattedDates(date: Date = new Date()): FormattedDates {
  let hijriUr = "";
  let hijriEn = "";

  try {
    hijriUr = new Intl.DateTimeFormat("ur-PK-u-ca-islamic-umalqura", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(date);
    hijriEn = new Intl.DateTimeFormat("en-US-u-ca-islamic-umalqura", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(date);
  } catch {
    hijriUr = new Intl.DateTimeFormat("ur-PK-u-ca-islamic", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(date);
    hijriEn = new Intl.DateTimeFormat("en-US-u-ca-islamic", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(date);
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

  return { hijriUr, hijriEn, gregorianUr, gregorianEn };
}
