export const START_MONTH = 5;
export const START_YEAR = 2026;

const MONTHS = [
  'JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE',
  'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER',
];

export function getCurrentMonthYear(): { month: number; year: number } {
  const now = new Date();
  return { month: now.getMonth() + 1, year: now.getFullYear() };
}

/** Last month in dropdown: December of the current calendar year */
export function getDropdownEnd(): { month: number; year: number } {
  return { month: 12, year: new Date().getFullYear() };
}

export function compareMonthYear(
  m1: number,
  y1: number,
  m2: number,
  y2: number
): number {
  if (y1 !== y2) return y1 - y2;
  return m1 - m2;
}

export function formatMonthLabel(month: number, year: number): string {
  return `${MONTHS[month - 1]} - ${year}`;
}

export function formatMonthOption(month: number, year: number): string {
  return `${MONTHS[month - 1]} - ${year}`;
}

/**
 * Dropdown: May 2026 → December of current year.
 * In 2026: MAY-2026 … DEC-2026
 * In 2027: MAY-2026 … DEC-2027 (range grows each year)
 */
export function buildMonthOptions(): { value: string; label: string; month: number; year: number }[] {
  const options: { value: string; label: string; month: number; year: number }[] = [];
  const end = getDropdownEnd();
  let month = START_MONTH;
  let year = START_YEAR;

  while (compareMonthYear(month, year, end.month, end.year) <= 0) {
    options.push({
      value: `${month}-${year}`,
      label: formatMonthOption(month, year),
      month,
      year,
    });
    month++;
    if (month > 12) {
      month = 1;
      year++;
    }
  }
  return options;
}

export function clampToRange(month: number, year: number): { month: number; year: number } {
  const start = { month: START_MONTH, year: START_YEAR };
  const end = getDropdownEnd();
  if (compareMonthYear(month, year, start.month, start.year) < 0) return start;
  if (compareMonthYear(month, year, end.month, end.year) > 0) return end;
  return { month, year };
}

/** Default view: current month (within allowed range) */
export function getDefaultSelectedMonth(): { month: number; year: number } {
  const now = getCurrentMonthYear();
  return clampToRange(now.month, now.year);
}
