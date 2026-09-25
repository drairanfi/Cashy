export function formatCurrency(value: number): string {
  return `$${value.toLocaleString('es-CO', { maximumFractionDigits: 0 })}`;
}

export function formatCurrencyCOP(value: number): string {
  return `${formatCurrency(value)} COP`;
}
