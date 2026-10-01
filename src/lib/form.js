// Számmező beolvasása: a 0 is érvényes érték, csak az üres mező kap alapértéket
export function numOr(value, fallback) {
  if (value === null || value === undefined || String(value).trim() === '') return fallback;
  const n = Number(String(value).replace(',', '.'));
  return Number.isFinite(n) ? n : fallback;
}
