const DATE_INPUT_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export function formatDateInputValue(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

export function parseDateInputValue(value: string) {
  const trimmed = value.trim();

  if (!DATE_INPUT_PATTERN.test(trimmed)) {
    return null;
  }

  const [yearText, monthText, dayText] = trimmed.split('-');
  const year = Number(yearText);
  const month = Number(monthText);
  const day = Number(dayText);

  if (
    !Number.isInteger(year) ||
    !Number.isInteger(month) ||
    !Number.isInteger(day)
  ) {
    return null;
  }

  const parsed = new Date(year, month - 1, day, 12, 0, 0, 0);

  if (
    parsed.getFullYear() !== year ||
    parsed.getMonth() !== month - 1 ||
    parsed.getDate() !== day
  ) {
    return null;
  }

  return parsed;
}

export function toIsoDateInput(value: string) {
  const parsed = parseDateInputValue(value);

  if (!parsed) {
    return null;
  }

  return parsed.toISOString();
}

export function isValidDateInput(value: string) {
  return parseDateInputValue(value) !== null;
}
