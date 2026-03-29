export function addDays(date: Date, amount: number) {
  const result = new Date(date);

  result.setDate(result.getDate() + amount);
  return result;
}

export function startOfLocalDay(date: Date) {
  const result = new Date(date);

  result.setHours(0, 0, 0, 0);
  return result;
}

export function toDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

export function parseDate(value: string | Date) {
  return value instanceof Date ? new Date(value) : new Date(value);
}

export function isValidDate(value: Date) {
  return !Number.isNaN(value.getTime());
}
