/** Formats a whole-ruble amount the way the landing page shows prices. */
export function formatPrice(value: number): string {
  return value.toLocaleString("ru-RU");
}
