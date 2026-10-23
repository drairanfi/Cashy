export function formatCurrency(value: number): string {
  return `$${value.toLocaleString('es-CO', { maximumFractionDigits: 0 })}`;
}

export function formatCurrencyCOP(value: number): string {
  return `${formatCurrency(value)} COP`;
}

export function formatDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString('es-CO', { day: '2-digit', month: 'short' });
}

/** Formatea una fecha YYYY-MM-DD sin desplazarla por zona horaria. */
export function formatDateOnly(value: string): string {
  const [year, month, day] = value.slice(0, 10).split('-').map(Number);
  if (!year || !month || !day) return '';
  return new Date(year, month - 1, day).toLocaleDateString('es-CO');
}
